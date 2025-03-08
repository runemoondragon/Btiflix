import { parseStringPromise } from 'xml2js';
import fs from 'fs/promises';
import path from 'path';
import { fetchMovieDetails } from '../services/scraper';
import { insertMovie, MovieData, updateScraperStatus } from '../db/movieRepository';

interface ScraperResult {
  processedCount: number;
  lastProcessedIndex: number;
}

async function parseXMLFile(filePath: string) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return parseStringPromise(content);
  } catch (error) {
    console.error(`Error reading XML file ${filePath}:`, error);
    throw error;
  }
}

export async function getMoviesFromSitemaps(startIndex = 0): Promise<ScraperResult> {
  const listPath = path.join(process.cwd(), 'src', 'sitemaps');
  const movies: MovieData[] = [];
  let lastProcessedIndex = startIndex;
  
  try {
    await updateScraperStatus(true);
    
    // Only process sitemap-list-1.xml for now
    const sitemapFile = 'sitemap-list-1.xml';
    console.log(`📖 Reading sitemap file: ${sitemapFile}`);
    
    const movieListSitemap = await parseXMLFile(path.join(listPath, sitemapFile));
    
    if (!movieListSitemap?.urlset?.url) {
      console.error(`❌ Invalid sitemap format in ${sitemapFile}`);
      return { processedCount: 0, lastProcessedIndex };
    }

    // Get all movie URLs without limit
    const movieUrls = movieListSitemap.urlset.url
      .filter((url: any) => url.loc[0].includes('/movie/'))
      .slice(startIndex);

    console.log(`🎬 Found ${movieUrls.length} movie URLs to process in ${sitemapFile}`);

    // Process movies with progress tracking
    for (const [index, url] of movieUrls.entries()) {
      try {
        const movieUrl = url.loc[0];
        console.log(`⏳ Processing (${index + 1}/${movieUrls.length}): ${movieUrl}`);
        
        const details = await fetchMovieDetails(movieUrl);
        
        const movieData: MovieData = {
          id: details.dataId || 'N/A',
          title: details.title || 'Unknown',
          genre: details.genre || 'Unknown',
          quality: details.quality || 'HD',
          rating: details.rating || 'N/A',
          overview: details.overview || 'No description',
          released: details.released || 'Unknown',
          casts: details.casts || 'Unknown',
          duration: details.duration || 'Unknown',
          country: details.country || 'Unknown',
          thumbnailUrl: details.thumbnailUrl || '',
          backgroundUrl: details.backgroundUrl || '',
          watchLink: details.watchLink || movieUrl,
        };

        // Save to database
        await insertMovie(movieData);
        movies.push(movieData);
        lastProcessedIndex = startIndex + index + 1;

        // Add a small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error processing movie:`, error);
        continue; // Skip to next movie on error
      }
    }

    console.log(`✅ Successfully processed ${movies.length} movies`);
    await updateScraperStatus(false);
    
    return {
      processedCount: movies.length,
      lastProcessedIndex
    };
    
  } catch (error) {
    console.error('❌ Error in getMoviesFromSitemaps:', error);
    await updateScraperStatus(false);
    return {
      processedCount: movies.length,
      lastProcessedIndex
    };
  }
}

// Call the function when the script is run directly
if (require.main === module) {
  console.log('🚀 Starting movie scraping process from index 120...');
  getMoviesFromSitemaps(120)
    .then(result => {
      console.log(`✅ Completed! Processed ${result.processedCount} movies.`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

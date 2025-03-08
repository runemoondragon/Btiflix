import { parseStringPromise } from 'xml2js';
import fs from 'fs/promises';
import path from 'path';
import { fetchMovieDetails } from '../services/scraper';
import { insertMovie, MovieData } from '../db/movieRepository';

async function parseXMLFile(filePath: string) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return parseStringPromise(content);
  } catch (error) {
    console.error(`Error reading XML file ${filePath}:`, error);
    throw error;
  }
}

export async function getMoviesFromSitemaps(): Promise<MovieData[]> {
  const listPath = path.join(process.cwd(), 'src', 'sitemaps');
  const movies: MovieData[] = [];
  
  try {
    // Test with just sitemap-list-1.xml
    const sitemapFile = 'sitemap-list-1.xml';
    console.log(`📖 Reading sitemap file: ${sitemapFile}`);
    
    const movieListSitemap = await parseXMLFile(path.join(listPath, sitemapFile));
    
    if (!movieListSitemap?.urlset?.url) {
      console.error('❌ Invalid sitemap format');
      return [];
    }

    // Filter movie URLs and limit to 120
    const movieUrls = movieListSitemap.urlset.url
      .filter((url: any) => url.loc[0].includes('/movie/'))
      .slice(0, 120);

    console.log(`🎬 Found ${movieUrls.length} movie URLs to process`);

    // Process movies with progress tracking
    let processed = 0;
    for (const url of movieUrls) {
      try {
        const movieUrl = url.loc[0];
        console.log(`⏳ Processing (${++processed}/${movieUrls.length}): ${movieUrl}`);
        
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

        // Add a small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Error processing movie:`, error);
        continue; // Skip to next movie on error
      }
    }

    console.log(`✅ Successfully processed ${movies.length} movies`);
    return movies;
    
  } catch (error) {
    console.error('❌ Error in getMoviesFromSitemaps:', error);
    return movies;
  }
}

// Call the function when the script is run directly
if (require.main === module) {
  console.log('🚀 Starting movie scraping process...');
  getMoviesFromSitemaps()
    .then(movies => {
      console.log(`✅ Completed! Processed ${movies.length} movies.`);
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}

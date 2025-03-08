import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { parseStringPromise } from 'xml2js';
import { fetchMovieDetails } from '../services/scraper'; // Ensure scraper.ts exists in services/

export async function getMovies(req: Request, res: Response) {
    const search = req.query.search?.toString().toLowerCase();
    const limit = Math.min(parseInt(String(req.query.limit) || '120'), 120);

    let movies = await loadAllMovies();

    if (search) {
        movies = movies.filter(movie => 
            movie.title.toLowerCase().includes(search) || 
            movie.genre.toLowerCase().includes(search) ||
            movie.id.toLowerCase().includes(search)
        );
    }

    return res.json(movies.slice(0, limit));
}

async function loadAllMovies() {
    const listPath = path.join(process.cwd(), 'public', 'sitemaps');
    let allMovies: any[] = [];

    for (let i = 1; i <= 30; i++) {
        try {
            const movieListSitemap = await parseXMLFile(path.join(listPath, `sitemap-list-${i}.xml`));
            const movies = await extractMoviesFromSitemap(movieListSitemap);
            allMovies.push(...movies);

            if (allMovies.length >= 120) break;
        } catch (error) {
            console.error(`Error parsing sitemap-list-${i}.xml:`, error);
        }
    }

    return allMovies.slice(0, 120);
}

async function extractMoviesFromSitemap(sitemap: any) {
    const movies = await Promise.all(
        sitemap.urlset.url
            .filter((url: any) => url.loc[0].includes('/movie/watch-')) // ✅ Explicitly define `url` as `any`
            .map(async (url: any) => { // ✅ Explicitly define `url` as `any`
                const movieUrl: string = url.loc[0];

                // Fetch movie details from the scraper
                const details = await fetchMovieDetails(movieUrl);

                return {
                    id: details?.dataId || 'N/A',
                    title: formatTitle(movieUrl),
                    genre: details?.genre || 'Unknown',
                    quality: details?.quality || 'HD',
                    rating: details?.rating || 'N/A',
                    thumbnailUrl: details?.thumbnailUrl || '',
                    watchLink: details?.watchLink || movieUrl,
                };
            })
    );

    console.log("Stored Movies:", movies.map(movie => `${movie.title} - ID: ${movie.id}`)); // Debugging
    return movies.filter(Boolean);
}

function formatTitle(url: string) {
    return url
        .split('/movie/watch-')[1]
        .replace(/-\d{4}-\d+$/, '')
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

async function parseXMLFile(filePath: string) {
    const content = await fs.readFile(filePath, 'utf-8');
    return parseStringPromise(content);
}

import { fetchMovieDetails } from './src/services/scraper';

async function testScraper() {
    const movieUrl = "https://123moviestv.net/movie/watch-halloween-candy-2025-121009";
    
    try {
        const details = await fetchMovieDetails(movieUrl);
        console.log("✅ Scraper Output:", details);
    } catch (error) {
        console.error("❌ Scraper Error:", error);
    }
}

testScraper();

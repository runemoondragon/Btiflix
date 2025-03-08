import { fetchMovieDetails } from "./utils/scraper";

async function testFetchMovieDetails() {
    const movieUrl = "https://123moviestv.net/watch-movie/watch-fight-or-flight-2025-121297.10973761"; // Example movie URL

    try {
        const details = await fetchMovieDetails(movieUrl);
        console.log("Fetched Movie Details:", details);
    } catch (error) {
        console.error("Error fetching movie details:", error);
    }
}

testFetchMovieDetails();

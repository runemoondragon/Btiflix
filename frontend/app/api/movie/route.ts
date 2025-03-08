import { NextResponse } from 'next/server';

const BACKEND_API_URL = 'http://localhost:3001/api/movies'; // Backend API URL

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title');

    if (!title) {
        return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    try {
        // Fetch movie from backend API using exact title match
        const backendResponse = await fetch(`${BACKEND_API_URL}?search=${encodeURIComponent(title)}`);
        
        if (!backendResponse.ok) {
            throw new Error(`Backend API Error: ${backendResponse.status}`);
        }

        const movies = await backendResponse.json();
        
        // Find exact title match (case-insensitive)
        const movie = Array.isArray(movies) ? 
            movies.find(m => m.title.toLowerCase() === title.toLowerCase()) : null;

        if (!movie) {
            return NextResponse.json({ error: "Movie not found" }, { status: 404 });
        }

        // Transform property names to camelCase
        const transformedMovie = {
            ...movie,
            thumbnailUrl: movie.thumbnailurl || movie.thumbnailUrl,
            backgroundUrl: movie.backgroundurl || movie.backgroundUrl,
            watchLink: movie.watchlink || movie.watchLink
        };

        return NextResponse.json(transformedMovie);
    } catch (error) {
        console.error("⚠️ Error fetching movie from backend:", error);
        return NextResponse.json({ error: "Failed to fetch movie" }, { status: 500 });
    }
}

import { NextResponse } from 'next/server';

const BACKEND_API_URL = 'http://localhost:3001/api/movies'; // Updated to correct port

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const rawSearch = searchParams.get('search')?.trim().toLowerCase();
    const movieId = searchParams.get('id')?.trim();
    const limit = Math.min(parseInt(searchParams.get('limit') || '1200'), 1200);

    console.log("🔍 Search Request Received - Query:", rawSearch || movieId);

    try {
        // ✅ Fetch movies from the backend
        const backendResponse = await fetch(`${BACKEND_API_URL}?search=${rawSearch || ''}&id=${movieId || ''}&limit=${limit}`);
        
        if (!backendResponse.ok) {
            throw new Error(`Backend API Error: ${backendResponse.status}`);
        }

        const movies = await backendResponse.json();
        
        // Transform property names to camelCase
        const transformedMovies = Array.isArray(movies) ? movies.map(movie => ({
            ...movie,
            thumbnailUrl: movie.thumbnailurl || movie.thumbnailUrl,
            backgroundUrl: movie.backgroundurl || movie.backgroundUrl,
            watchLink: movie.watchlink || movie.watchLink
        })) : [];

        return NextResponse.json(transformedMovies);
    } catch (error) {
        console.error("⚠️ Error fetching movies from backend:", error);
        return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 });
    }
}

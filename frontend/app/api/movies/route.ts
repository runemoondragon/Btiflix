import { NextResponse } from 'next/server';

const BACKEND_API_URL = 'http://localhost:3001/api';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract filter parameters
    const search = searchParams.get('q')?.trim();
    const genre = searchParams.get('genre')?.trim();
    const quality = searchParams.get('quality')?.trim();
    const rating = searchParams.get('min_rating')?.trim();
    const year = searchParams.get('release_year')?.trim();
    const limit = searchParams.get('limit') || '100';

    // Build query parameters for backend
    const queryParams = new URLSearchParams();
    
    // Only add parameters if they have values
    if (search) queryParams.append('q', search.toLowerCase());
    if (genre) queryParams.append('genre', genre);
    if (quality) queryParams.append('quality', quality.toUpperCase());
    if (rating) queryParams.append('min_rating', rating.replace(/[^0-9]/g, ''));
    if (year) queryParams.append('release_year', year);
    if (limit) queryParams.append('limit', limit);

    const backendUrl = `${BACKEND_API_URL}/movies?${queryParams}`;
    
    console.log('🎯 Making request to backend:', {
      url: backendUrl,
      params: Object.fromEntries(queryParams.entries()),
      originalParams: Object.fromEntries(searchParams.entries()),
      processedFilters: {
        search,
        genre,
        quality,
        rating,
        year,
        limit
      }
    });

    // Fetch movies from backend with filters
    const response = await fetch(backendUrl);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Backend API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
        url: backendUrl
      });
      throw new Error(`Backend API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    console.log('✅ Backend response:', {
      url: backendUrl,
      totalMovies: Array.isArray(data) ? data.length : 0,
      filters: {
        search: search,
        genre: genre,
        quality: quality,
        rating: rating,
        year: year,
        limit: limit
      },
      sample: Array.isArray(data) && data.length > 0 ? {
        title: data[0].title,
        genre: data[0].genre,
        quality: data[0].quality,
        rating: data[0].rating,
        appliedFilters: Object.fromEntries(queryParams.entries())
      } : null
    });

    // Transform response to match frontend needs
    const movies = Array.isArray(data) ? data.map(movie => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      rating: movie.rating,
      quality: movie.quality,
      thumbnailUrl: movie.thumbnailurl,
      backgroundUrl: movie.backgroundurl,
      genre: movie.genre,
      released: movie.released,
      watchLink: movie.watchlink
    })) : [];

    return NextResponse.json(movies);
  } catch (error) {
    console.error('❌ Detailed error in movies API:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      params: Object.fromEntries(new URL(request.url).searchParams.entries())
    });
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch movies' }, 
      { status: 500 }
    );
  }
}

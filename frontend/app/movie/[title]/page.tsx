'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Movie {
  id: string;
  title: string;
  overview: string;
  rating: string;
  quality: string;
  thumbnailUrl: string;
  backgroundUrl: string;
  genre: string;
  released: string;
  duration: string;
  country: string;
  casts: string;
  watchLink: string;
}

export default function MoviePage() {
  const params = useParams();
  
  // ✅ Ensure title is properly formatted & extracted
  const rawTitle = Array.isArray(params?.title) ? params.title[0] : params?.title || "";
  const formattedTitle = decodeURIComponent(rawTitle).replace(/-/g, " "); // ✅ Handle URL encoding issues

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!formattedTitle) return;

    const fetchMovieDetails = async () => {
      try {
        const res = await fetch(`/api/movie?title=${encodeURIComponent(formattedTitle)}`);
        if (!res.ok) {
          throw new Error("Movie not found");
        }
        const data = await res.json();
        setMovie(data);
      } catch (error) {
        console.error("Error fetching movie:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [formattedTitle]);

  if (loading) return <div className="text-center text-white text-lg">Loading...</div>;
  if (!movie) return <div className="text-center text-red-500 text-lg">Movie not found</div>;

  return (
    <div className="relative min-h-screen bg-black text-white flex justify-center items-center px-6">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-50"
        style={{ backgroundImage: `url(${movie.backgroundUrl})` }}
      />

      {/* Movie Content (Centered) */}
      <div className="relative z-10 flex flex-col md:flex-row gap-10 max-w-screen-xl w-full bg-black/70 p-8 rounded-lg shadow-lg">
        {/* Poster */}
        <img 
          src={movie.thumbnailUrl}
          alt={movie.title}
          className="w-72 h-auto rounded-lg shadow-lg self-center"
        />

        {/* Movie Details */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl font-bold">{movie.title}</h1>
          <div className="flex justify-center md:justify-start items-center gap-4 mt-2">
            <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold">★ {movie.rating}</span>
            <span className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold">{movie.quality}</span>
          </div>
          <p className="text-gray-300 mt-4">{movie.overview}</p>

          <div className="mt-6 text-gray-400 space-y-2 text-sm">
            <p><strong>Released:</strong> {movie.released ? new Date(movie.released).toISOString().split('T')[0] : 'N/A'}</p>
            <p><strong>Genre:</strong> {movie.genre}</p>
            <p><strong>Duration:</strong> {movie.duration} min</p>
            <p><strong>Country:</strong> {movie.country}</p>
            <p><strong>Casts:</strong> {movie.casts}</p>
          </div>

          {/* Watch Now Button (Centered) */}
          <div className="mt-6">
            <a 
              href={movie.watchLink} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-green-500 text-white px-8 py-3 rounded-md inline-block text-lg font-semibold hover:bg-green-600 transition"
            >
              ▶ Watch Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

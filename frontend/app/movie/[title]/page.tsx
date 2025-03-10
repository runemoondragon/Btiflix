'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Play, Star, Clock, Globe, Users, ChevronLeft } from 'lucide-react';

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
  const router = useRouter();
  const rawTitle = Array.isArray(params?.title) ? params.title[0] : params?.title || "";
  const formattedTitle = decodeURIComponent(rawTitle).replace(/-/g, " ");

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

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-black/70">
        <div className="space-y-2 text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-400 text-xs">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-black/70">
        <h1 className="text-gray-400 text-sm mb-4">Movie not found</h1>
        <button
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-xs text-white bg-gray-800/50 px-4 py-2 rounded-full hover:bg-gray-700/50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-white flex justify-center items-center px-6">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-50"
        style={{ backgroundImage: `url(${movie.backgroundUrl})` }}
      />

      {/* Movie Content Card */}
      <div className="relative z-10 flex flex-col md:flex-row gap-10 max-w-screen-xl w-full bg-black/70 p-8 rounded-lg shadow-lg backdrop-blur-sm">
        {/* Poster */}
        <div className="md:w-1/3 lg:w-1/4">
          <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-2xl">
            <img 
              src={movie.thumbnailUrl}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Movie Details */}
        <div className="flex-1 space-y-6">
          {/* Title and Tags */}
          <div className="space-y-4">
            <h1 className="text-2xl md:text-4xl font-bold">{movie.title}</h1>
            <div className="flex flex-wrap gap-2 text-[10px]">
              {movie.quality && (
                <span className="bg-blue-500 text-white px-2 py-0.5 rounded">
                  {movie.quality}
                </span>
              )}
              {movie.genre && (
                <span className="bg-gray-800 text-white px-2 py-0.5 rounded">
                  {movie.genre}
                </span>
              )}
              {movie.rating && (
                <span className="bg-orange-500 text-white px-2 py-0.5 rounded flex items-center gap-1">
                  IMDB: {movie.rating}
                </span>
              )}
            </div>
          </div>

          {/* Movie Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            {movie.released && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-400">Release Date</p>
                  <p className="text-white">{new Date(movie.released).toLocaleDateString()}</p>
                </div>
              </div>
            )}
            {movie.duration && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-400">Duration</p>
                  <p className="text-white">{movie.duration} min</p>
                </div>
              </div>
            )}
            {movie.country && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-400">Country</p>
                  <p className="text-white">{movie.country}</p>
                </div>
              </div>
            )}
            {movie.casts && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-gray-400">Cast</p>
                  <p className="text-white truncate">{movie.casts}</p>
                </div>
              </div>
            )}
          </div>

          {/* Overview */}
          <div className="space-y-2">
            <h2 className="text-xs font-medium text-gray-400">Overview</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              {movie.overview || 'No overview available.'}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={() => window.open(movie.watchLink, '_blank')}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full text-xs font-medium transition-colors"
            >
              <Play className="w-4 h-4" />
              Watch Now
            </button>
            <a
              href={movie.watchLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-700/50 text-white px-6 py-3 rounded-full text-xs font-medium transition-colors"
            >
              More Info
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

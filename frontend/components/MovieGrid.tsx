'use client'

import React, { useEffect, useState, useCallback } from 'react'
import debounce from 'lodash/debounce'
import { useRouter } from 'next/navigation'

interface Movie {
  id: string;
  title: string;
  released: number;
  platform?: string;
  thumbnailUrl: string;
  genre?: string;
  quality?: string;
  rating?: string;
}

export default function MovieGrid() {
  const [movies, setMovies] = useState<Movie[]>([]) // ✅ Ensures movies is always an array
  const [search, setSearch] = useState('')
  const router = useRouter() // ✅ Use router for navigation

  const fetchMovies = useCallback(
    debounce(async (searchTerm: string) => {
      try {
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        params.append('limit', '102')

        const res = await fetch(`/api/movies?${params}`)
        const data = await res.json()

        // ✅ Ensure we only set valid array responses
        setMovies(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error fetching movies:", error)
        setMovies([]) // ✅ Fallback to empty array on failure
      }
    }, 300),
    []
  )

  useEffect(() => {
    fetchMovies(search)
  }, [search, fetchMovies]) // ✅ Proper dependency array

  return (
    <div className="relative min-h-screen pb-20">
      {/* Movie Grid */}
      {movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-4 p-8">
          {movies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => router.push(`/movie/${encodeURIComponent(movie.title)}`)}
              className="group relative overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105 focus:outline-none cursor-pointer"
              style={{ width: '183px', height: '253px' }}
            >
              <div className="relative w-full h-full">
                {/* Movie Thumbnail */}
                <img 
                  src={movie.thumbnailUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover rounded-md"
                />

                {/* Hover Effect - Movie Info */}
                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 flex flex-col justify-end">
                  <div className="flex items-center justify-between text-gray-300 text-xs mt-1">
                    <span>{movie.genre || 'Unknown'}</span>
                    <span>{movie.released ? new Date(movie.released).getFullYear() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500 mt-10">No movies found.</p> // ✅ Graceful handling of empty results
      )}
    </div>
  )
}

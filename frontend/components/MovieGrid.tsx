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

interface Filters {
  genre: string;
  quality: string;
  rating: string;
}

export default function MovieGrid() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState<Filters>({
    genre: '',
    quality: '',
    rating: ''
  })
  const router = useRouter()

  const fetchMovies = useCallback(
    debounce(async (searchTerm: string, currentFilters: Filters) => {
      try {
        const params = new URLSearchParams()
        if (searchTerm) params.append('search', searchTerm)
        if (currentFilters.genre) params.append('genre', currentFilters.genre)
        if (currentFilters.quality) params.append('quality', currentFilters.quality)
        if (currentFilters.rating) params.append('rating', currentFilters.rating)
        params.append('limit', '102')

        const res = await fetch(`/api/movies?${params}`)
        const data = await res.json()
        setMovies(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error("Error fetching movies:", error)
        setMovies([])
      }
    }, 300),
    []
  )

  useEffect(() => {
    fetchMovies(search, filters)
  }, [search, filters, fetchMovies])

  // Subscribe to navigation events for filter updates
  useEffect(() => {
    const handleNavigation = (e: CustomEvent) => {
      const newFilters = e.detail?.filters
      if (newFilters) {
        setFilters(newFilters)
      }
      const newSearch = e.detail?.search
      if (typeof newSearch === 'string') {
        setSearch(newSearch)
      }
    }

    window.addEventListener('updateFilters' as any, handleNavigation)
    return () => window.removeEventListener('updateFilters' as any, handleNavigation)
  }, [])

  return (
    <div className="relative min-h-screen pb-20">
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
                <img 
                  src={movie.thumbnailUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover rounded-md"
                />

                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-2 flex flex-col justify-end">
                  <h3 className="text-white text-xs font-medium truncate mb-1">{movie.title}</h3>
                  <div className="flex items-center justify-between text-gray-300 text-[10px] mt-1">
                    <span>{movie.genre || 'Unknown'}</span>
                    <span>{movie.released ? new Date(movie.released).getFullYear() : 'N/A'}</span>
                  </div>
                  {movie.rating && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                      ★ {movie.rating}
                    </div>
                  )}
                  {movie.quality && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded">
                      {movie.quality}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-[50vh] text-gray-500">
          <p className="text-sm mb-2">No movies found</p>
          <p className="text-xs">Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  )
}

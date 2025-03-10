'use client'

import React, { useEffect, useState, useCallback } from 'react'
import debounce from 'lodash/debounce'
import { useRouter } from 'next/navigation'

interface Movie {
  id: string;
  title: string;
  released: string;
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
  year: string;
}

const YEARS = Array.from({ length: 25 }, (_, i) => (new Date().getFullYear() - i).toString());

export default function MovieGrid() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({
    genre: '',
    quality: '',
    rating: '',
    year: ''
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const fetchMovies = useCallback(
    debounce(async (searchTerm: string, currentFilters: Filters) => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        
        // Add search parameter
        if (searchTerm?.trim()) {
          params.append('q', searchTerm.trim())
        }
        
        // Add filter parameters
        if (currentFilters.genre?.trim()) {
          params.append('genre', currentFilters.genre.trim())
        }
        if (currentFilters.quality?.trim()) {
          params.append('quality', currentFilters.quality.trim().toUpperCase())
        }
        if (currentFilters.rating?.trim()) {
          const numericRating = currentFilters.rating.replace(/[^0-9]/g, '')
          params.append('min_rating', numericRating)
        }
        if (currentFilters.year?.trim()) {
          params.append('release_year', currentFilters.year.trim())
        }
        
        // Always add limit
        params.append('limit', '102')

        console.log('Fetching movies with params:', {
          searchTerm,
          filters: currentFilters,
          queryParams: Object.fromEntries(params.entries())
        })

        const res = await fetch(`/api/movies?${params}`)
        
        if (!res.ok) {
          const errorText = await res.text()
          console.error('Error response:', errorText)
          throw new Error(`Failed to fetch movies: ${errorText}`)
        }
        
        const data = await res.json()
        
        if (!Array.isArray(data)) {
          console.error('Invalid response format:', data)
          throw new Error('Invalid response format from server')
        }

        // Filter the movies based on current filters
        const filteredMovies = data.filter(movie => {
          // Check genre match
          if (currentFilters.genre && !movie.genre?.includes(currentFilters.genre)) {
            return false;
          }

          // Check quality match
          if (currentFilters.quality && movie.quality !== currentFilters.quality) {
            return false;
          }

          // Check rating match
          if (currentFilters.rating) {
            const minRating = parseFloat(currentFilters.rating.replace(/[^0-9]/g, ''));
            const movieRating = parseFloat(movie.rating || '0');
            if (isNaN(movieRating) || movieRating < minRating) {
              return false;
            }
          }

          // Check year match
          if (currentFilters.year) {
            const movieYear = movie.released ? new Date(movie.released).getFullYear().toString() : '';
            if (movieYear !== currentFilters.year) {
              return false;
            }
          }

          return true;
        });
        
        // Log the filtering results
        console.log('🎬 Filtering results:', {
          totalMovies: data.length,
          filteredMovies: filteredMovies.length,
          appliedFilters: currentFilters,
          firstMovie: filteredMovies[0] ? {
            title: filteredMovies[0].title,
            genre: filteredMovies[0].genre,
            quality: filteredMovies[0].quality,
            rating: filteredMovies[0].rating,
            released: filteredMovies[0].released
          } : null
        });

        setMovies(filteredMovies);
      } catch (error) {
        console.error("Error fetching movies:", error)
        setMovies([])
      } finally {
        setLoading(false)
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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder.jpg' // Make sure to add a placeholder image in your public folder
  }

  return (
    <div className="relative min-h-screen pb-20">
      {loading ? (
        <div className="flex justify-center items-center h-[50vh]">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-4 p-8">
          {movies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => router.push(`/movie/${encodeURIComponent(movie.title)}`)}
              className="group relative overflow-hidden rounded-lg transition-transform duration-300 hover:scale-105 focus:outline-none cursor-pointer"
              style={{ width: '183px', height: '253px' }}
            >
              <div className="relative w-full h-full">
                {movie.thumbnailUrl ? (
                  <img 
                    src={movie.thumbnailUrl}
                    alt={movie.title}
                    onError={handleImageError}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-800 flex items-center justify-center rounded-md">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}

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

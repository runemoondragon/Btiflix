'use client'

import React, { useState, useEffect } from 'react'
import { PlayCircleIcon } from '@heroicons/react/24/solid' // ✅ Heroicons v2 Import

interface HeroMovie {
  id: string
  title: string
  overview?: string
  rating?: string
  quality?: string
  thumbnailUrl: string
  backgroundUrl: string
  watchLink: string // ✅ Added Watch Link
}

export default function HeroSlider() {
  const [movies, setMovies] = useState<HeroMovie[]>([]) // ✅ Ensures it's always an array
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch('/api/movies?limit=6') // ✅ Fetch 6 movies (1 main + 5 side)
        const data = await response.json()

        setMovies(Array.isArray(data) ? data : []) // ✅ Ensure data is always an array
      } catch (error) {
        console.error('Failed to fetch movies:', error)
        setMovies([])
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % movies.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + movies.length) % movies.length)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] w-full bg-gray-800">
        <span className="text-white text-lg">Loading Hero Movies...</span>
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="flex justify-center items-center h-[70vh] w-full bg-gray-800">
        <span className="text-white text-lg">No hero movies available.</span>
      </div>
    )
  }

  const mainMovie = movies[currentSlide] // ✅ Main displayed movie
  const sideMovies = movies.filter((_, index) => index !== currentSlide) // ✅ Side recommendations

  return (
    <div className="relative w-full h-[75vh] flex bg-black">
      {/* Left Side - Main Movie */}
      <div className="relative w-[70%] h-full overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
          style={{ backgroundImage: `url(${mainMovie?.backgroundUrl || ''})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />

        {/* Movie Details */}
        <div className="absolute bottom-10 left-10 text-white w-3/4">
          <div className="flex items-center space-x-4 mb-2">
            <span className="bg-green-500 text-white px-3 py-1 rounded text-sm font-semibold">
              ★ {mainMovie?.rating || 'N/A'}
            </span>
            <span className="bg-blue-500 text-white px-3 py-1 rounded text-sm font-semibold">
              {mainMovie?.quality || 'HD'}
            </span>
          </div>

          <h1 className="text-5xl font-bold mb-4">{mainMovie?.title || 'Unknown Title'}</h1>
          <p className="text-gray-300 max-w-2xl mb-6">
            {mainMovie?.overview?.slice(0, 250) || 'No description available.'}
          </p>

          {/* Play Button (✅ Now Uses <a href> for navigation) */}
          <a 
            href={mainMovie?.watchLink || '#'} 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <PlayCircleIcon className="w-16 h-16 text-green-500 hover:text-green-400 transition cursor-pointer" />
          </a>
        </div>

        {/* Navigation Arrows */}
        {movies.length > 1 && (
          <>
            <button 
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/40 transition"
            >
              ←
            </button>
            <button 
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 text-white p-3 rounded-full hover:bg-white/40 transition"
            >
              →
            </button>
          </>
        )}
      </div>

      {/* Right Side - Recommended Movies (Up to 5 Movies) */}
      <div className="w-[30%] h-full bg-gray-900 p-6 flex flex-col">
        <h2 className="text-xl font-semibold text-white mb-4">Top Picks</h2>

        <div className="space-y-4">
          {sideMovies.slice(0, 5).map((movie) => (
            <div key={movie.id} className="flex space-x-4 items-center">
              <img 
                src={movie.thumbnailUrl || ''}
                alt={movie.title}
                className="w-20 h-28 object-cover rounded-md"
              />
              <div className="text-white flex-1">
                <h3 className="font-semibold text-lg">{movie.title}</h3>
                <p className="text-gray-400 text-sm">
                  {movie.overview ? `${movie.overview.slice(0, 80)}...` : 'No overview available.'}
                </p>
                <a 
                  href={movie.watchLink || '#'} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-500 font-semibold text-sm mt-1 inline-block hover:underline"
                >
                  ▶ Watch now
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

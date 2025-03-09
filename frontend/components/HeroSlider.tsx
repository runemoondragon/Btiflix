'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'

interface HeroMovie {
  id: string
  title: string
  overview?: string
  rating?: string
  quality?: string
  thumbnailUrl: string
  backgroundUrl: string
  watchLink: string
  genre?: string
}

const FEATURED_MOVIES = [
  "Andrew Schulz: LIFE",
  "Flight Risk",
  "My Fault: London",
  "Diddy: The Making of a Bad Boy",
  "You're Cordially Invited",
  "Back in Action",
  "Online Selling"
];

export default function HeroSlider() {
  const [movies, setMovies] = useState<HeroMovie[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [direction, setDirection] = useState<'left' | 'right'>('right')
  const router = useRouter()

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const moviePromises = FEATURED_MOVIES.map(title =>
          fetch(`/api/movie?title=${encodeURIComponent(title)}`).then(res => res.json())
        )
        const results = await Promise.all(moviePromises)
        const validMovies = results.filter(movie => !movie.error)
        setMovies(validMovies)
      } catch (error) {
        console.error('Failed to fetch movies:', error)
        setMovies([])
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [])

  const changeSlide = (newIndex: number, slideDirection: 'left' | 'right') => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setDirection(slideDirection)
    
    setTimeout(() => {
      setCurrentSlide(newIndex)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 50)
    }, 500)
  }

  const nextSlide = () => {
    if (isTransitioning) return
    const newIndex = (currentSlide + 1) % movies.length
    changeSlide(newIndex, 'right')
  }

  const prevSlide = () => {
    if (isTransitioning) return
    const newIndex = (currentSlide - 1 + movies.length) % movies.length
    changeSlide(newIndex, 'left')
  }

  // Auto-advance slides every 15 seconds
  useEffect(() => {
    if (movies.length <= 1) return
    const timer = setInterval(nextSlide, 10000)
    return () => clearInterval(timer)
  }, [movies.length, currentSlide, isTransitioning])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh] w-full bg-gray-900/95 backdrop-blur-sm">
        <span className="text-white text-xs">Loading featured movies...</span>
      </div>
    )
  }

  if (movies.length === 0) {
    return (
      <div className="flex justify-center items-center h-[70vh] w-full bg-gray-900/95 backdrop-blur-sm">
        <span className="text-white text-xs">Featured movies unavailable.</span>
      </div>
    )
  }

  const mainMovie = movies[currentSlide]
  const sideMovies = movies.filter((_, index) => index !== currentSlide)

  return (
    <div className="relative w-full h-[75vh] flex bg-black overflow-hidden">
      {/* Left Side - Main Movie */}
      <div className="relative w-full lg:w-[70%] h-full overflow-hidden">
        {/* Current Slide */}
        <div 
          className={`absolute inset-0 transform transition-transform duration-500 ease-in-out ${
            isTransitioning 
              ? direction === 'right' 
                ? '-translate-x-full' 
                : 'translate-x-full'
              : 'translate-x-0'
          }`}
        >
          {/* Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${mainMovie?.backgroundUrl || ''})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />

          {/* Movie Details */}
          <div className={`absolute bottom-10 left-10 text-white w-3/4 transform transition-all duration-500 ease-in-out ${
            isTransitioning ? 'opacity-0' : 'opacity-100'
          }`}>
            {/* Metadata Tags */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {mainMovie?.rating && (
                <span className="bg-orange-500 text-white px-2 py-0.5 rounded text-[10px] font-medium">
                  ★ {mainMovie.rating}
                </span>
              )}
              {mainMovie?.quality && (
                <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-[10px] font-medium">
                  {mainMovie.quality}
                </span>
              )}
              {mainMovie?.genre && (
                <span className="bg-gray-800 text-white px-2 py-0.5 rounded text-[10px] font-medium">
                  {mainMovie.genre}
                </span>
              )}
            </div>

            <h1 className="text-2xl md:text-4xl font-bold mb-2">{mainMovie?.title}</h1>
            <p className="text-gray-300 text-xs md:text-sm max-w-2xl mb-6 line-clamp-3">
              {mainMovie?.overview || 'No description available.'}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push(`/movie/${encodeURIComponent(mainMovie.title)}`)}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-full text-xs font-medium transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Watch Now</span>
              </button>
              <a
                href={mainMovie?.watchLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-300 hover:text-white transition-colors"
              >
                More Info
              </a>
            </div>
          </div>
        </div>

        {/* Next Slide (for transition) */}
        {isTransitioning && (
          <div 
            className={`absolute inset-0 transform transition-transform duration-500 ease-in-out ${
              direction === 'right'
                ? 'translate-x-full translate-x-0'
                : '-translate-x-full translate-x-0'
            }`}
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ 
                backgroundImage: `url(${
                  movies[
                    direction === 'right'
                      ? (currentSlide + 1) % movies.length
                      : (currentSlide - 1 + movies.length) % movies.length
                  ]?.backgroundUrl || ''
                })` 
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
          </div>
        )}

        {/* Navigation Arrows */}
        {movies.length > 1 && (
          <>
            <button 
              onClick={prevSlide}
              disabled={isTransitioning}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed z-10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={nextSlide}
              disabled={isTransitioning}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full transition-colors backdrop-blur-sm disabled:opacity-50 disabled:cursor-not-allowed z-10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Slide Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {movies.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                if (isTransitioning || index === currentSlide) return
                changeSlide(index, index > currentSlide ? 'right' : 'left')
              }}
              disabled={isTransitioning}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-orange-500 w-4' 
                  : 'bg-gray-400/50 hover:bg-gray-400 disabled:hover:bg-gray-400/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Right Side - Recommended Movies */}
      <div className="hidden lg:block w-[30%] h-full bg-gray-900/95 backdrop-blur-sm p-4 border-l border-gray-800">
        <h2 className="text-xs font-medium text-white mb-4">Featured Movies</h2>

        <div className="space-y-3">
          {sideMovies.map((movie) => (
            <div 
              key={movie.id} 
              onClick={() => {
                if (isTransitioning) return
                const newIndex = movies.findIndex(m => m.id === movie.id)
                if (newIndex !== -1) {
                  changeSlide(newIndex, newIndex > currentSlide ? 'right' : 'left')
                }
              }}
              className={`flex gap-3 items-start cursor-pointer group transition-opacity duration-300 ${
                isTransitioning ? 'pointer-events-none opacity-50' : 'opacity-100'
              }`}
            >
              <img 
                src={movie.thumbnailUrl}
                alt={movie.title}
                className="w-16 h-24 object-cover rounded-md transition-transform group-hover:scale-105"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-white text-xs font-medium truncate group-hover:text-orange-500 transition-colors">
                  {movie.title}
                </h3>
                <p className="text-gray-400 text-[10px] mt-1 line-clamp-2">
                  {movie.overview || 'No overview available.'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {movie.rating && (
                    <span className="bg-orange-500/20 text-orange-500 px-1.5 py-0.5 rounded text-[10px]">
                      ★ {movie.rating}
                    </span>
                  )}
                  {movie.quality && (
                    <span className="bg-blue-500/20 text-blue-500 px-1.5 py-0.5 rounded text-[10px]">
                      {movie.quality}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import HeroSlider from '../components/HeroSlider'
import MovieGrid from '../components/MovieGrid'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900">
      <HeroSlider />
      <MovieGrid />
    </main>
  )
} 
'use client'
import React from 'react'

export default function SearchFilters() {
  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Search movies..."
        className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:ring-2 focus:ring-orange-500 focus:outline-none"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <select className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700">
          <option value="">All Platforms</option>
          <option value="netflix">Netflix</option>
          <option value="amazon">Amazon Prime</option>
          <option value="hulu">Hulu</option>
        </select>
        <select className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700">
          <option value="">All Genres</option>
          <option value="action">Action</option>
          <option value="comedy">Comedy</option>
          <option value="drama">Drama</option>
        </select>
        <select className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700">
          <option value="">Sort By</option>
          <option value="popular">Most Popular</option>
          <option value="recent">Recently Added</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>
    </div>
  )
} 
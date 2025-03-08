'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Home, Film, Tv, Flame } from 'lucide-react';

const GENRES = [
  'Action', 'Action & Adventure', 'Adventure', 'Animation', 'Biography', 
  'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
  'Horror', 'Kids', 'Music', 'Mystery', 'News', 'Reality', 'Romance',
  'Sci-Fi & Fantasy', 'Science Fiction', 'Soap', 'Talk', 'Thriller',
  'TV Movie', 'War', 'War & Politics', 'Western'
];

const COUNTRIES = [
  'Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada', 'China',
  'Czech Republic', 'Denmark', 'Finland', 'France', 'Germany', 'Hong Kong',
  'Hungary', 'India', 'Ireland', 'Israel', 'Italy', 'Japan', 'Luxembourg',
  'Mexico', 'Netherlands', 'New Zealand', 'Norway', 'Poland', 'Romania',
  'Russia', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland',
  'Taiwan', 'Thailand', 'United Kingdom', 'United States of America'
];

export default function Navigation() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');

  return (
    <>
      {/* Top Bar */}
      <nav className="bg-gray-900 text-white sticky top-0 z-50 flex items-center h-16 px-4">
        {/* Browse Button */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700"
        >
          <Menu className="w-5 h-5" />
          <span>Browse</span>
        </button>

        {/* Search Bar */}
        <div className="flex-1 mx-4">
          <input
            type="text"
            placeholder="Enter keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={() => setIsSidebarOpen(false)}></div>
      )}

      {/* Sidebar Menu */}
      <div 
        className={`fixed top-0 left-0 w-80 h-full bg-gray-900 text-white p-6 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 z-50 flex flex-col`}
      >
        {/* Close Button */}
        <button className="absolute top-4 right-4" onClick={() => setIsSidebarOpen(false)}>
          <X className="w-6 h-6" />
        </button>

        
        {/* Navigation Links with Icons */}
        <div className="space-y-4 mb-6 text-sm">
          <Link href="/" className="flex items-center space-x-3 hover:text-orange-500">
            <Home className="w-5 h-5" />
            <span>Home</span>
          </Link>
          <Link href="/movies" className="flex items-center space-x-3 hover:text-orange-500">
            <Film className="w-5 h-5" />
            <span>Movies</span>
          </Link>
          <Link href="/tv-shows" className="flex items-center space-x-3 hover:text-orange-500">
            <Tv className="w-5 h-5" />
            <span>TV Shows</span>
          </Link>
          <Link href="/top-imdb" className="flex items-center space-x-3 hover:text-orange-500">
            <Flame className="w-5 h-5" />
            <span>Top IMDB</span>
          </Link>
        </div>

        {/* Scrollable Content for Genres and Countries */}
        <div className="overflow-y-auto flex-1 pr-2">
          {/* Genre Section */}
          <h3 className="text-lg font-medium mb-2">Genre</h3>
          <div className="grid grid-cols-2 gap-2">
            {GENRES.map((genre) => (
              <Link 
                key={genre} 
                href={`/genre/${genre.toLowerCase()}`} 
                className="bg-gray-800 text-white text-xs px-3 py-1 rounded-md hover:bg-gray-700 text-center"
              >
                {genre}
              </Link>
            ))}
          </div>

          {/* Country Section */}
          <h3 className="text-lg font-medium mt-6 mb-2">Country</h3>
          <div className="grid grid-cols-2 gap-2">
            {COUNTRIES.map((country) => (
              <Link 
                key={country} 
                href={`/country/${country.toLowerCase()}`} 
                className="bg-gray-800 text-white text-xs px-3 py-1 rounded-md hover:bg-gray-700 text-center"
              >
                {country}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

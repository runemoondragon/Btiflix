'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Home, Film, Tv, Flame, Search, Filter, ChevronDown } from 'lucide-react';

const GENRES = [
  'Action', 'Action & Adventure', 'Adventure', 'Animation', 'Biography', 
  'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
  'Horror', 'Kids', 'Music', 'Mystery', 'News', 'Reality', 'Romance',
  'Sci-Fi & Fantasy', 'Science Fiction', 'Soap', 'Talk', 'Thriller',
  'TV Movie', 'War', 'War & Politics', 'Western'
];

const QUALITY_OPTIONS = ['HD', '4K', 'SD'];
const RATING_OPTIONS = ['9+', '8+', '7+', '6+', '5+'];
const YEARS = Array.from({ length: 25 }, (_, i) => (new Date().getFullYear() - i).toString());

export default function Navigation() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    genre: '',
    quality: '',
    rating: '',
    year: ''
  });

  // Apply filters and search with debounce
  useEffect(() => {
    const applyFilters = () => {
      // Format filters before dispatching
      const formattedFilters = {
        ...filters,
        genre: filters.genre,
        quality: filters.quality.toUpperCase(),
        rating: filters.rating ? filters.rating.replace(/[^0-9]/g, '') : '',
        year: filters.year
      };

      // Dispatch event with current filters and search
      const event = new CustomEvent('updateFilters', {
        detail: { 
          filters: formattedFilters,
          search: search.trim()
        }
      });
      window.dispatchEvent(event);

      // Log filter application for debugging
      console.log('Applying filters:', { search: search.trim(), ...formattedFilters });
    };

    const debounceTimer = setTimeout(applyFilters, 300);
    return () => clearTimeout(debounceTimer);
  }, [search, filters]);

  return (
    <>
      {/* Modern Navigation Bar */}
      <nav className="bg-gray-900/95 backdrop-blur-sm text-white sticky top-0 z-50 border-b border-gray-800">
        <div className="max-w-[2000px] mx-auto">
          <div className="flex items-center h-14 px-4 gap-4">
        {/* Browse Button */}
        <button 
          onClick={() => setIsSidebarOpen(true)}
              className="flex items-center space-x-2 hover:text-orange-500 transition-colors text-xs"
        >
              <Menu className="w-4 h-4" />
              <span className="hidden sm:inline">Browse</span>
        </button>

            {/* Main Navigation Links */}
            <div className="hidden md:flex space-x-6 text-xs">
              <Link href="/" className="hover:text-orange-500 transition-colors flex items-center gap-2">
                <Home className="w-3 h-3" />
                <span>Home</span>
              </Link>
              <Link href="/movies" className="hover:text-orange-500 transition-colors flex items-center gap-2">
                <Film className="w-3 h-3" />
                <span>Movies</span>
              </Link>
              <Link href="/tv-shows" className="hover:text-orange-500 transition-colors flex items-center gap-2">
                <Tv className="w-3 h-3" />
                <span>TV Shows</span>
              </Link>
            </div>

            {/* Search and Filter Section */}
            <div className="flex-1 flex items-center gap-2">
              <div className="relative flex-1 max-w-xl">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400" />
          <input
            type="text"
                  placeholder="Search titles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-gray-800/50 text-xs pl-8 pr-4 py-1.5 rounded-full border border-gray-700 focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>

              {/* Filter Button */}
              <div className="relative">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="flex items-center gap-2 text-xs bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-700 hover:border-orange-500 transition-colors"
                >
                  <Filter className="w-3 h-3" />
                  <span className="hidden sm:inline">Filters</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {/* Filter Dropdown */}
                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-gray-900 border border-gray-800 rounded-lg shadow-xl p-4 text-xs">
                    {/* Genre Filter */}
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-2">Genre</label>
                      <select
                        value={filters.genre}
                        onChange={(e) => setFilters({ ...filters, genre: e.target.value })}
                        className="w-full bg-gray-800 rounded-md px-2 py-1.5 border border-gray-700 focus:border-orange-500 transition-colors"
                      >
                        <option value="">All Genres</option>
                        {GENRES.map((genre) => (
                          <option key={genre} value={genre}>{genre}</option>
                        ))}
                      </select>
                    </div>

                    {/* Year Filter */}
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-2">Year</label>
                      <select
                        value={filters.year}
                        onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                        className="w-full bg-gray-800 rounded-md px-2 py-1.5 border border-gray-700 focus:border-orange-500 transition-colors"
                      >
                        <option value="">All Years</option>
                        {YEARS.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    {/* Quality Filter */}
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-2">Quality</label>
                      <div className="flex gap-2">
                        {QUALITY_OPTIONS.map((quality) => (
                          <button
                            key={quality}
                            onClick={() => setFilters({ ...filters, quality: filters.quality === quality ? '' : quality })}
                            className={`px-2 py-1 rounded-md border ${
                              filters.quality === quality
                                ? 'bg-orange-500 border-orange-600'
                                : 'bg-gray-800 border-gray-700 hover:border-orange-500'
                            } transition-colors`}
                          >
                            {quality}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Rating Filter */}
                    <div className="mb-4">
                      <label className="block text-gray-400 mb-2">Rating</label>
                      <div className="flex gap-2">
                        {RATING_OPTIONS.map((rating) => (
                          <button
                            key={rating}
                            onClick={() => setFilters({ ...filters, rating: filters.rating === rating ? '' : rating })}
                            className={`px-2 py-1 rounded-md border ${
                              filters.rating === rating
                                ? 'bg-orange-500 border-orange-600'
                                : 'bg-gray-800 border-gray-700 hover:border-orange-500'
                            } transition-colors`}
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reset Filters */}
                    <button
                      onClick={() => setFilters({ genre: '', quality: '', rating: '', year: '' })}
                      className="w-full bg-gray-800 hover:bg-gray-700 text-center py-1.5 rounded-md transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar Menu */}
      <div 
        className={`fixed top-0 left-0 w-64 h-full bg-gray-900/95 backdrop-blur-sm text-white p-4 transform ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out z-50 flex flex-col border-r border-gray-800`}
      >
        <button className="absolute top-4 right-4 hover:text-orange-500 transition-colors" onClick={() => setIsSidebarOpen(false)}>
          <X className="w-4 h-4" />
        </button>

        <div className="mt-8 space-y-6">
          {/* Navigation Links */}
          <div className="space-y-2 text-xs">
            <Link href="/" className="flex items-center space-x-3 hover:text-orange-500 transition-colors py-1">
              <Home className="w-3 h-3" />
            <span>Home</span>
          </Link>
            <Link href="/movies" className="flex items-center space-x-3 hover:text-orange-500 transition-colors py-1">
              <Film className="w-3 h-3" />
            <span>Movies</span>
          </Link>
            <Link href="/tv-shows" className="flex items-center space-x-3 hover:text-orange-500 transition-colors py-1">
              <Tv className="w-3 h-3" />
            <span>TV Shows</span>
          </Link>
            <Link href="/top-imdb" className="flex items-center space-x-3 hover:text-orange-500 transition-colors py-1">
              <Flame className="w-3 h-3" />
            <span>Top IMDB</span>
          </Link>
        </div>

          {/* Genres */}
          <div>
            <h3 className="text-xs font-medium mb-2 text-gray-400">Genres</h3>
            <div className="grid grid-cols-2 gap-1 text-[10px]">
            {GENRES.map((genre) => (
              <Link 
                key={genre} 
                href={`/genre/${genre.toLowerCase()}`} 
                  className="px-2 py-1 rounded hover:bg-gray-800 transition-colors"
              >
                {genre}
              </Link>
            ))}
          </div>
          </div>
        </div>
      </div>
    </>
  );
}

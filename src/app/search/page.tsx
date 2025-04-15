'use client';

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { searchShows, getImageUrl, TMDBShow } from "@/lib/tmdb";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const router = useRouter();
  const [results, setResults] = useState<TMDBShow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      if (query) {
        try {
          const searchResults = await searchShows(query);
          setResults(searchResults);
        } catch (error) {
          console.error('Error fetching search results:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            G3WATCH
          </Link>
          <div className="relative w-1/3">
            <input
              type="text"
              defaultValue={query}
              placeholder="Search for movies, series, or anime..."
              className="w-full bg-black/80 border border-gray-700 rounded-full py-2 px-4 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const value = (e.target as HTMLInputElement).value;
                  router.push(`/search?q=${encodeURIComponent(value)}`);
                }
              }}
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Search Results */}
        <div>
          <h1 className="text-3xl font-bold mb-6">
            Search Results for "{query}"
          </h1>
          
          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {results.map((show) => (
                <div
                  key={show.id}
                  onClick={() => router.push(`/shows/${show.media_type}/${show.id}`)}
                  className="bg-gray-800/50 rounded-xl overflow-hidden hover:bg-gray-800/80 transition-colors cursor-pointer group"
                >
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={getImageUrl(show.poster_path)}
                      alt={show.title || show.name || ''}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2">{show.title || show.name}</h3>
                    <p className="text-gray-400">{show.overview}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-sm text-gray-500">{show.media_type === 'movie' ? 'Movie' : 'TV Show'}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{show.vote_average.toFixed(1)}/10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-xl text-gray-400">No results found</p>
              <p className="text-gray-500 mt-2">Try different keywords or browse our categories</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
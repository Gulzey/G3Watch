'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { TMDBShow, searchShows, getImageUrl } from '@/lib/tmdb';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<TMDBShow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await searchShows(query);
        setResults(data);
      } catch (error) {
        console.error('Error searching shows:', error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      fetchResults();
    } else {
      setLoading(false);
    }
  }, [query]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <style jsx global>{`
        /* Custom scrollbar styling */
        .scrollbar-hide::-webkit-scrollbar {
          height: 8px;
        }
        
        .scrollbar-hide::-webkit-scrollbar-track {
          background: #000;
          border-radius: 4px;
        }
        
        .scrollbar-hide::-webkit-scrollbar-thumb {
          background: linear-gradient(to right, #9333ea, #ec4899);
          border-radius: 4px;
        }
        
        .scrollbar-hide::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to right, #7e22ce, #db2777);
        }
      `}</style>

      {/* Header with Logo */}
      <header className="p-4">
        <Link href="/" className="inline-block">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            G3WATCH
          </h1>
        </Link>
      </header>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8">
          Search Results for: <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">{query}</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {results.length > 0 ? (
            results.map((show) => (
              <div
                key={show.id}
                className="bg-gray-800/50 rounded-xl overflow-hidden hover:bg-gray-800/80 transition-all duration-300 transform hover:scale-105 group"
              >
                <Link href={`/shows/${show.media_type}/${show.id}`}>
                  <div className="relative aspect-[2/3]">
                    <Image
                      src={getImageUrl(show.poster_path)}
                      alt={show.title || show.name || ''}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <h3 className="text-lg font-semibold mb-2">{show.title || show.name}</h3>
                      <p className="text-sm text-gray-300 line-clamp-3">{show.overview}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-400">
              <p className="text-xl mb-2">No results found</p>
              <p>Try searching with different keywords or browse our categories</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
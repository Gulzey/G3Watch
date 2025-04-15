'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getImageUrl } from '@/lib/tmdb';
import Image from 'next/image';
import Link from 'next/link';

interface ShowDetails {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  number_of_seasons?: number;
}

interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string;
  episode_number: number;
  season_number: number;
  air_date: string;
}

export default function WatchPage({ params }: { params: { type: string; id: string } }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [show, setShow] = useState<ShowDetails | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch show details
        const showResponse = await fetch(
          `https://api.themoviedb.org/3/${params.type}/${params.id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
        );
        
        if (!showResponse.ok) {
          throw new Error('Failed to fetch show details');
        }

        const showData = await showResponse.json();
        setShow(showData);

        // If it's a TV show, fetch episodes
        if (params.type === 'tv') {
          const season = searchParams.get('season') || '1';
          const episodesResponse = await fetch(
            `https://api.themoviedb.org/3/tv/${params.id}/season/${season}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
          );
          
          if (episodesResponse.ok) {
            const episodesData = await episodesResponse.json();
            setEpisodes(episodesData.episodes);
            setSelectedSeason(Number(season));
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, params.type, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Show not found</div>
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
      <header className="absolute top-0 left-0 right-0 z-50 p-4 flex justify-between items-center">
        <Link href="/" className="inline-block">
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            G3WATCH
          </h1>
        </Link>
        <Link
          href={`/shows/${params.type}/${params.id}`}
          className="text-white hover:text-gray-300 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </Link>
      </header>

      {/* Video Player */}
      <div className="relative w-full aspect-video bg-gray-900">
        {/* Placeholder for video player */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">{show.title || show.name}</h1>
            {searchParams.get('episode') && (
              <h2 className="text-2xl mb-4">
                Season {searchParams.get('season')} • Episode {searchParams.get('episode')}
              </h2>
            )}
            <p className="text-gray-400">Video player coming soon!</p>
          </div>
        </div>
      </div>

      {/* Show Info */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Poster */}
          <div className="w-48 h-72 relative flex-shrink-0 rounded-xl overflow-hidden group hover:scale-105 transition-transform duration-300">
            <Image
              src={getImageUrl(show.poster_path)}
              alt={show.title || show.name || ''}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              {show.title || show.name}
            </h1>
            <p className="text-gray-300">{show.overview}</p>
          </div>
        </div>

        {/* Episodes (for TV shows) */}
        {params.type === 'tv' && episodes.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                Episodes
              </h2>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                className="bg-gray-800/50 text-white px-4 py-2 rounded-full border border-gray-700 focus:outline-none focus:border-gray-500 transition-colors"
              >
                {Array.from({ length: show.number_of_seasons || 1 }, (_, i) => i + 1).map(
                  (season) => (
                    <option key={season} value={season}>
                      Season {season}
                    </option>
                  )
                )}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {episodes.map((episode) => (
                <div
                  key={episode.id}
                  className="bg-gray-800/50 rounded-xl overflow-hidden hover:bg-gray-800/80 transition-all duration-300 transform hover:scale-105 group"
                >
                  <div className="relative h-40">
                    <Image
                      src={getImageUrl(episode.still_path)}
                      alt={episode.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">Episode {episode.episode_number}</h3>
                      <span className="text-sm text-gray-400">{episode.air_date}</span>
                    </div>
                    <h4 className="text-lg font-bold mb-2">{episode.name}</h4>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {episode.overview}
                    </p>
                    <Link
                      href={`/watch/${params.type}/${params.id}?season=${selectedSeason}&episode=${episode.episode_number}`}
                      className="inline-block w-full text-center px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold hover:opacity-90 transition-opacity"
                    >
                      Watch Episode
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
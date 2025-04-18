'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { TMDBShow, getImageUrl } from '@/lib/tmdb';

interface ShowGridProps {
  getShows: () => Promise<TMDBShow[]>;
}

export default function ShowGrid({ getShows }: ShowGridProps) {
  const [shows, setShows] = useState<TMDBShow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const data = await getShows();
        setShows(data);
      } catch (error) {
        console.error('Error fetching shows:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchShows();
  }, [getShows]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
      {shows.length > 0 ? (
        shows.map((show) => (
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
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, (max-width: 1536px) 20vw, 16vw"
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
  );
} 
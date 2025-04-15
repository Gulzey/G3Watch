'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { fetchShowDetails, fetchSeasonEpisodes, getImageUrl } from '@/lib/tmdb';
import type { TMDBShowDetails, TMDBEpisode } from '@/lib/tmdb';

export default function ShowPage({ params }: { params: { type: string; id: string } }) {
  const [show, setShow] = useState<TMDBShowDetails | null>(null);
  const [episodes, setEpisodes] = useState<TMDBEpisode[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadShowDetails() {
      try {
        setLoading(true);
        const showData = await fetchShowDetails(params.type, params.id);
        setShow(showData);

        if (params.type === 'tv') {
          const episodesData = await fetchSeasonEpisodes(params.id, selectedSeason);
          setEpisodes(episodesData);
        }
      } catch (err) {
        setError('Failed to load show details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadShowDetails();
  }, [params.type, params.id, selectedSeason]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error || !show) {
    return <div className="text-center text-red-500 p-4">{error || 'Show not found'}</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Backdrop */}
      <div className="relative w-full h-[60vh]">
        <Image
          src={getImageUrl(show.backdrop_path, 'original')}
          alt={show.title || show.name || ''}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0">
            <Image
              src={getImageUrl(show.poster_path, 'w500')}
              alt={show.title || show.name || ''}
              width={300}
              height={450}
              className="rounded-lg shadow-lg"
            />
          </div>

          {/* Details */}
          <div className="flex-grow">
            <h1 className="text-4xl font-bold mb-4">{show.title || show.name}</h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="bg-yellow-500 text-black px-2 py-1 rounded">
                ★ {show.vote_average?.toFixed(1)}
              </span>
              <span>{new Date(show.release_date || show.first_air_date || '').getFullYear()}</span>
              {show.runtime && <span>{Math.floor(show.runtime / 60)}h {show.runtime % 60}m</span>}
              {show.number_of_seasons && <span>{show.number_of_seasons} Seasons</span>}
            </div>
            <div className="flex gap-2 mb-4">
              {show.genres.map((genre) => (
                <span key={genre.id} className="bg-gray-800 px-3 py-1 rounded-full text-sm">
                  {genre.name}
                </span>
              ))}
            </div>
            <p className="text-gray-300 mb-6">{show.overview}</p>
            <Link
              href={`/watch/${params.type}/${params.id}`}
              className="inline-block bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Watch Now
            </Link>
          </div>
        </div>

        {/* Episodes Section for TV Shows */}
        {params.type === 'tv' && show.number_of_seasons && (
          <div className="mt-12">
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-2xl font-bold">Episodes</h2>
              <select
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(Number(e.target.value))}
                className="bg-gray-800 text-white px-4 py-2 rounded-lg"
              >
                {Array.from({ length: show.number_of_seasons }, (_, i) => i + 1).map((season) => (
                  <option key={season} value={season}>
                    Season {season}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {episodes.map((episode) => (
                <div key={episode.id} className="bg-gray-900 rounded-lg overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={getImageUrl(episode.still_path, 'w500')}
                      alt={episode.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold mb-2">
                      {episode.episode_number}. {episode.name}
                    </h3>
                    <p className="text-sm text-gray-400 mb-2">{episode.air_date}</p>
                    <p className="text-sm text-gray-300 mb-4 line-clamp-2">{episode.overview}</p>
                    <Link
                      href={`/watch/${params.type}/${params.id}?season=${episode.season_number}&episode=${episode.episode_number}`}
                      className="inline-block bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors"
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
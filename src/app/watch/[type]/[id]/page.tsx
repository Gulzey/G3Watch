'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { fetchShowDetails, fetchSeasonEpisodes, getImageUrl } from '@/lib/tmdb';
import type { TMDBShowDetails, TMDBEpisode } from '@/lib/tmdb';

export default function WatchPage({ params }: { params: { type: string; id: string } }) {
  const searchParams = useSearchParams();
  const season = searchParams.get('season');
  const episode = searchParams.get('episode');

  const [show, setShow] = useState<TMDBShowDetails | null>(null);
  const [currentEpisode, setCurrentEpisode] = useState<TMDBEpisode | null>(null);
  const [episodes, setEpisodes] = useState<TMDBEpisode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const showData = await fetchShowDetails(params.type, params.id);
        setShow(showData);

        if (params.type === 'tv' && season) {
          const episodesData = await fetchSeasonEpisodes(params.id, Number(season));
          setEpisodes(episodesData);
          
          if (episode) {
            const currentEp = episodesData.find(ep => ep.episode_number === Number(episode));
            setCurrentEpisode(currentEp || null);
          }
        }
      } catch (err) {
        setError('Failed to load show details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params.type, params.id, season, episode]);

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error || !show) {
    return <div className="text-center text-red-500 p-4">{error || 'Show not found'}</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Video Player */}
      <div className="relative w-full aspect-video bg-gray-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-2xl mb-4">
              {params.type === 'tv' && currentEpisode
                ? `${show.name} - S${season}E${episode} - ${currentEpisode.name}`
                : show.title || show.name}
            </p>
            <p className="text-gray-400">Video player would be integrated here</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link
          href={`/shows/${params.type}/${params.id}`}
          className="inline-block mb-8 text-gray-400 hover:text-white transition-colors"
        >
          ← Back to details
        </Link>

        {/* Show info */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">
            {params.type === 'tv' && currentEpisode
              ? `${show.name} - S${season}E${episode} - ${currentEpisode.name}`
              : show.title || show.name}
          </h1>
          <p className="text-gray-300">
            {params.type === 'tv' && currentEpisode
              ? currentEpisode.overview
              : show.overview}
          </p>
        </div>

        {/* Episode navigation for TV shows */}
        {params.type === 'tv' && episodes.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">More Episodes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {episodes.map((ep) => (
                <Link
                  key={ep.id}
                  href={`/watch/${params.type}/${params.id}?season=${season}&episode=${ep.episode_number}`}
                  className={`p-4 rounded-lg transition-colors ${
                    ep.episode_number === Number(episode)
                      ? 'bg-red-600'
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-16 relative rounded overflow-hidden">
                      <img
                        src={getImageUrl(ep.still_path, 'w500')}
                        alt={ep.name}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    <div>
                      <p className="font-semibold">
                        Episode {ep.episode_number}: {ep.name}
                      </p>
                      <p className="text-sm text-gray-400">{ep.air_date}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
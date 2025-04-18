import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl, TMDBShow, TMDBSeason, TMDBEpisode } from '@/lib/tmdb';

async function getShowDetails(type: string, id: string): Promise<TMDBShow> {
  const response = await fetch(
    `https://api.themoviedb.org/3/${type}/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch show details');
  }

  return response.json();
}

async function getEpisodes(showId: string, season: number): Promise<TMDBSeason | null> {
  const response = await fetch(
    `https://api.themoviedb.org/3/tv/${showId}/season/${season}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
  );
  
  if (!response.ok) {
    return null;
  }

  return response.json();
}

export default async function ShowPage({ params }: { params: { type: string; id: string } }) {
  const show = await getShowDetails(params.type, params.id);
  const episodes = params.type === 'tv' ? await getEpisodes(params.id, 1) : null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Backdrop Image */}
      <div className="relative h-[60vh]">
        <Image
          src={getImageUrl(show.backdrop_path, 'original')}
          alt={show.title || show.name || ''}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative -mt-32 container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Poster */}
          <div className="md:w-1/3 lg:w-1/4">
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={getImageUrl(show.poster_path)}
                alt={show.title || show.name || ''}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Details */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4">{show.title || show.name}</h1>
            
            <div className="flex items-center gap-4 text-gray-400 mb-6">
              {(show.release_date || show.first_air_date) && (
                <>
                  <span>
                    {new Date(show.release_date || show.first_air_date || '').getFullYear()}
                  </span>
                  <span>•</span>
                </>
              )}
              <span>{show.vote_average.toFixed(1)} ★</span>
              {show.runtime && (
                <>
                  <span>•</span>
                  <span>{show.runtime} min</span>
                </>
              )}
              {show.number_of_seasons && (
                <>
                  <span>•</span>
                  <span>{show.number_of_seasons} Season{show.number_of_seasons > 1 ? 's' : ''}</span>
                </>
              )}
            </div>

            <p className="text-lg text-gray-300 mb-8">{show.overview}</p>

            <div className="flex flex-wrap gap-2 mb-8">
              {show.genres?.map((genre: { id: number; name: string }) => (
                <span
                  key={genre.id}
                  className="px-3 py-1 bg-gray-800 rounded-full text-sm"
                >
                  {genre.name}
                </span>
              ))}
            </div>

            <Link
              href={`/watch/${params.type}/${params.id}`}
              className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Watch Now
            </Link>
          </div>
        </div>

        {/* Episodes Section */}
        {params.type === 'tv' && episodes && episodes.episodes && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
              Episodes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {episodes.episodes.map((episode: TMDBEpisode) => (
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
                      href={`/watch/${params.type}/${params.id}?season=1&episode=${episode.episode_number}`}
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
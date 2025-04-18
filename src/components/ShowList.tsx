import Image from 'next/image';
import Link from 'next/link';
import { TMDBShow, getImageUrl } from '@/lib/tmdb';

interface ShowListProps {
  getShows: () => Promise<TMDBShow[]>;
}

export default async function ShowList({ getShows }: ShowListProps) {
  const shows = await getShows();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-4 w-full">
      {shows.map((show) => (
        <Link
          key={show.id}
          href={`/shows/${show.media_type}/${show.id}`}
          className="group relative aspect-[2/3] rounded-lg overflow-hidden bg-gray-900 transform hover:scale-105 transition-all duration-300"
        >
          <Image
            src={getImageUrl(show.poster_path)}
            alt={show.title || show.name || ''}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, (max-width: 1536px) 16.67vw, 14.28vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <h3 className="text-lg font-semibold line-clamp-2">{show.title || show.name}</h3>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-sm bg-purple-600/80 px-2 py-0.5 rounded">
                {show.vote_average.toFixed(1)}
              </span>
              <span className="text-sm text-gray-300">
                {new Date(show.release_date || show.first_air_date || '').getFullYear() || 'N/A'}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 
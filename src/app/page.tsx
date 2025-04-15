'use client';

import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchTrending, fetchMovies, fetchTVShows, fetchAnime, getImageUrl, TMDBShow } from "@/lib/tmdb";

export default function Home() {
  const contentRef = useRef<HTMLDivElement>(null);
  const moviesRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [trending, setTrending] = useState<TMDBShow[]>([]);
  const [movies, setMovies] = useState<TMDBShow[]>([]);
  const [series, setSeries] = useState<TMDBShow[]>([]);
  const [anime, setAnime] = useState<TMDBShow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trendingData, moviesData, seriesData, animeData] = await Promise.all([
          fetchTrending(),
          fetchMovies(),
          fetchTVShows(),
          fetchAnime()
        ]);
        setTrending(trendingData);
        setMovies(moviesData);
        setSeries(seriesData);
        setAnime(animeData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const scrollToContent = () => {
    moviesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleShowClick = (id: number, mediaType: string) => {
    router.push(`/shows/${mediaType}/${id}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

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

        /* Arrow animation */
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(10px);
          }
        }
      `}</style>

      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/90 z-10" />
        <div className="relative z-20 text-center w-full max-w-4xl mx-auto px-4">
          <h1 className="text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            G3WATCH
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Your gateway to the future of entertainment
          </p>
          
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative mb-8 max-w-2xl mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for movies, series, or anime..."
              className="w-full bg-black/80 border border-gray-700 rounded-full py-3 px-6 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500 transition-colors"
            />
            <button
              type="submit"
              className="absolute right-6 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
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
            </button>
          </form>

          <div className="flex justify-center">
            <button 
              onClick={scrollToContent}
              className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-3 rounded-full text-lg font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 group"
            >
              Start Watching
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className="w-5 h-5 group-hover:translate-y-1 transition-transform"
              >
                <path d="M12 5v14M19 12l-7 7-7-7"/>
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Content Library */}
      <div className="space-y-12 pb-12">
        {/* Trending Now */}
        <section className="px-4">
          <h2 className="text-2xl font-bold mb-6">Trending Now</h2>
          <div className="relative">
            <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide">
              {trending.map((show, index) => (
                <div
                  key={show.id}
                  onClick={() => handleShowClick(show.id, show.media_type)}
                  className="flex-none w-[400px] rounded-xl overflow-hidden bg-gray-800/50 hover:bg-gray-800/80 transition-all duration-300 transform hover:scale-105 cursor-pointer group relative"
                >
                  <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-purple-600 to-pink-600 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold">
                    {index + 1}
                  </div>
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={getImageUrl(show.backdrop_path)}
                      alt={show.title || show.name || ''}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                      <h3 className="text-2xl font-bold mb-2">{show.title || show.name}</h3>
                      <p className="text-lg text-gray-300">{show.overview}</p>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-2xl font-bold truncate">{show.title || show.name}</h3>
                    <p className="text-lg text-gray-400 truncate">{show.overview}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Movies */}
        <section ref={moviesRef} className="px-4">
          <h2 className="text-2xl font-bold mb-6">Movies</h2>
          <div className="relative">
            <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide">
              {movies.map((show) => (
                <div
                  key={show.id}
                  onClick={() => handleShowClick(show.id, 'movie')}
                  className="flex-none w-64 rounded-xl overflow-hidden bg-gray-800/50 hover:bg-gray-800/80 transition-all duration-300 transform hover:scale-105 cursor-pointer group"
                >
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={getImageUrl(show.poster_path)}
                      alt={show.title || ''}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <h3 className="text-lg font-semibold">{show.title}</h3>
                      <p className="text-sm text-gray-300">{show.overview}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold truncate">{show.title}</h3>
                    <p className="text-sm text-gray-400 truncate">{show.overview}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Series */}
        <section className="px-4">
          <h2 className="text-2xl font-bold mb-6">Series</h2>
          <div className="relative">
            <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide">
              {series.map((show) => (
                <div
                  key={show.id}
                  onClick={() => handleShowClick(show.id, 'tv')}
                  className="flex-none w-64 rounded-xl overflow-hidden bg-gray-800/50 hover:bg-gray-800/80 transition-all duration-300 transform hover:scale-105 cursor-pointer group"
                >
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={getImageUrl(show.poster_path)}
                      alt={show.name || ''}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <h3 className="text-lg font-semibold">{show.name}</h3>
                      <p className="text-sm text-gray-300">{show.overview}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold truncate">{show.name}</h3>
                    <p className="text-sm text-gray-400 truncate">{show.overview}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Anime */}
        <section className="px-4">
          <h2 className="text-2xl font-bold mb-6">Anime</h2>
          <div className="relative">
            <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide">
              {anime.map((show) => (
                <div
                  key={show.id}
                  onClick={() => handleShowClick(show.id, 'tv')}
                  className="flex-none w-64 rounded-xl overflow-hidden bg-gray-800/50 hover:bg-gray-800/80 transition-all duration-300 transform hover:scale-105 cursor-pointer group"
                >
                  <div className="relative aspect-[16/9]">
                    <Image
                      src={getImageUrl(show.poster_path)}
                      alt={show.name || ''}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-0 left-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <h3 className="text-lg font-semibold">{show.name}</h3>
                      <p className="text-sm text-gray-300">{show.overview}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold truncate">{show.name}</h3>
                    <p className="text-sm text-gray-400 truncate">{show.overview}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

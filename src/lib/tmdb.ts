const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  throw new Error('TMDB API key is not defined. Please check your .env.local file.');
}

export interface TMDBShow {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  media_type: 'movie' | 'tv';
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  original_language: string;
  origin_country?: string[];
  runtime?: number;
  number_of_seasons?: number;
  genres?: { id: number; name: string }[];
}

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  still_path: string;
  episode_number: number;
  air_date: string;
}

export interface TMDBSeason {
  id: number;
  episodes: TMDBEpisode[];
  season_number: number;
  name: string;
  overview: string;
  poster_path: string;
  air_date: string;
}

async function fetchFromTMDB(endpoint: string) {
  try {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.append('api_key', TMDB_API_KEY);
    
    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `TMDB API error: ${response.status} ${response.statusText}\n${JSON.stringify(errorData, null, 2)}`
      );
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching from TMDB:', error);
    throw error;
  }
}

export async function fetchTrending(): Promise<TMDBShow[]> {
  return fetchFromTMDB('/trending/all/week');
}

export async function fetchMovies(): Promise<TMDBShow[]> {
  return fetchFromTMDB('/movie/popular');
}

export async function fetchTVShows(): Promise<TMDBShow[]> {
  return fetchFromTMDB('/tv/popular');
}

export async function fetchAnime(): Promise<TMDBShow[]> {
  const pages = 5; // Fetch 5 pages of results
  let allResults: TMDBShow[] = [];

  // Fetch multiple pages of animated shows
  for (let page = 1; page <= pages; page++) {
    const endpoint = '/discover/tv?' + new URLSearchParams({
      with_genres: '16', // Animation genre
      sort_by: 'popularity.desc',
      'vote_count.gte': '20', // Lower the vote count requirement
      page: page.toString(),
      include_adult: 'false',
      with_original_language: 'ja', // Include shows with Japanese as original language
    }).toString();
    
    try {
      const results = await fetchFromTMDB(endpoint);
      allResults = [...allResults, ...results];
    } catch (error) {
      console.error(`Error fetching anime page ${page}:`, error);
    }
  }
  
  // Filter to keep only Japanese shows with additional criteria
  const japaneseAnime = allResults.filter((show: TMDBShow) => 
    (show.original_language === 'ja' || // Japanese language
    (show.origin_country && show.origin_country.includes('JP'))) && // From Japan
    show.poster_path && // Has a poster
    show.backdrop_path // Has a backdrop image
  );

  // Sort by popularity
  return japaneseAnime.sort((a, b) => b.vote_average - a.vote_average);
}

export async function searchShows(query: string): Promise<TMDBShow[]> {
  return fetchFromTMDB(`/search/multi?query=${encodeURIComponent(query)}`);
}

export function getImageUrl(path: string, size: 'w500' | 'original' = 'w500'): string {
  if (!path) {
    return '/placeholder-image.jpg'; // You should add a placeholder image
  }
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
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
  return fetchFromTMDB('/discover/tv?with_genres=16&sort_by=popularity.desc');
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
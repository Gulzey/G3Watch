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
  const pages = 5; // Fetch 5 pages of results
  let allResults: TMDBShow[] = [];

  // Fetch multiple pages of movies
  for (let page = 1; page <= pages; page++) {
    const endpoint = '/discover/movie?' + new URLSearchParams({
      sort_by: 'popularity.desc',
      'vote_count.gte': '100',
      page: page.toString(),
      include_adult: 'false',
      with_original_language: 'en', // Focus on English language movies
      'vote_average.gte': '6.0', // Minimum rating of 6
    }).toString();
    
    try {
      const results = await fetchFromTMDB(endpoint);
      allResults = [...allResults, ...results];
    } catch (error) {
      console.error(`Error fetching movies page ${page}:`, error);
    }
  }
  
  // Filter to ensure we have required images and add media type
  const movies = allResults
    .filter((movie: TMDBShow) => movie.poster_path && movie.backdrop_path)
    .map((movie: TMDBShow) => ({ ...movie, media_type: 'movie' as const }));

  // Sort by popularity and rating
  return movies.sort((a, b) => b.vote_average - a.vote_average);
}

export async function fetchTVShows(): Promise<TMDBShow[]> {
  const pages = 5; // Fetch 5 pages of results
  let allResults: TMDBShow[] = [];

  // Fetch multiple pages of TV shows
  for (let page = 1; page <= pages; page++) {
    const endpoint = '/discover/tv?' + new URLSearchParams({
      sort_by: 'popularity.desc',
      'vote_count.gte': '50',
      page: page.toString(),
      include_adult: 'false',
      'vote_average.gte': '7.0', // Higher minimum rating for TV shows
      with_status: '0', // Only shows still running
      without_genres: '16', // Exclude animation genre
    }).toString();
    
    try {
      const results = await fetchFromTMDB(endpoint);
      allResults = [...allResults, ...results];
    } catch (error) {
      console.error(`Error fetching TV shows page ${page}:`, error);
    }
  }
  
  // Filter to ensure we have required images, exclude anime, and add media type
  const tvShows = allResults
    .filter((show: TMDBShow) => 
      show.poster_path && 
      show.backdrop_path &&
      show.original_language !== 'ja' && // Exclude Japanese shows (likely anime)
      (!show.origin_country || !show.origin_country.includes('JP')) // Exclude shows from Japan
    )
    .map((show: TMDBShow) => ({ ...show, media_type: 'tv' as const }));

  // Sort by popularity and rating
  return tvShows.sort((a, b) => b.vote_average - a.vote_average);
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
// /lib/tmdb.ts

import { z } from 'zod';

// --- Type Definitions and Zod Schemas ---

export interface Movie {
  id: number;
  title: string;
  release_date: string;
  overview: string;
  poster_path: string;
  genre_ids?: number[]; // From list/search endpoints
  genres?: { id: number; name: string }[]; // From details endpoint
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  watch_providers?: WatchProviders;
}

export interface StreamingProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface WatchProviders {
  link?: string;
  flatrate?: StreamingProvider[];
  rent?: StreamingProvider[];
  buy?: StreamingProvider[];
}

// Zod schemas for robust type validation from the API response
const MovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  overview: z.string(),
  release_date: z.string(),
  poster_path: z.string().nullable(),
  genre_ids: z.array(z.number()).optional(), // Popular/search results use genre_ids
  vote_average: z.number().optional(),
  vote_count: z.number().optional(),
  popularity: z.number().optional(),
});

const WatchProviderSchema = z.object({
  logo_path: z.string(),
  provider_id: z.number(),
  provider_name: z.string(),
  display_priority: z.number(),
});

const WatchProvidersSchema = z.object({
  link: z.string().optional(),
  flatrate: z.array(WatchProviderSchema).optional(),
  rent: z.array(WatchProviderSchema).optional(),
  buy: z.array(WatchProviderSchema).optional(),
});

const MovieSearchResultSchema = z.object({
  page: z.number(),
  results: z.array(MovieSchema),
  total_pages: z.number(),
  total_results: z.number(),
});

const MovieDetailsSchema = MovieSchema.extend({
  // FIX: Used Zod syntax (z.number(), z.string()) instead of TypeScript type syntax
  genres: z.array(z.object({ id: z.number(), name: z.string() })).optional(),
  'watch/providers': z.object({
    results: z.record(z.string(), WatchProvidersSchema),
  }).optional(),
}).omit({ genre_ids: true });

const GenreListSchema = z.object({
    // FIX: Used Zod syntax (z.number(), z.string()) instead of TypeScript type syntax
    genres: z.array(z.object({ id: z.number(), name: z.string() })),
});


// --- API Client Configuration ---

const TMDB_API_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_API_TOKEN = process.env.TMDB_API_READ_ACCESS_TOKEN;

if (!TMDB_API_TOKEN) {
  throw new Error('TMDb API token is not configured. Please set TMDB_API_READ_ACCESS_TOKEN in your .env.local file.');
}

const tmdbHeaders = {
  Authorization: `Bearer ${TMDB_API_TOKEN}`,
  'Content-Type': 'application/json;charset=utf-8',
};

// --- Core Fetch Function ---

async function fetchFromTMDb<T>(endpoint: string, schema: z.ZodType<T>): Promise<T> {
  const url = `${TMDB_API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, { headers: tmdbHeaders });

    if (!response.ok) {
      const errorBody = await response.json();
      console.error(`TMDb API Error: ${response.status} ${response.statusText}`, errorBody);
      throw new Error(`Failed to fetch from TMDb: ${errorBody.status_message || 'Unknown error'}`);
    }

    const data = await response.json();
    return schema.parse(data);
  } catch (error) {
    console.error(`Error during TMDb fetch for endpoint ${endpoint}:`, error);
    if (error instanceof z.ZodError) {
      throw new Error(`TMDb API response validation failed: ${error.message}`);
    }
    throw error;
  }
}

// --- Data Fetching Functions ---

/**
 * Fetches the master list of all movie genres from TMDb.
 * @returns A promise that resolves to a Map of genre IDs to genre names.
 */
export async function getGenres(): Promise<Map<number, string>> {
    const data = await fetchFromTMDb('/genre/movie/list', GenreListSchema);
    return new Map(data.genres.map(genre => [genre.id, genre.name]));
}

/**
 * Fetches a page of movies based on discovery criteria like watch providers and ratings.
 * @param params - The discovery parameters.
 * @returns A promise that resolves to a search result object.
 */
export async function discoverMovies(params: {
    watch_region: string;
    with_watch_providers: string; // Comma-separated string of provider IDs
    page: number;
    'vote_average.gte': number;
    'vote_count.gte': number;
}): Promise<{ results: Movie[]; total_pages: number }> {
    const query = new URLSearchParams({
        ...params,
        page: params.page.toString(),
        'vote_average.gte': params['vote_average.gte'].toString(),
        'vote_count.gte': params['vote_count.gte'].toString(),
    }).toString();
    
    const data = await fetchFromTMDb(`/discover/movie?${query}`, MovieSearchResultSchema);
    
    return {
        results: data.results.map(movie => ({
            ...movie,
            poster_path: movie.poster_path || '',
        })),
        total_pages: data.total_pages,
    };
}


/**
 * Fetches detailed information for a single movie, including watch providers.
 * @param movieId The TMDb ID of the movie.
 * @param region The region for watch providers (e.g., 'US', 'GB'). Defaults to 'US'.
 * @returns A promise that resolves to the detailed movie object.
 */
export async function getMovieDetails(movieId: number, region: string = 'US'): Promise<Movie> {
  const data = await fetchFromTMDb(`/movie/${movieId}?append_to_response=watch/providers`, MovieDetailsSchema);
  
  const watchProviders = data['watch/providers']?.results[region];

  return {
    id: data.id,
    title: data.title,
    overview: data.overview,
    release_date: data.release_date,
    poster_path: data.poster_path || '',
    genres: data.genres,
    vote_average: data.vote_average,
    vote_count: data.vote_count,
    popularity: data.popularity,
    watch_providers: watchProviders,
  };
}


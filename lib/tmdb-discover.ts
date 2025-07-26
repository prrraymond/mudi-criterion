// Enhanced TMDb discovery functions for seeding
import { z } from "zod"

const TMDB_API_BASE_URL = "https://api.themoviedb.org/3"

function getTMDbToken(): string {
  const token = process.env.TMDB_API_READ_ACCESS_TOKEN
  if (!token) {
    throw new Error(
      "TMDb API token is not configured. Please set TMDB_API_READ_ACCESS_TOKEN in your environment variables.",
    )
  }
  return token
}

export interface Movie {
  id: number
  title: string
  overview: string
  release_date: string
  poster_path: string | null
  genre_ids?: number[]
  vote_average?: number
  vote_count?: number
  popularity?: number
}

const MovieSchema = z.object({
  id: z.number(),
  title: z.string(),
  overview: z.string(),
  release_date: z.string(),
  poster_path: z.string().nullable(),
  genre_ids: z.array(z.number()).optional(),
  vote_average: z.number().optional(),
  vote_count: z.number().optional(),
  popularity: z.number().optional(),
})

const DiscoverResponseSchema = z.object({
  page: z.number(),
  results: z.array(MovieSchema),
  total_pages: z.number(),
  total_results: z.number(),
})

const GenreSchema = z.object({
  id: z.number(),
  name: z.string(),
})

const GenresResponseSchema = z.object({
  genres: z.array(GenreSchema),
})

async function fetchFromTMDb<T>(endpoint: string, schema: z.ZodType<T>): Promise<T> {
  const token = getTMDbToken()
  const tmdbHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json;charset=utf-8",
  }

  const url = `${TMDB_API_BASE_URL}${endpoint}`
  try {
    const response = await fetch(url, { headers: tmdbHeaders })

    if (!response.ok) {
      const errorBody = await response.json()
      console.error(`TMDb API Error: ${response.status} ${response.statusText}`, errorBody)
      throw new Error(`Failed to fetch from TMDb: ${errorBody.status_message || "Unknown error"}`)
    }

    const data = await response.json()
    return schema.parse(data)
  } catch (error) {
    console.error(`Error during TMDb fetch for endpoint ${endpoint}:`, error)
    if (error instanceof z.ZodError) {
      throw new Error(`TMDb API response validation failed: ${error.message}`)
    }
    throw error
  }
}

export async function getGenres(): Promise<Map<number, string>> {
  const data = await fetchFromTMDb("/genre/movie/list?language=en-US", GenresResponseSchema)
  return new Map(data.genres.map((genre) => [genre.id, genre.name]))
}

interface DiscoverParams {
  with_watch_providers?: string
  watch_region?: string
  page?: number
  "vote_average.gte"?: number
  "vote_count.gte"?: number
}

export async function discoverMovies(params: DiscoverParams = {}) {
  const searchParams = new URLSearchParams()

  // Add default parameters
  searchParams.append("language", "en-US")
  searchParams.append("sort_by", "popularity.desc")
  searchParams.append("include_adult", "false")
  searchParams.append("include_video", "false")

  // Add custom parameters
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.append(key, value.toString())
    }
  })

  const endpoint = `/discover/movie?${searchParams.toString()}`
  return await fetchFromTMDb(endpoint, DiscoverResponseSchema)
}

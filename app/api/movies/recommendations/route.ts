import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"
import { createQueryVectorForMood, type MoodQuadrant } from "@/lib/mood-vectors"

// Create a Supabase client for route handlers - USE SERVICE ROLE KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Zod schema for query validation
const recommendationQuerySchema = z.object({
  mood: z.enum(["high-energy-pleasant", "high-energy-unpleasant", "low-energy-pleasant", "low-energy-unpleasant"]),
  limit: z.coerce.number().min(1).max(50).default(20),
  threshold: z.coerce.number().min(0.1).max(1.0).default(0.75),
  exclude: z.string().nullable().optional(), // Handle both null and undefined
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  console.log("=== API Route Debug Info ===")
  console.log("Environment variables check:")
  console.log("SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing")
  console.log("SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing")
  console.log("TMDB_TOKEN:", process.env.TMDB_API_READ_ACCESS_TOKEN ? "✅ Set" : "❌ Missing")

  // Validate query parameters
  const validation = recommendationQuerySchema.safeParse({
    mood: searchParams.get("mood"),
    limit: searchParams.get("limit"),
    threshold: searchParams.get("threshold"),
    exclude: searchParams.get("exclude"), // This can be null
  })

  if (!validation.success) {
    console.error("Query validation failed:", validation.error.flatten())
    return new Response(JSON.stringify({ error: "Invalid query parameters", details: validation.error.flatten() }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { mood, limit, threshold } = validation.data
  console.log("Query parameters:", { mood, limit, threshold })

  try {
    // 1. Create the query vector based on the selected mood
    const query_embedding = createQueryVectorForMood(mood as MoodQuadrant)
    console.log("Generated query vector:", query_embedding)

    // Parse excluded movie IDs - handle null/undefined properly
    const excludedIds = validation.data.exclude
      ? validation.data.exclude
          .split(",")
          .map((id) => Number.parseInt(id.trim()))
          .filter((id) => !isNaN(id))
      : []

    console.log("Excluded movie IDs:", excludedIds)

    // 3. Try the RPC function (your debug showed this works!)
    console.log("Calling match_movies_by_mood RPC function...")
    let data, error

    // Since your debug script showed the basic function works, let's use it
    const result = await supabase.rpc("match_movies_by_mood", {
      query_embedding: `[${query_embedding.join(",")}]`, // Fix: Ensure string format
      match_threshold: threshold,
      match_count: limit + excludedIds.length, // Request more to account for exclusions
    })
    data = result.data
    error = result.error

    console.log("RPC function returned:", data?.length || 0, "movies")

    // Filter out excluded movies on the backend
    if (data && excludedIds.length > 0) {
      data = data.filter((movie: any) => !excludedIds.includes(movie.id))
      console.log(`Filtered out excluded movies, ${data.length} remaining`)
    }

    if (error) {
      console.error("Supabase RPC error:", error)

      // Provide specific error messages based on error type
      if (error.message.includes("function match_movies_by_mood") || error.code === "42883") {
        return new Response(
          JSON.stringify({
            error: "Database function not found",
            details: "The required database functions don't exist in your database",
            hint: "Run the SQL scripts: scripts/01-create-match-movies-by-mood.sql",
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        )
      }

      return new Response(
        JSON.stringify({
          error: "Database query failed",
          details: error.message,
          hint: error.hint || "Check your database schema and data",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      )
    }

    if (!data || data.length === 0) {
      console.log("No movies found, trying with lower threshold...")

      // Try with a much lower threshold (your debug showed this works)
      const fallbackResult = await supabase.rpc("match_movies_by_mood", {
        query_embedding: `[${query_embedding.join(",")}]`,
        match_threshold: 0.1, // Much lower threshold
        match_count: limit + excludedIds.length,
      })
      data = fallbackResult.data?.filter((movie: any) => !excludedIds.includes(movie.id)) || []
      error = fallbackResult.error

      if (error) {
        console.error("Fallback query also failed:", error)
      } else {
        console.log("Fallback query returned:", data?.length || 0, "movies")
      }

      if (!data || data.length === 0) {
        return new Response(
          JSON.stringify({
            error: "No movies found",
            details: `No movies matched your mood after excluding ${excludedIds.length} already seen movies.`,
            hint: "Try a different mood or clear your watch history",
            excludedCount: excludedIds.length,
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          },
        )
      }
    }

    // 4. Fetch full movie details for the results
    console.log("Fetching TMDb details for", data.length, "movies...")
    const tmdbService = await import("@/lib/tmdb")
    const detailedMovies = await Promise.all(
      data.slice(0, limit).map(async (movie: any) => {
        try {
          console.log(`Fetching details for movie ${movie.id}: ${movie.title}`)
          const details = await tmdbService.getMovieDetails(movie.id, "US")
          return {
            ...movie,
            ...details,
            poster_path: details.poster_path || movie.poster_path || null,
          }
        } catch (e) {
          console.warn(`Could not fetch TMDb details for movie ${movie.id}:`, e)
          return {
            id: movie.id,
            title: movie.title,
            overview: movie.overview,
            release_date: movie.release_date,
            poster_path: movie.poster_path || null,
            vote_average: movie.vote_average,
            vote_count: movie.vote_count,
            popularity: movie.popularity,
          }
        }
      }),
    )

    console.log("Returning", detailedMovies.length, "detailed movies")
    return new Response(JSON.stringify(detailedMovies), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("Unexpected error in recommendation route:", err)
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
        details: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}


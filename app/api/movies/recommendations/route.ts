import type { NextRequest } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { z } from "zod"
import { createQueryVectorForMood, type MoodQuadrant } from "@/lib/mood-vectors"

// Use the Service Role Key for backend operations to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Zod schema for query validation
const recommendationQuerySchema = z.object({
  mood: z.enum(["high-energy-pleasant", "high-energy-unpleasant", "low-energy-pleasant", "low-energy-unpleasant"]),
  limit: z.coerce.number().min(1).max(50).default(20),
  threshold: z.coerce.number().min(0.01).max(1.0).default(0.6),
  exclude: z.string().optional().nullable(),
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const validation = recommendationQuerySchema.safeParse({
    mood: searchParams.get("mood"),
    limit: searchParams.get("limit"),
    threshold: searchParams.get("threshold"),
    exclude: searchParams.get("exclude"),
  })

  if (!validation.success) {
    return new Response(JSON.stringify({ error: "Invalid query parameters", details: validation.error.flatten() }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const { mood, limit, threshold, exclude } = validation.data

  try {
    const query_embedding = createQueryVectorForMood(mood as MoodQuadrant)
    const excludedIds = exclude ? exclude.split(",").map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : []

    // --- Primary Query ---
    let { data, error } = await supabase.rpc("match_movies_by_mood", {
      query_embedding: `[${query_embedding.join(",")}]`,
      match_threshold: threshold,
      match_count: limit + excludedIds.length, // Fetch extra to account for filtering
    })

    if (error) {
      console.error("Supabase RPC error (Primary Query):", error)
      return new Response(JSON.stringify({ error: "Database query failed", details: error.message }), { status: 500 })
    }

    let filteredData = data ? data.filter((movie: any) => !excludedIds.includes(movie.id)) : []

    // --- RESILIENT FALLBACK LOGIC ---
    // If the primary query yields no results, try again with a much lower threshold.
    if (filteredData.length === 0) {
      console.log(`No results for threshold ${threshold}. Retrying with fallback threshold 0.1...`)
      const fallbackResult = await supabase.rpc("match_movies_by_mood", {
        query_embedding: `[${query_embedding.join(",")}]`,
        match_threshold: 0.1, // A very low threshold to catch anything remotely similar
        match_count: limit + excludedIds.length,
      })

      if (fallbackResult.error) {
        console.error("Supabase RPC error (Fallback Query):", fallbackResult.error)
        return new Response(JSON.stringify({ error: "Database fallback query failed", details: fallbackResult.error.message }), { status: 500 })
      }
      
      filteredData = fallbackResult.data ? fallbackResult.data.filter((movie: any) => !excludedIds.includes(movie.id)) : []
    }

    // If there are STILL no results, then the vectors table is likely empty or there's a fundamental issue.
    if (filteredData.length === 0) {
        return new Response(JSON.stringify({ error: "No movies found in the database that match your request." }), {
            status: 404,
            headers: { "Content-Type": "application/json" },
        })
    }

    // --- Fetch TMDb Details for the final list ---
    const finalData = filteredData.slice(0, limit)
    const tmdbService = await import("@/lib/tmdb")
    const detailedMovies = await Promise.all(
      finalData.map(async (movie: any) => {
        try {
          const details = await tmdbService.getMovieDetails(movie.id, "US")
          return { ...movie, ...details }
        } catch (e) {
          console.warn(`Could not fetch details for movie ${movie.id}`, e)
          return movie // Fallback to basic data from our DB if TMDb fetch fails
        }
      })
    )

    return new Response(JSON.stringify(detailedMovies), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })

  } catch (err) {
    console.error("Unexpected error in recommendation route:", err)
    return new Response(JSON.stringify({ error: "An unexpected server error occurred" }), { status: 500 })
  }
}

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createQueryVectorForMood, type MoodQuadrant } from "@/lib/mood-vectors";
import * as tmdbService from "@/lib/tmdb";

// Don't use ! operator - let them be undefined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const recommendationQuerySchema = z.object({
  mood: z.enum(["high-energy-pleasant", "high-energy-unpleasant", "low-energy-pleasant", "low-energy-unpleasant"]),
  limit: z.coerce.number().min(1).max(50).default(20),
  threshold: z.coerce.number().min(0.01).max(1.0).default(0.6),
  exclude: z.string().optional().nullable(),
});

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Create client INSIDE the handler ✅
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json(
      { error: "Server configuration error - missing credentials" },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const { searchParams } = new URL(request.url);

  const validation = recommendationQuerySchema.safeParse({
    mood: searchParams.get("mood"),
    limit: searchParams.get("limit"),
    threshold: searchParams.get("threshold"),
    exclude: searchParams.get("exclude"),
  });

  if (!validation.success) {
    return NextResponse.json(
      { error: "Invalid query parameters", details: validation.error.flatten() },
      { status: 400 }
    );
  }

  const { mood, limit, threshold, exclude } = validation.data;

  try {
// In your route.ts, after creating the query_embedding
    const query_embedding = createQueryVectorForMood(mood as MoodQuadrant);
    
    // ADD THIS LINE BACK - Define excludedIds!
    const excludedIds = exclude ? exclude.split(",").map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];

    // Format numbers to ensure they're all floats
    const formattedEmbedding = query_embedding.map(n => n.toFixed(1));

    console.log("🔍 DEBUG - Query details:", {
      mood,
      query_embedding,
      embedding_string: `[${formattedEmbedding.join(",")}]`,
      threshold,
      excludedIds
    });

    // Use the formatted version
    let { data, error } = await supabase.rpc("match_movies_by_mood", {
      query_embedding: `[${formattedEmbedding.join(",")}]`,  // Will be "[0.2,0.0,0.7,0.1]"
      match_threshold: threshold,
      match_count: limit + excludedIds.length
    });

    if (error) {
      console.error("Supabase RPC error (Primary Query):", error);
      return NextResponse.json(
        { error: "Database query failed", details: error.message },
        { status: 500 }
      );
    }

    console.log("🔍 DEBUG - Primary query result:", {
      hasData: !!data,
      dataLength: data?.length,
      error
    });

    let filteredData = data ? data.filter((movie: any) => !excludedIds.includes(movie.id)) : [];

    // --- RESILIENT FALLBACK LOGIC ---
    // If the primary query yields no results, try again with a much lower threshold.
    if (filteredData.length === 0) {
      console.log(`No results for threshold ${threshold}. Retrying with fallback threshold 0.1...`);
      const fallbackResult = await supabase.rpc("match_movies_by_mood", {
        query_embedding: `[${query_embedding.join(",")}]`,
        match_threshold: 0.1, // A very low threshold to catch anything remotely similar
        match_count: limit + excludedIds.length,
      });

      if (fallbackResult.error) {
        console.error("Supabase RPC error (Fallback Query):", fallbackResult.error);
        return NextResponse.json(
          { error: "Database fallback query failed", details: fallbackResult.error.message },
          { status: 500 }
        );
      }
      
      filteredData = fallbackResult.data ? fallbackResult.data.filter((movie: any) => !excludedIds.includes(movie.id)) : [];
      
      // MOVED: Log fallback result INSIDE the if block where fallbackResult exists
      console.log("🔍 DEBUG - Fallback query result:", {
        hasData: !!fallbackResult.data,
        dataLength: fallbackResult.data?.length,
        error: fallbackResult.error
      });
    }

    // If there are STILL no results, then the vectors table is likely empty or there's a fundamental issue.
    if (filteredData.length === 0) {
      return NextResponse.json(
        { error: "No movies found in the database that match your request." },
        { status: 404 }
      );
    }

    // --- Fetch TMDb Details for the final list ---
    const finalData = filteredData.slice(0, limit);
    const detailedMovies = await Promise.all(
      finalData.map(async (movie: any) => {
        try {
          const details = await tmdbService.getMovieDetails(movie.id, "US");
          return { ...movie, ...details };
        } catch (e) {
          console.warn(`Could not fetch details for movie ${movie.id}`, e);
          return movie; // Fallback to basic data from our DB if TMDb fetch fails
        }
      })
    );

    return NextResponse.json(detailedMovies);

  } catch (err) {
    console.error("Unexpected error in recommendation route:", err);
    return NextResponse.json(
      { error: "An unexpected server error occurred" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createQueryVector, type MoodQuadrant, type SpecificMood } from "@/lib/mood-vectors";
import * as tmdbService from "@/lib/tmdb";

// Don't use ! operator - let them be undefined
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// ✨ UPDATE: Added `intention` and `reason` to the input validation schema.
const recommendationQuerySchema = z.object({
  mood: z.string(), // Keep as string to allow any mood label
  intention: z.enum(["sit", "shift"]).default("sit"),
  reason: z.string().optional().nullable(),
  limit: z.coerce.number().min(1).max(50).default(20),
  threshold: z.coerce.number().min(0.01).max(1.0).default(0.6),
  exclude: z.string().optional().nullable(),
});

// ✨ SHIFT LOGIC: This maps an initial mood to a more positive target mood.
const moodMappings: Record<SpecificMood, SpecificMood> = {
  // Unpleasant moods are mapped to pleasant ones
  angry: "energetic",
  anxious: "calm",
  stressed: "relaxed",
  sad: "content",
  tired: "calm",
  bored: "excited",
  // Pleasant moods can stay the same or be mapped to a different energy level
  excited: "excited",
  happy: "happy",
  energetic: "energetic",
  calm: "calm",
  content: "content",
  relaxed: "relaxed",
};

// ✨ SHIFT LOGIC: This maps an initial reason to "antidote" themes/keywords.
// These keywords should correspond to tags you have for your movies in the database.
const reasonToThemeMappings: Record<string, string[]> = {
  // Reasons for Sadness
  "Grieving a loss": ["hope", "healing", "human-connection", "life-affirming"],
  "Disappointed with an outcome": ["redemption", "second-chance", "perseverance"],
  "Feeling lonely or misunderstood": ["friendship", "community", "finding-your-place", "heartwarming"],
  "Missing someone or something from the past": ["new-beginnings", "adventure", "self-discovery"],
  "Hurting for someone else": ["empathy", "heroism", "inspirational"],
  "A sense of emptiness or longing": ["purpose", "adventure", "meaning-of-life"],

  // Reasons for Anxiety
  "Worrying about the unknown": ["comfort", "safety", "low-stakes", "feel-good"],
  "Facing a big decision": ["self-discovery", "inspirational", "biography"],
  "Afraid of failing or being judged": ["underdog-story", "perseverance", "comedy"],
  "Concerns about health or safety": ["reassurance", "feel-good", "calming"],
  "Feeling social pressure": ["authenticity", "individuality", "true-friendship"],
  "Stress about money or work": ["escape", "adventure", "comedy", "fantasy"],

  // Reasons for Anger
  "Feeling treated unfairly": ["justice", "empowerment", "vindication"],
  "My boundaries were crossed": ["empowerment", "standing-up", "self-respect"],
  "Feeling disrespected or unheard": ["finding-your-voice", "empowerment"],
  "Feeling blocked or frustrated": ["breakthrough", "overcoming-obstacles", "sports"],
  "Witnessing an injustice": ["heroism", "social-justice", "fighting-the-system"],
  "Dealing with a betrayal": ["resilience", "new-beginnings", "self-worth"],
  
  // Default/Fallback
  "default": ["comedy", "adventure", "feel-good"]
};


export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { searchParams } = new URL(request.url);

  const validation = recommendationQuerySchema.safeParse({
    mood: searchParams.get("mood"),
    intention: searchParams.get("intention"),
    reason: searchParams.get("reason"),
    limit: searchParams.get("limit"),
    threshold: searchParams.get("threshold"),
    exclude: searchParams.get("exclude"),
  });

  if (!validation.success) {
    return NextResponse.json({ error: "Invalid query parameters", details: validation.error.flatten() }, { status: 400 });
  }

  const { mood, intention, reason, limit, threshold, exclude } = validation.data;
  const excludedIds = exclude ? exclude.split(",").map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [];
  let moviesData;

  try {
    // ✨ SHIFT LOGIC: Main conditional to handle "sit" vs "shift"
    if (intention === 'shift' && reason) {
      console.log("🚀 SHIFT INTENTION DETECTED");
      // 1. Determine the target mood and themes
      const initialMood = mood as SpecificMood;
      const targetMood = moodMappings[initialMood] || "happy";
      const targetThemes = reasonToThemeMappings[reason] || reasonToThemeMappings["default"];

      // 2. Create the embedding for the TARGET mood
      const query_embedding = createQueryVector(targetMood);

      console.log("🔍 DEBUG - Shift details:", { initialMood, reason, targetMood, targetThemes, query_embedding });

      // 3. Call a NEW, more advanced RPC function
      // This function needs to be created in your Supabase backend.
      // It should perform a search that considers both the mood vector AND the theme keywords.
      const { data, error } = await supabase.rpc("match_movies_by_shift_intention", {
        query_embedding: `[${query_embedding.join(",")}]`,
        target_themes: targetThemes, // Pass themes as an array of strings
        match_threshold: threshold,
        match_count: limit + excludedIds.length,
      });

      if (error) throw new Error(`Database shift query failed: ${error.message}`);
      moviesData = data;

    } else {
      console.log("🧘 SIT INTENTION DETECTED");
      // This is the original logic for matching the current mood
      const query_embedding = createQueryVector(mood as SpecificMood | MoodQuadrant);
      
      const { data, error } = await supabase.rpc("match_movies_by_mood", {
        query_embedding: `[${query_embedding.join(",")}]`,
        match_threshold: threshold,
        match_count: limit + excludedIds.length
      });

      if (error) throw new Error(`Database sit query failed: ${error.message}`);
      moviesData = data;
    }

    let filteredData = moviesData ? moviesData.filter((movie: any) => !excludedIds.includes(movie.id)) : [];

    // --- RESILIENT FALLBACK LOGIC --- (remains the same)
    if (filteredData.length === 0) {
       console.log(`No results for threshold ${threshold}. Retrying with fallback threshold 0.1...`);
      const fallbackEmbedding = createQueryVector(mood as SpecificMood | MoodQuadrant);
      const fallbackResult = await supabase.rpc("match_movies_by_mood", {
        query_embedding: `[${fallbackEmbedding.join(",")}]`,
        match_threshold: 0.1,
        match_count: limit + excludedIds.length,
      });

      if (fallbackResult.error) throw new Error(`Database fallback query failed: ${fallbackResult.error.message}`);
      filteredData = fallbackResult.data ? fallbackResult.data.filter((movie: any) => !excludedIds.includes(movie.id)) : [];
    }
    
    if (filteredData.length === 0) {
      return NextResponse.json({ error: "No movies found matching your request." }, { status: 404 });
    }

    // --- Fetch TMDb Details for the final list --- (remains the same)
    const finalData = filteredData.slice(0, limit);
    const detailedMovies = await Promise.all(
      finalData.map(async (movie: any) => {
        try {
          const details = await tmdbService.getMovieDetails(movie.id, "US");
          return { ...movie, ...details };
        } catch (e) {
          console.warn(`Could not fetch details for movie ${movie.id}`, e);
          return movie;
        }
      })
    );

    return NextResponse.json(detailedMovies);

  } catch (err) {
    console.error("Unexpected error in recommendation route:", err);
    const errorMessage = err instanceof Error ? err.message : "An unexpected server error occurred";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createQueryVector, type MoodQuadrant, type SpecificMood } from "@/lib/mood-vectors";
import * as tmdbService from "@/lib/tmdb";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const recommendationQuerySchema = z.object({
  mood: z.string(),
  intention: z.enum(["sit", "shift"]).default("sit"),
  reason: z.string().optional().nullable(),
  limit: z.coerce.number().min(1).max(50).default(20),
  threshold: z.coerce.number().min(0.01).max(1.0).default(0.6),
  exclude: z.string().optional().nullable(),
});

const moodMappings: Record<SpecificMood, SpecificMood> = {
  angry: "energetic",
  anxious: "calm",
  stressed: "relaxed",
  sad: "content",
  tired: "calm",
  bored: "excited",
  excited: "excited",
  happy: "happy",
  energetic: "energetic",
  calm: "calm",
  content: "content",
  relaxed: "relaxed",
};

// ✨ UPDATE: The mapping object is now complete with all unpleasant moods.
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
  
  // Reasons for Stressed
  "Too much to do, too little time": ["simple-story", "relaxation", "comedy", "escapism"],
  "Juggling multiple responsibilities": ["low-stakes-plot", "comedy", "feel-good"],
  "Facing high-stakes pressure": ["calming", "soothing-visuals", "nature", "ambient"],
  "Dealing with a difficult conflict": ["resolution", "human-connection", "empathy"],
  "Feeling overwhelmed by my environment": ["peaceful", "calming", "nature", "minimalist"],
  "Feeling completely burned out": ["restorative", "gentle-humor", "inspirational", "hope"],

  // Reasons for Tired
  "Physically exhausted": ["engaging-story", "low-cognitive-load", "absorbing-world"],
  "Mentally or emotionally drained": ["soothing-visuals", "ambient", "nature", "instrumental-score"],
  "From a lack of quality sleep": ["calming", "relaxing", "gentle-story"],
  "Feeling run-down or unwell": ["comfort-watch", "heartwarming", "feel-good"],
  "Worn out from a long day or week": ["comedy", "lighthearted", "entertaining"],
  "Just a general lack of energy": ["passive-viewing", "visually-beautiful", "calm"],

  // Reasons for Bored
  "Needing mental stimulation": ["complex-plot", "mystery", "mind-bending", "sci-fi"],
  "Stuck in a monotonous routine": ["adventure", "new-cultures", "travel", "spontaneous"],
  "Feeling unchallenged or underused": ["intellectual", "documentary", "biography", "mastery"],
  "Lacking a meaningful task or goal": ["purpose", "inspirational", "social-impact"],
  "Feeling socially disconnected": ["ensemble-cast", "found-family", "deep-conversation"],
  "Feeling stuck or without direction": ["road-trip", "self-discovery", "new-perspectives"],
  
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
    if (intention === 'shift' && reason) {
      console.log("🚀 SHIFT INTENTION DETECTED");
      const initialMood = mood as SpecificMood;
      const targetMood = moodMappings[initialMood] || "happy";
      const targetThemes = reasonToThemeMappings[reason] || reasonToThemeMappings["default"];
      const query_embedding = createQueryVector(targetMood);

      console.log("🔍 DEBUG - Shift details:", { initialMood, reason, targetMood, targetThemes });

      const { data, error } = await supabase.rpc("match_movies_by_shift_intention", {
        query_embedding: `[${query_embedding.join(",")}]`,
        target_themes: targetThemes,
        match_threshold: threshold,
        match_count: limit + excludedIds.length,
      });

      if (error) throw new Error(`Database shift query failed: ${error.message}`);
      moviesData = data;

    } else {
      console.log("🧘 SIT INTENTION DETECTED");
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
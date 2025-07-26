// Debug the API route logic locally
import { config } from "dotenv"
import { resolve } from "path"

config({ path: resolve(process.cwd(), ".env.local") })

import { createClient } from "@supabase/supabase-js"
import { createQueryVectorForMood } from "../lib/mood-vectors"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugAPIRoute() {
  console.log("🔍 Debugging API route logic...")

  try {
    // Simulate exactly what your API route does
    const mood = "low-energy-pleasant"
    const limit = 5
    const threshold = 0.75 // Your current API default

    console.log(`\n1. Testing with mood: ${mood}`)
    console.log(`   Limit: ${limit}, Threshold: ${threshold}`)

    // Step 1: Create query vector (same as API)
    const query_embedding = createQueryVectorForMood(mood as any)
    console.log(`   Query vector: [${query_embedding.join(",")}]`)

    // Step 2: Call RPC function (same as API)
    const { data, error } = await supabase.rpc("match_movies_by_mood", {
      query_embedding: `[${query_embedding.join(",")}]`,
      match_threshold: threshold,
      match_count: limit,
    })

    if (error) {
      console.error("❌ RPC failed:", error)
      return
    }

    console.log(`✅ RPC returned: ${data?.length || 0} movies`)

    if (!data || data.length === 0) {
      console.log("\n⚠️ NO RESULTS WITH HIGH THRESHOLD!")
      console.log("Testing with lower threshold...")

      // Test with lower threshold
      const { data: lowData, error: lowError } = await supabase.rpc("match_movies_by_mood", {
        query_embedding: `[${query_embedding.join(",")}]`,
        match_threshold: 0.3,
        match_count: limit,
      })

      if (lowError) {
        console.error("❌ Low threshold also failed:", lowError)
      } else {
        console.log(`✅ Low threshold (0.3): ${lowData?.length || 0} movies`)
        if (lowData && lowData.length > 0) {
          console.log("🎯 SOLUTION: Lower your API threshold from 0.75 to 0.3")
        }
      }
      return
    }

    // Step 3: Test TMDb details fetching (this might be the issue)
    console.log("\n2. Testing TMDb details fetching...")

    try {
      const tmdbService = await import("../lib/tmdb")
      const firstMovie = data[0]

      console.log(`   Fetching details for: ${firstMovie.title} (ID: ${firstMovie.id})`)

      const details = await tmdbService.getMovieDetails(firstMovie.id, "US")
      console.log(`   ✅ TMDb details fetched successfully`)
      console.log(`   Title: ${details.title}`)
      console.log(`   Poster: ${details.poster_path ? "✅" : "❌"}`)
    } catch (tmdbError) {
      console.error("❌ TMDb details failed:", tmdbError)
      console.log("🎯 SOLUTION: TMDb API issue - check your TMDB_API_READ_ACCESS_TOKEN")
      return
    }

    console.log("\n✅ API route logic works perfectly!")
    console.log("🔧 The issue might be:")
    console.log("   1. Environment variables not set in Vercel")
    console.log("   2. Vercel function timeout")
    console.log("   3. CORS or deployment issue")
  } catch (error) {
    console.error("❌ Debug failed:", error)
  }
}

debugAPIRoute()

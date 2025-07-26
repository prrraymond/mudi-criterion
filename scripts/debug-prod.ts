import "./load-env"
import { createClient } from "@supabase/supabase-js"
import { createQueryVectorForMood } from "../lib/mood-vectors"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function debugProductionAPI() {
  console.log("🔍 Debugging production API issue...")

  try {
    // 1. Check if movies exist
    const { data: movieCount, error: countError } = await supabaseAdmin
      .from("movies")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("❌ Error counting movies:", countError)
      return
    }

    console.log(`📽️ Total movies in database: ${movieCount?.length || 0}`)

    // 2. Check if mood vectors exist
    const { data: vectorCount, error: vectorError } = await supabaseAdmin
      .from("movie_mood_vectors")
      .select("*", { count: "exact", head: true })

    if (vectorError) {
      console.error("❌ Error counting vectors:", vectorError)
      return
    }

    console.log(`🧠 Total mood vectors: ${vectorCount?.length || 0}`)

    // 3. Check if the RPC function exists and works
    console.log("\n🧪 Testing RPC function...")

    const testVector = createQueryVectorForMood("low-energy-pleasant")
    console.log("Test vector:", testVector)

    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc("match_movies_by_mood", {
      query_embedding: `[${testVector.join(",")}]`,
      match_threshold: 0.1,
      match_count: 5,
    })

    if (rpcError) {
      console.error("❌ RPC function error:", rpcError)
      console.log("This suggests the database function doesn't exist or has issues")

      // Check if function exists
      const { data: functions, error: funcError } = await supabaseAdmin
        .from("pg_proc")
        .select("proname")
        .eq("proname", "match_movies_by_mood")

      if (funcError) {
        console.log("Could not check for function existence")
      } else if (!functions || functions.length === 0) {
        console.log("❌ Function 'match_movies_by_mood' does not exist!")
        console.log("You need to run: scripts/01-create-match-movies-by-mood.sql")
      } else {
        console.log("✅ Function exists")
      }
    } else {
      console.log(`✅ RPC function returned ${rpcResult?.length || 0} results`)
      if (rpcResult && rpcResult.length > 0) {
        console.log("Sample result:", rpcResult[0])
      }
    }

    // 4. Test with different thresholds
    console.log("\n🎯 Testing different thresholds...")

    for (const threshold of [0.9, 0.5, 0.1, 0.01]) {
      const { data: thresholdResult, error: thresholdError } = await supabaseAdmin.rpc("match_movies_by_mood", {
        query_embedding: `[${testVector.join(",")}]`,
        match_threshold: threshold,
        match_count: 5,
      })

      if (thresholdError) {
        console.log(`Threshold ${threshold}: ERROR - ${thresholdError.message}`)
      } else {
        console.log(`Threshold ${threshold}: ${thresholdResult?.length || 0} results`)
      }
    }

    // 5. Check sample movie data
    console.log("\n📊 Sample movie data:")
    const { data: sampleMovies, error: sampleError } = await supabaseAdmin
      .from("movies")
      .select("id, title, genres")
      .limit(3)

    if (sampleError) {
      console.error("❌ Error fetching sample movies:", sampleError)
    } else {
      console.log("Sample movies:", sampleMovies)
    }

    // 6. Check sample vector data
    console.log("\n🧠 Sample vector data:")
    const { data: sampleVectors, error: sampleVectorError } = await supabaseAdmin
      .from("movie_mood_vectors")
      .select("movie_id, mood_quadrant, embedding")
      .limit(3)

    if (sampleVectorError) {
      console.error("❌ Error fetching sample vectors:", sampleVectorError)
    } else {
      console.log("Sample vectors:", sampleVectors)
    }
  } catch (error) {
    console.error("❌ Debug failed:", error)
  }
}

debugProductionAPI()



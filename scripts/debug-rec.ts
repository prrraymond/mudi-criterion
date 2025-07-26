// Debug script to test the recommendation system
import "./load-env"
import { createClient } from "@supabase/supabase-js"
import { createQueryVectorForMood } from "../lib/mood-vectors"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function debugRecommendations() {
  console.log("🔍 Debugging recommendation system...")

  try {
    // 1. Check if we have mood vectors
    const { data: vectorCount, error: countError } = await supabaseAdmin
      .from("movie_mood_vectors")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("❌ Error counting vectors:", countError)
      return
    }

    console.log(`📊 Total mood vectors in database: ${vectorCount?.length || 0}`)

    // 2. Check sample vectors
    const { data: sampleVectors, error: sampleError } = await supabaseAdmin
      .from("movie_mood_vectors")
      .select("movie_id, mood_quadrant, embedding")
      .limit(5)

    if (sampleError) {
      console.error("❌ Error fetching sample vectors:", sampleError)
      return
    }

    console.log("📝 Sample vectors:")
    sampleVectors?.forEach((v, i) => {
      console.log(`  ${i + 1}. Movie ${v.movie_id}: ${v.mood_quadrant} - ${v.embedding}`)
    })

    // 3. Test the RPC function directly
    console.log("\n🧪 Testing RPC function...")
    const queryVector = createQueryVectorForMood("low-energy-pleasant")
    console.log(`Query vector: [${queryVector.join(",")}]`)

    const { data: rpcResult, error: rpcError } = await supabaseAdmin.rpc("match_movies_by_mood", {
      query_embedding: `[${queryVector.join(",")}]`,
      match_threshold: 0.1, // Lower threshold for testing
      match_count: 5,
    })

    if (rpcError) {
      console.error("❌ RPC function error:", rpcError)
      return
    }

    console.log(`🎯 RPC function returned ${rpcResult?.length || 0} results`)
    if (rpcResult && rpcResult.length > 0) {
      console.log("Sample results:")
      rpcResult.slice(0, 3).forEach((movie: any, i: number) => {
        console.log(`  ${i + 1}. ${movie.title} (${movie.mood_quadrant}) - Similarity: ${movie.similarity}`)
      })
    }

    // 4. Test with different thresholds
    console.log("\n🎚️ Testing different thresholds...")
    for (const threshold of [0.1, 0.3, 0.5, 0.7]) {
      const { data: thresholdResult, error: thresholdError } = await supabaseAdmin.rpc("match_movies_by_mood", {
        query_embedding: `[${queryVector.join(",")}]`,
        match_threshold: threshold,
        match_count: 5,
      })

      if (!thresholdError) {
        console.log(`  Threshold ${threshold}: ${thresholdResult?.length || 0} results`)
      }
    }

    // 5. Check if the function exists
    console.log("\n🔧 Checking if RPC function exists...")
    const { data: functions, error: funcError } = await supabaseAdmin
      .from("pg_proc")
      .select("proname")
      .eq("proname", "match_movies_by_mood")

    if (funcError) {
      console.log("⚠️ Could not check function existence (this might be normal)")
    } else {
      console.log(`Function exists: ${functions && functions.length > 0 ? "✅ Yes" : "❌ No"}`)
    }
  } catch (error) {
    console.error("❌ Debug failed:", error)
  }
}

debugRecommendations()

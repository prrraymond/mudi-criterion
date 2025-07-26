// Debug script that loads environment variables from Vercel
import { config } from "dotenv"
import { resolve } from "path"
import { existsSync } from "fs"

// Try to load from .env.local (created by vercel env pull)
const envPath = resolve(process.cwd(), ".env.local")
if (existsSync(envPath)) {
  console.log("📁 Loading environment from .env.local")
  config({ path: envPath })
} else {
  console.log("⚠️ No .env.local found - run: vercel env pull .env.local")
  process.exit(1)
}

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Environment variables still missing after loading .env.local")
  console.log("SUPABASE_URL:", supabaseUrl ? "✅" : "❌")
  console.log("SUPABASE_ANON_KEY:", supabaseAnonKey ? "✅" : "❌")
  console.log("\n🔧 Try running: vercel env pull .env.local")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugWithVercelEnv() {
  console.log("🔍 Debugging with Vercel environment variables...")
  console.log(`Database URL: ${supabaseUrl.substring(0, 30)}...`)

  try {
    // 1. Test basic connection
    console.log("\n1. Testing database connection...")
    const { data: movieCount, error: movieError } = await supabase
      .from("movies")
      .select("*", { count: "exact", head: true })

    if (movieError) {
      console.error("❌ Cannot access movies table:", movieError)
      console.log("\n🔧 PERMISSION ISSUE DETECTED!")
      console.log("Your anon user cannot read the movies table.")
      console.log("Run this SQL in your Supabase dashboard:")
      console.log("```sql")
      console.log("ALTER TABLE public.movies DISABLE ROW LEVEL SECURITY;")
      console.log("ALTER TABLE public.movie_mood_vectors DISABLE ROW LEVEL SECURITY;")
      console.log("GRANT SELECT ON public.movies TO anon;")
      console.log("GRANT SELECT ON public.movie_mood_vectors TO anon;")
      console.log("```")
      return
    }

    console.log(`✅ Movies accessible: ${movieCount?.length || 0}`)

    // 2. Test mood vectors
    console.log("\n2. Testing mood vectors...")
    const { data: vectorCount, error: vectorError } = await supabase
      .from("movie_mood_vectors")
      .select("*", { count: "exact", head: true })

    if (vectorError) {
      console.error("❌ Cannot access mood vectors:", vectorError)
      console.log("🔧 Run the permission fix SQL above")
      return
    }

    console.log(`✅ Mood vectors accessible: ${vectorCount?.length || 0}`)

    // 3. Test RPC function
    console.log("\n3. Testing RPC function...")
    const { data: rpcResult, error: rpcError } = await supabase.rpc("match_movies_by_mood", {
      query_embedding: "[0,0,1,0]",
      match_threshold: 0.1, // Low threshold for testing
      match_count: 5,
    })

    if (rpcError) {
      console.error("❌ RPC function failed:", rpcError)

      if (rpcError.code === "42883") {
        console.log("\n🔧 RPC FUNCTION MISSING!")
        console.log("The match_movies_by_mood function doesn't exist.")
        console.log("Run this SQL in your Supabase dashboard:")
        console.log("```sql")
        console.log("-- Copy the contents of scripts/01-create-match-movies-by-mood.sql")
        console.log("```")
      } else {
        console.log("\n🔧 RPC PERMISSION ISSUE!")
        console.log("Add this to your SQL:")
        console.log("GRANT EXECUTE ON FUNCTION public.match_movies_by_mood(vector, real, int) TO anon;")
      }
      return
    }

    console.log(`✅ RPC function works: ${rpcResult?.length || 0} results`)

    if (rpcResult && rpcResult.length > 0) {
      console.log("Sample results:")
      rpcResult.slice(0, 2).forEach((movie: any, i: number) => {
        console.log(`  ${i + 1}. ${movie.title}`)
      })
    }

    // 4. Test with API-like parameters
    console.log("\n4. Testing with API parameters...")
    const { data: apiTest, error: apiError } = await supabase.rpc("match_movies_by_mood", {
      query_embedding: "[0,0,1,0]",
      match_threshold: 0.75, // Same as your API default
      match_count: 20,
    })

    if (apiError) {
      console.error("❌ API-style test failed:", apiError)
    } else {
      console.log(`✅ API-style test: ${apiTest?.length || 0} results`)

      if ((apiTest?.length || 0) === 0) {
        console.log("\n⚠️ NO RESULTS WITH HIGH THRESHOLD!")
        console.log("Your API threshold (0.75) is too strict.")
        console.log("Lower it in your API route to 0.3 or 0.1")
      }
    }

    // 5. Final diagnosis
    console.log("\n📋 FINAL DIAGNOSIS:")

    if ((movieCount?.length || 0) > 1000 && (vectorCount?.length || 0) > 1000 && rpcResult && rpcResult.length > 0) {
      if ((apiTest?.length || 0) === 0) {
        console.log("🎯 THRESHOLD TOO HIGH")
        console.log("Your database works, but the API threshold (0.75) is too strict")
        console.log("🔧 Lower the threshold in app/api/movies/recommendations/route.ts")
      } else {
        console.log("✅ EVERYTHING WORKS!")
        console.log("Your database and functions work perfectly")
        console.log("🔧 Check your Vercel function logs for the actual API error")
      }
    }
  } catch (error) {
    console.error("❌ Debug failed:", error)
  }
}

debugWithVercelEnv()

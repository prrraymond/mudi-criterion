import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

dotenv.config({ path: ".env.local" })

async function testProductionRPC() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  const supabase = createClient(supabaseUrl, supabaseServiceKey)

  console.log("🧪 Testing production RPC function directly...")

  // Test the exact same call your API route makes
  const testVector = "[0.0,0.0,1.0,0.0]" // low-energy-pleasant

  console.log("Calling RPC with:", {
    query_embedding: testVector,
    match_threshold: 0.1,
    match_count: 5,
  })

  const { data, error } = await supabase.rpc("match_movies_by_mood", {
    query_embedding: testVector,
    match_threshold: 0.1,
    match_count: 5,
  })

  if (error) {
    console.error("❌ RPC Error:", error)
  } else {
    console.log("✅ RPC Success:", data?.length, "results")
    console.log("Sample result:", data?.[0])
  }
}

testProductionRPC()

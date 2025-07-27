import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

async function testAPI() {
  console.log("🧪 Testing your actual deployed API...")

  const baseUrl = "https://www.mudicriterion.watch"

  // Test with very low threshold to ensure we get results
  const tests = [
    {
      name: "Low energy pleasant (low threshold)",
      url: `${baseUrl}/api/movies/recommendations?mood=low-energy-pleasant&limit=5&threshold=0.1`,
    },
    {
      name: "High energy pleasant (low threshold)",
      url: `${baseUrl}/api/movies/recommendations?mood=high-energy-pleasant&limit=3&threshold=0.1`,
    },
    {
      name: "Low energy unpleasant (very low threshold)",
      url: `${baseUrl}/api/movies/recommendations?mood=low-energy-unpleasant&limit=3&threshold=0.01`,
    },
  ]

  for (const test of tests) {
    console.log(`\n🔍 ${test.name}`)
    console.log(`URL: ${test.url}`)

    try {
      const response = await fetch(test.url)
      console.log(`Status: ${response.status} ${response.statusText}`)

      const data = await response.json()

      if (response.ok) {
        console.log(`✅ Success! Got ${data.length} movies`)
        console.log("Sample movie:", {
          title: data[0]?.title,
          mood_quadrant: data[0]?.mood_quadrant,
          similarity: data[0]?.similarity,
        })
      } else {
        console.log("❌ Error response:", data)
      }
    } catch (error) {
      console.error("❌ Request failed:", error)
    }
  }
}

testAPI()

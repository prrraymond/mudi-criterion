// Test the actual API endpoint to make sure it's working
import "./load-env"

async function testAPIEndpoint() {
  console.log("🧪 Testing the actual API endpoint...")

  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000"

  const testUrl = `${baseUrl}/api/movies/recommendations?mood=low-energy-pleasant&limit=5&threshold=0.3`

  try {
    console.log(`Making request to: ${testUrl}`)

    const response = await fetch(testUrl)
    const data = await response.json()

    console.log(`Status: ${response.status}`)
    console.log(`Response:`, JSON.stringify(data, null, 2))

    if (response.ok && Array.isArray(data) && data.length > 0) {
      console.log("\n✅ API is working! Sample movies:")
      data.slice(0, 3).forEach((movie: any, i: number) => {
        console.log(`  ${i + 1}. ${movie.title} (${movie.release_date?.substring(0, 4)})`)
      })
    } else {
      console.log("❌ API still not working properly")
    }
  } catch (error) {
    console.error("❌ API test failed:", error)
  }
}

testAPIEndpoint()

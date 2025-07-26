// Test your actual deployed API endpoint
async function testActualAPI() {
    console.log("🧪 Testing your actual deployed API...")
  
    // Replace with your actual Vercel URL
    const baseUrl = "https://www.mudicriterion.watch" // Updated with your actual domain!
  
    const testCases = [
      {
        name: "Basic test",
        url: `${baseUrl}/api/movies/recommendations?mood=low-energy-pleasant&limit=5&threshold=0.3`,
      },
      {
        name: "High energy test",
        url: `${baseUrl}/api/movies/recommendations?mood=high-energy-pleasant&limit=3&threshold=0.1`,
      },
    ]
  
    for (const test of testCases) {
      console.log(`\n🔍 ${test.name}`)
      console.log(`URL: ${test.url}`)
  
      try {
        const response = await fetch(test.url)
        const responseText = await response.text()
  
        console.log(`Status: ${response.status} ${response.statusText}`)
        console.log(`Headers:`, Object.fromEntries(response.headers.entries()))
  
        if (response.ok) {
          try {
            const data = JSON.parse(responseText)
            if (Array.isArray(data)) {
              console.log(`✅ Success: ${data.length} movies`)
              if (data.length > 0) {
                console.log(`Sample: ${data[0].title}`)
              }
            } else {
              console.log(`⚠️ Unexpected format:`, data)
            }
          } catch (e) {
            console.log(`❌ Invalid JSON response`)
            console.log(`Raw response: ${responseText.substring(0, 200)}...`)
          }
        } else {
          console.log(`❌ Error response:`)
          console.log(responseText)
        }
      } catch (error) {
        console.error(`❌ Request failed:`, error)
      }
    }
  }
  
  testActualAPI()
  
  
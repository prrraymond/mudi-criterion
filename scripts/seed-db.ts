// /scripts/seed-db.ts
// To run: npx tsx scripts/seed-db.ts
// This script REPLACES the existing database with a curated set of high-quality films with SPECIFIC MOOD vectors.

// IMPORTANT: This line must be the very first import to load environment variables
import "./load-env"

import { createClient } from "@supabase/supabase-js"
import { discoverMovies, getGenres, type Movie } from "../lib/tmdb"
import { generateMovieMoodVector, getSpecificMoodFromVector } from "../lib/mood-vectors"

// --- Curation & Seeding Configuration ---
const CURATED_PROVIDERS = [
  { id: "11", name: "Mubi" },
  { id: "258", name: "The Criterion Channel" },
  { id: "2", name: "Apple TV" },
  { id: "1899", name: "HBO Max" },
  { id: "8", name: "Netflix" },
  { id: "9", name: "Amazon Prime Video" },
  { id: "337", name: "Disney Plus" },
  { id: "15", name: "Hulu" },
  { id: "386", name: "Peacock" },
]
const WATCH_REGION = "US"

// Quality-focused filters (no year restrictions - classics are great!)
const VOTE_AVERAGE_MIN = 7.2 // Higher quality threshold
const VOTE_COUNT_MIN = 300   // More established films

// Reasonable limits for curated dataset
const MAX_PAGES_PER_CURATED_PROVIDER = 300  // Reduced for faster seeding
const MAX_PAGES_FOR_TOP_RATED = 300         // Reduced for faster seeding

// --- Supabase Client Setup ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase URL or Service Role Key is not configured. Check your .env.local file.")
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// Helper function to safely parse dates
function parseReleaseDate(dateString: string): string | null {
  if (!dateString || dateString.trim() === "") return null
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRegex.test(dateString)) return null
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return null
  return dateString
}

async function seedCuratedMovies() {
  console.log("🚀 Starting SPECIFIC MOOD vector generation process...")
  console.log("🎯 Focus: High-quality movies with 12 specific mood classifications")

  console.log("📚 Fetching genre list...")
  const genreMap = await getGenres()
  console.log("✅ Genre list fetched.")

  const allMoviesMap = new Map<number, Movie>()

  // --- BUCKET 1: Fetch curated movies from premium providers ---
  console.log("\n--- Fetching Bucket 1: Curated Providers ---")
  for (const provider of CURATED_PROVIDERS) {
    console.log(`\n🔎 Fetching curated movies from ${provider.name} (ID: ${provider.id})...`)
    let currentPage = 1, totalPages = 1
    let providerMovieCount = 0
    
    while (currentPage <= totalPages && currentPage <= MAX_PAGES_PER_CURATED_PROVIDER) {
      try {
        const response = await discoverMovies({ 
          with_watch_providers: provider.id, 
          watch_region: WATCH_REGION, 
          page: currentPage, 
          "vote_average.gte": VOTE_AVERAGE_MIN, 
          "vote_count.gte": VOTE_COUNT_MIN
        })
        totalPages = response.total_pages
        
        // Filter for quality movies (all eras welcome!)
        const filteredMovies = response.results.filter((movie) => 
          movie.poster_path && 
          movie.overview && 
          movie.genre_ids && 
          movie.genre_ids.length > 0
        )
        
        filteredMovies.forEach((movie) => {
          if (!allMoviesMap.has(movie.id)) {
            allMoviesMap.set(movie.id, movie)
            providerMovieCount++
          }
        })
        
        console.log(`  - Page ${currentPage}/${Math.min(totalPages, MAX_PAGES_PER_CURATED_PROVIDER)} | Provider: ${providerMovieCount} | Total: ${allMoviesMap.size}`)
        currentPage++
        await new Promise((resolve) => setTimeout(resolve, 300))
      } catch (error) { 
        console.error(`  - ❌ Failed to fetch page ${currentPage} for provider ${provider.name}:`, error); 
        break 
      }
    }
    console.log(`✅ ${provider.name}: ${providerMovieCount} movies added`)
  }

  // --- BUCKET 2: Add top-rated films from all eras ---
  console.log(`\n--- Fetching Bucket 2: Top-Rated Films (All Eras) ---`)
  console.log(`Filters: Rating >= ${VOTE_AVERAGE_MIN}, Votes >= ${VOTE_COUNT_MIN}`)
  
  let currentPage = 1, totalPages = 1
  let topRatedCount = 0
  
  while (currentPage <= totalPages && currentPage <= MAX_PAGES_FOR_TOP_RATED) {
    try {
      const response = await discoverMovies({ 
        watch_region: WATCH_REGION, 
        page: currentPage, 
        "vote_average.gte": VOTE_AVERAGE_MIN, 
        "vote_count.gte": VOTE_COUNT_MIN,
        sort_by: "vote_average.desc"
      })
      totalPages = response.total_pages
      
      // Filter for quality movies (including classics!)
      const filteredMovies = response.results.filter((movie) => 
        movie.poster_path && 
        movie.overview && 
        movie.genre_ids && 
        movie.genre_ids.length > 0
      )
      
      filteredMovies.forEach((movie) => {
        if (!allMoviesMap.has(movie.id)) {
          allMoviesMap.set(movie.id, movie)
          topRatedCount++
        }
      })
      
      console.log(`  - Page ${currentPage}/${Math.min(totalPages, MAX_PAGES_FOR_TOP_RATED)} | Top-rated: ${topRatedCount} | Total: ${allMoviesMap.size}`)
      currentPage++
      await new Promise((resolve) => setTimeout(resolve, 300))
    } catch (error) { 
      console.error(`  - ❌ Failed to fetch page ${currentPage} for top-rated films:`, error); 
      break 
    }
  }

  const allMovies = Array.from(allMoviesMap.values())
  console.log(`\n🎬 Final curated collection: ${allMovies.length} high-quality movies`)
  
  if (allMovies.length === 0) {
    return console.log("No movies met the criteria. Seeding process complete.")
  }

  // --- STEP 1: CLEAR EXISTING DATA ---
  console.log("\n🗑️ Clearing existing database...")
  
  // Delete all existing vectors first (foreign key constraint)
  const { error: vectorDeleteError } = await supabaseAdmin
    .from("movie_mood_vectors")
    .delete()
    .neq('movie_id', 0) // Delete all rows
    
  if (vectorDeleteError) {
    console.error("❌ Error deleting existing vectors:", vectorDeleteError)
    return
  }
  
  // Delete all existing movies
  const { error: movieDeleteError } = await supabaseAdmin
    .from("movies")
    .delete()
    .neq('id', 0) // Delete all rows
    
  if (movieDeleteError) {
    console.error("❌ Error deleting existing movies:", movieDeleteError)
    return
  }
  
  console.log("✅ Existing data cleared successfully")

  // --- STEP 2: INSERT NEW CURATED MOVIES ---
  const moviesToInsert = allMovies.map((movie) => ({
    id: movie.id,
    title: movie.title,
    overview: movie.overview,
    release_date: parseReleaseDate(movie.release_date),
    poster_path: movie.poster_path,
    genres: JSON.stringify(movie.genre_ids!.map((id) => ({ 
      id, 
      name: genreMap.get(id) || "Unknown" 
    }))),
    vote_average: movie.vote_average,
    vote_count: movie.vote_count,
    popularity: movie.popularity
  }))

  console.log(`\n💾 Inserting ${moviesToInsert.length} curated movies...`)
  const batchSize = 100
  let successfulInserts = 0
  
  for (let i = 0; i < moviesToInsert.length; i += batchSize) {
    const batch = moviesToInsert.slice(i, i + batchSize)
    const { error: movieError } = await supabaseAdmin
      .from("movies")
      .insert(batch) // Use insert since we cleared the table
      
    if (movieError) { 
      console.error(`❌ Error inserting movie batch:`, movieError) 
    } else { 
      successfulInserts += batch.length 
      console.log(`  - Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} movies inserted`)
    }
  }
  
  console.log(`📊 Successfully inserted ${successfulInserts}/${moviesToInsert.length} movies`)
  
  if (successfulInserts === 0) {
    return console.log("❌ No movies were inserted. Stopping here.")
  }

  // --- STEP 3: GENERATE SPECIFIC MOOD VECTORS ---
  console.log("\n🧠 Generating SPECIFIC MOOD vectors for curated collection...")
  console.log("🎭 Each movie will be classified into one of 12 specific moods")
  
  const moodDistribution = {
    excited: 0, happy: 0, energetic: 0,
    angry: 0, anxious: 0, stressed: 0,
    calm: 0, content: 0, relaxed: 0,
    sad: 0, tired: 0, bored: 0
  }
  
  const vectorsToInsert = moviesToInsert.map((movie) => {
    const genreIds = JSON.parse(movie.genres).map((g: {id: number}) => g.id)
    const embedding = generateMovieMoodVector(genreIds)
    
    // NEW: Get specific mood instead of quadrant
    const specificMood = getSpecificMoodFromVector(embedding)
    moodDistribution[specificMood as keyof typeof moodDistribution]++
    
    return { 
      movie_id: movie.id, 
      embedding: `[${embedding.join(",")}]`, 
      mood_quadrant: specificMood  // Store specific mood in mood_quadrant column
    }
  })
  
  console.log(`✅ Generated ${vectorsToInsert.length} specific mood vectors`)
  console.log("\n🎭 Mood Distribution:")
  Object.entries(moodDistribution).forEach(([mood, count]) => {
    console.log(`  ${mood}: ${count} movies`)
  })
  
  // Insert vectors
  console.log("\n💾 Inserting specific mood vectors...")
  for (let i = 0; i < vectorsToInsert.length; i += batchSize) {
    const batch = vectorsToInsert.slice(i, i + batchSize)
    const { error } = await supabaseAdmin
      .from("movie_mood_vectors")
      .insert(batch) // Use insert since we cleared the table
      
    if (error) {
      console.error(`❌ Error inserting vector batch:`, error)
    } else {
      console.log(`  - Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} vectors inserted`)
    }
  }
  
  console.log("✅ Specific mood vector insertion complete")
  console.log("\n🎉 Enhanced database generation finished!")
  console.log(`📈 Database now contains ${successfulInserts} movies with specific mood classifications`)
  console.log("🎭 Users can now get recommendations for 12 different emotional states!")
}

// --- Run the script ---
seedCuratedMovies().catch(console.error)
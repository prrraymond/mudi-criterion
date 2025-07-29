// /scripts/seed-db.ts
// To run: npx tsx scripts/seed-db.ts
// This script fetches movies from specific providers AND a general list of top-rated films.

// IMPORTANT: This line must be the very first import to load environment variables
import "./load-env"

import { createClient } from "@supabase/supabase-js"
import { discoverMovies, getGenres, type Movie } from "../lib/tmdb"
import { generateMovieMoodVector, getPrimaryMoodQuadrant } from "../lib/mood-vectors"

// --- Curation & Seeding Configuration ---
const CURATED_PROVIDERS = [
  { id: "11", name: "Mubi" },
  { id: "258", name: "The Criterion Channel" },
  { id: "2", name: "Apple TV" },
  { id: "384", name: "HBO Max" },
  { id: "8", name: "Netflix" },
  { id: "9", name: "Amazon Prime Video" },
  { id: "337", name: "Disney Plus" },
  { id: "15", name: "Hulu" }, // Note: Hulu uses same ID as Mubi in TMDb
  { id: "386", name: "Peacock" },
]
const WATCH_REGION = "US"

// Filters for the "Top-Rated" bucket
const VOTE_AVERAGE_MIN = 7.5 // Lowered slightly to get more movies
const VOTE_COUNT_MIN = 2000 // Lowered to include more films

// Increase limits for production seeding
const MAX_PAGES_PER_CURATED_PROVIDER = 300 // This should give you plenty
const MAX_PAGES_FOR_TOP_RATED = 300 // This will give you ~2000 top-rated films

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


// --- Seeding Logic ---

async function seedCuratedMovies() {
  console.log("🚀 Starting multi-bucket movie seeding process...")

  console.log("📚 Fetching genre list...")
  const genreMap = await getGenres()
  console.log("✅ Genre list fetched.")

  const allMoviesMap = new Map<number, Movie>()

  // --- BUCKET 1: Fetch all movies from curated providers ---
  console.log("\n--- Fetching Bucket 1: Curated Providers ---")
  for (const provider of CURATED_PROVIDERS) {
    console.log(`\n🔎 Fetching ALL movies from ${provider.name} (ID: ${provider.id})...`)
    let currentPage = 1, totalPages = 1
    while (currentPage <= totalPages && currentPage <= MAX_PAGES_PER_CURATED_PROVIDER) {
      try {
        const response = await discoverMovies({ with_watch_providers: provider.id, watch_region: WATCH_REGION, page: currentPage, "vote_average.gte": VOTE_AVERAGE_MIN, "vote_count.gte": VOTE_COUNT_MIN })
        totalPages = response.total_pages
        response.results.forEach((movie) => allMoviesMap.set(movie.id, movie))
        console.log(`  - Page ${currentPage}/${totalPages} fetched. Total unique movies so far: ${allMoviesMap.size}`)
        currentPage++
        await new Promise((resolve) => setTimeout(resolve, 300))
      } catch (error) { console.error(`  - ❌ Failed to fetch page ${currentPage} for provider ${provider.name}:`, error); break }
    }
  }

  // --- BUCKET 2: Fetch all top-rated movies from any provider ---
  console.log("\n--- Fetching Bucket 2: Top-Rated Films (All Platforms) ---")
  console.log(`Filters: Rating >= ${VOTE_AVERAGE_MIN}, Votes >= ${VOTE_COUNT_MIN}`)
  let currentPage = 1, totalPages = 1
  while (currentPage <= totalPages && currentPage <= MAX_PAGES_FOR_TOP_RATED) {
    try {
      const response = await discoverMovies({ watch_region: WATCH_REGION, page: currentPage, "vote_average.gte": VOTE_AVERAGE_MIN, "vote_count.gte": VOTE_COUNT_MIN, with_watch_providers: "" })
      totalPages = response.total_pages
      response.results.forEach((movie) => allMoviesMap.set(movie.id, movie))
      console.log(`  - Page ${currentPage}/${totalPages} fetched. Total unique movies so far: ${allMoviesMap.size}`)
      currentPage++
      await new Promise((resolve) => setTimeout(resolve, 300))
    } catch (error) { console.error(`  - ❌ Failed to fetch page ${currentPage} for top-rated films:`, error); break }
  }

  const allMovies = Array.from(allMoviesMap.values())
  console.log(`\n🎬 Total unique, high-quality movies found from all buckets: ${allMovies.length}`)
  if (allMovies.length === 0) return console.log("No movies met the criteria. Seeding process complete.")

  // --- Final Processing and Insertion (Steps 3, 4, 5) ---
  const moviesToInsert = allMovies
    .filter((movie) => movie.poster_path && movie.overview && movie.genre_ids && movie.genre_ids.length > 0)
    .map((movie) => ({ id: movie.id, title: movie.title, overview: movie.overview, release_date: parseReleaseDate(movie.release_date), poster_path: movie.poster_path, genres: JSON.stringify(movie.genre_ids!.map((id) => ({ id, name: genreMap.get(id) || "Unknown" }))), vote_average: movie.vote_average, vote_count: movie.vote_count, popularity: movie.popularity }))

  console.log(`\n💾 Upserting ${moviesToInsert.length} movies into the database...`)
  const batchSize = 100
  let successfulInserts = 0
  for (let i = 0; i < moviesToInsert.length; i += batchSize) {
    const batch = moviesToInsert.slice(i, i + batchSize)
    const { error: movieError } = await supabaseAdmin.from("movies").upsert(batch, { onConflict: "id" })
    if (movieError) { console.error(`❌ Error inserting movie batch:`, movieError) } 
    else { successfulInserts += batch.length }
  }
  console.log(`📊 Successfully inserted ${successfulInserts}/${moviesToInsert.length} movies`)
  if (successfulInserts === 0) return console.log("❌ No movies were inserted. Stopping here.")

  // --- FIX 2: Forceful Vector Regeneration ---
  const movieIdsToProcess = moviesToInsert.map(m => m.id);

  // 1. DELETE old vectors for the movies we are about to process IN BATCHES.
  console.log(`\n🗑️ Deleting up to ${movieIdsToProcess.length} old vectors in batches to prepare for refresh...`)
  const deleteBatchSize = 1000; // Use a larger batch size for deletes
  for (let i = 0; i < movieIdsToProcess.length; i += deleteBatchSize) {
      const batch = movieIdsToProcess.slice(i, i + deleteBatchSize);
      console.log(`   - Deleting batch ${Math.floor(i / deleteBatchSize) + 1}... (${batch.length} vectors)`)
      const { error: deleteError } = await supabaseAdmin.from('movie_mood_vectors').delete().in('movie_id', batch);
      if (deleteError) {
          console.error("❌ Critical error deleting vector batch:", deleteError);
          // Decide if you want to stop or continue on error
          // return; 
      }
  }
  console.log("✅ Old vectors deleted successfully.")

  // 2. GENERATE new, nuanced vectors.
  console.log("\n🧠 Generating new nuanced vectors...")
  const vectorsToInsert = moviesToInsert.map((movie) => {
      const genreIds = JSON.parse(movie.genres).map((g: {id: number}) => g.id)
      const embedding = generateMovieMoodVector(genreIds)
      const mood_quadrant = getPrimaryMoodQuadrant(embedding)
      return { movie_id: movie.id, embedding: `[${embedding.join(",")}]`, mood_quadrant }
    })
  console.log(`✅ Generated ${vectorsToInsert.length} new vectors.`)
  
  // 3. INSERT the new vectors.
  console.log("\n💾 Inserting new vectors into the database...")
  for (let i = 0; i < vectorsToInsert.length; i += batchSize) {
    const batch = vectorsToInsert.slice(i, i + batchSize)
    const { error } = await supabaseAdmin.from("movie_mood_vectors").insert(batch)
    if (error) console.error(`❌ Error inserting vector batch:`, error)
  }
  console.log("✅ Vector insertion process complete.")
  console.log("\n🎉 Seeding process finished!")
}

// --- Run the script ---
seedCuratedMovies().catch(console.error)

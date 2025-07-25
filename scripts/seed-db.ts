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
  { id: "15", name: "Mubi" },
  { id: "258", name: "The Criterion Channel" },
]
const WATCH_REGION = "US"

// Filters for the "Top-Rated" bucket
const VOTE_AVERAGE_MIN = 7.0
const VOTE_COUNT_MIN = 500

// Caps to prevent excessively long runs.
// Set to a high number (e.g., 999) to fetch all available pages.
const MAX_PAGES_PER_CURATED_PROVIDER = 200
const MAX_PAGES_FOR_TOP_RATED = 200 // Fetch more pages for the general top-rated list

// --- Supabase Client Setup ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase URL or Service Role Key is not configured. Check your .env.local file.")
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

// --- Seeding Logic ---

async function seedCuratedMovies() {
  console.log("🚀 Starting multi-bucket movie seeding process...")

  // 1. Fetch master genre list once for efficiency
  console.log("📚 Fetching genre list...")
  const genreMap = await getGenres()
  console.log("✅ Genre list fetched.")

  const allMoviesMap = new Map<number, Movie>()

  // --- BUCKET 1: Fetch all movies from curated providers ---
  console.log("\n--- Fetching Bucket 1: Curated Providers ---")
  for (const provider of CURATED_PROVIDERS) {
    console.log(`\n🔎 Fetching ALL movies from ${provider.name} (ID: ${provider.id})...`)
    let currentPage = 1
    let totalPages = 1

    while (currentPage <= totalPages && currentPage <= MAX_PAGES_PER_CURATED_PROVIDER) {
      try {
        const response = await discoverMovies({
          with_watch_providers: provider.id,
          watch_region: WATCH_REGION,
          page: currentPage,
          // No rating filters for this bucket
          "vote_average.gte": 0,
          "vote_count.gte": 0,
        })

        totalPages = response.total_pages
        response.results.forEach((movie) => allMoviesMap.set(movie.id, movie))

        console.log(`  - Page ${currentPage}/${totalPages} fetched. Total unique movies so far: ${allMoviesMap.size}`)
        currentPage++
        await new Promise((resolve) => setTimeout(resolve, 300))
      } catch (error) {
        console.error(`  - ❌ Failed to fetch page ${currentPage} for provider ${provider.name}:`, error)
        break
      }
    }
  }

  // --- BUCKET 2: Fetch all top-rated movies from any provider ---
  console.log("\n--- Fetching Bucket 2: Top-Rated Films (All Platforms) ---")
  console.log(`Filters: Rating >= ${VOTE_AVERAGE_MIN}, Votes >= ${VOTE_COUNT_MIN}`)
  let currentPage = 1
  let totalPages = 1
  while (currentPage <= totalPages && currentPage <= MAX_PAGES_FOR_TOP_RATED) {
    try {
      const response = await discoverMovies({
        watch_region: WATCH_REGION,
        page: currentPage,
        "vote_average.gte": VOTE_AVERAGE_MIN,
        "vote_count.gte": VOTE_COUNT_MIN,
        with_watch_providers: "", // Empty string to search all
      })

      totalPages = response.total_pages
      response.results.forEach((movie) => allMoviesMap.set(movie.id, movie))

      console.log(`  - Page ${currentPage}/${totalPages} fetched. Total unique movies so far: ${allMoviesMap.size}`)
      currentPage++
      await new Promise((resolve) => setTimeout(resolve, 300))
    } catch (error) {
      console.error(`  - ❌ Failed to fetch page ${currentPage} for top-rated films:`, error)
      break
    }
  }

  const allMovies = Array.from(allMoviesMap.values())
  console.log(`\n🎬 Total unique, high-quality movies found from all buckets: ${allMovies.length}`)

  if (allMovies.length === 0) {
    console.log("No movies met the criteria. Seeding process complete.")
    return
  }

  // --- Final Processing and Insertion (Steps 3, 4, 5) ---
  const moviesToInsert = allMovies
    .filter((movie) => movie.poster_path && movie.overview && movie.genre_ids && movie.genre_ids.length > 0)
    .map((movie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      release_date: movie.release_date,
      poster_path: movie.poster_path,
      genres: JSON.stringify(movie.genre_ids!.map((id) => ({ id, name: genreMap.get(id) || "Unknown" }))),
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      popularity: movie.popularity,
    }))

  console.log(`\n💾 Upserting ${moviesToInsert.length} movies into the database...`)
  const { error: movieError } = await supabaseAdmin.from("movies").upsert(moviesToInsert, { onConflict: "id" })

  if (movieError) {
    console.error("❌ Error inserting movies:", movieError)
    return
  }
  console.log("✅ Successfully inserted movies.")

  // --- CRITICAL FIX: Get the actual list of movies that exist in the database ---
  console.log("\n🔍 Fetching existing movies from database to ensure vector consistency...")
  const { data: existingMovies, error: fetchError } = await supabaseAdmin.from("movies").select("id")

  if (fetchError) {
    console.error("❌ Error fetching existing movies:", fetchError)
    return
  }

  const existingMovieIds = new Set(existingMovies?.map((m) => m.id) || [])
  console.log(`📊 Found ${existingMovieIds.size} existing movies in database`)

  // --- Generate vectors ONLY for movies that actually exist in the database ---
  console.log("\n🧠 Generating and inserting mood vectors...")
  const vectorsToInsert = allMovies
    .filter((movie) => {
      // Only process movies that:
      // 1. Have genre data
      // 2. Actually exist in the database
      const hasGenres = movie.genre_ids && movie.genre_ids.length > 0
      const existsInDb = existingMovieIds.has(movie.id)

      if (hasGenres && !existsInDb) {
        console.log(`⚠️  Skipping movie ${movie.id} (${movie.title}) - not found in database`)
      }

      return hasGenres && existsInDb
    })
    .map((movie) => {
      const embedding = generateMovieMoodVector(movie.genre_ids!)
      const mood_quadrant = getPrimaryMoodQuadrant(embedding)
      return {
        movie_id: movie.id,
        embedding: `[${embedding.join(",")}]`,
        mood_quadrant,
      }
    })

  console.log(`🎯 Processing ${vectorsToInsert.length} mood vectors for existing movies...`)

  if (vectorsToInsert.length === 0) {
    console.log("⚠️  No mood vectors to insert.")
    return
  }

  // Insert vectors in batches to handle large datasets
  const batchSize = 100
  let successfulBatches = 0

  for (let i = 0; i < vectorsToInsert.length; i += batchSize) {
    const batch = vectorsToInsert.slice(i, i + batchSize)
    const batchNumber = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(vectorsToInsert.length / batchSize)

    console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} vectors)...`)

    const { error: vectorError } = await supabaseAdmin
      .from("movie_mood_vectors")
      .upsert(batch, { onConflict: "movie_id" })

    if (vectorError) {
      console.error(`❌ Error inserting mood vectors batch ${batchNumber}:`, vectorError)
      // Continue with other batches instead of stopping
    } else {
      successfulBatches++
      console.log(`✅ Successfully inserted batch ${batchNumber}/${totalBatches}`)
    }
  }

  console.log(
    `\n🎉 Seeding process complete! Successfully processed ${successfulBatches}/${Math.ceil(vectorsToInsert.length / batchSize)} batches.`,
  )
}

// --- Run the script ---
seedCuratedMovies().catch(console.error)



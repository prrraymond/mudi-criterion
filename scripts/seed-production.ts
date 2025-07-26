// Production database seeding script
import "./load-env"
import { createClient } from "@supabase/supabase-js"
import { discoverMovies, getGenres, type Movie } from "../lib/tmdb-discover"
import { generateMovieMoodVector, getPrimaryMoodQuadrant } from "../lib/mood-vectors"

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase URL or Service Role Key is not configured. Check your environment variables.")
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

async function seedProductionDatabase() {
  console.log("🚀 Starting production database seeding...")

  try {
    // 1. Fetch genre list
    console.log("📚 Fetching genre list...")
    const genreMap = await getGenres()
    console.log("✅ Genre list fetched.")

    // 2. Fetch popular movies (faster than curated approach for initial deployment)
    console.log("\n🎬 Fetching popular movies...")
    const allMovies: Movie[] = []

    // Fetch first 10 pages of popular movies (200 movies)
    for (let page = 1; page <= 10; page++) {
      try {
        const response = await discoverMovies({
          page,
          "vote_average.gte": 6.0,
          "vote_count.gte": 100,
        })

        allMovies.push(...response.results)
        console.log(`  - Page ${page}/10 fetched. Total movies: ${allMovies.size}`)

        // Rate limiting
        await new Promise((resolve) => setTimeout(resolve, 250))
      } catch (error) {
        console.error(`  - ❌ Failed to fetch page ${page}:`, error)
        break
      }
    }

    console.log(`\n🎬 Total movies found: ${allMovies.length}`)

    if (allMovies.length === 0) {
      console.log("No movies found. Exiting.")
      return
    }

    // 3. Filter and prepare movies for insertion
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

    console.log(`\n💾 Inserting ${moviesToInsert.length} movies into database...`)

    // Insert in batches
    const batchSize = 50
    for (let i = 0; i < moviesToInsert.length; i += batchSize) {
      const batch = moviesToInsert.slice(i, i + batchSize)
      const { error } = await supabaseAdmin.from("movies").upsert(batch, { onConflict: "id" })

      if (error) {
        console.error(`❌ Error inserting batch ${Math.floor(i / batchSize) + 1}:`, error)
      } else {
        console.log(
          `✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(moviesToInsert.length / batchSize)}`,
        )
      }
    }

    // 4. Generate mood vectors
    console.log("\n🧠 Generating mood vectors...")
    const vectorsToInsert = allMovies
      .filter((movie) => movie.genre_ids && movie.genre_ids.length > 0)
      .map((movie) => {
        const embedding = generateMovieMoodVector(movie.genre_ids!)
        const mood_quadrant = getPrimaryMoodQuadrant(embedding)
        return {
          movie_id: movie.id,
          embedding: `[${embedding.join(",")}]`,
          mood_quadrant,
        }
      })

    console.log(`🎯 Inserting ${vectorsToInsert.length} mood vectors...`)

    // Insert vectors in batches
    for (let i = 0; i < vectorsToInsert.length; i += batchSize) {
      const batch = vectorsToInsert.slice(i, i + batchSize)
      const { error } = await supabaseAdmin.from("movie_mood_vectors").upsert(batch, { onConflict: "movie_id" })

      if (error) {
        console.error(`❌ Error inserting vector batch ${Math.floor(i / batchSize) + 1}:`, error)
      } else {
        console.log(
          `✅ Inserted vector batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(vectorsToInsert.length / batchSize)}`,
        )
      }
    }

    console.log("\n🎉 Production database seeding complete!")
    console.log(`📊 Summary:`)
    console.log(`   - Movies inserted: ${moviesToInsert.length}`)
    console.log(`   - Mood vectors created: ${vectorsToInsert.length}`)
  } catch (error) {
    console.error("❌ Seeding failed:", error)
    process.exit(1)
  }
}

// Run the seeding
seedProductionDatabase().catch(console.error)

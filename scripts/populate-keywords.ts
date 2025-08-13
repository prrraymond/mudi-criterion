const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: '.env.local' });

interface MovieRecord {
  id: number;
  title: string;
}

// --- CONFIGURATION ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const tmdbApiKey = process.env.TMDB_API_KEY;

if (!supabaseUrl || !supabaseServiceKey || !tmdbApiKey) {
  throw new Error("Missing environment variables. Check your .env.local file.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const BATCH_SIZE = 50;
const DELAY_MS = 1000;

const formatKeyword = (keyword: string): string => {
  return keyword.toLowerCase().replace(/\s+/g, "-");
};

// ✨ NEW: Function to get the total count of movies to process
async function getTotalCount() {
  const { count, error } = await supabase
    .from("movies")
    .select('*', { count: 'exact', head: true })
    .is("keywords", null);
  
  if (error) {
    console.error("❌ Could not get total count:", error.message);
    return 0;
  }
  return count || 0;
}

async function populateMovieKeywords() {
  console.log("🚀 Starting keyword population script...");
  
  // ✨ NEW: Get and display the total count at the beginning
  const totalToProcess = await getTotalCount();
  if (totalToProcess === 0) {
    console.log("✅ All movies already have keywords. Nothing to do.");
    return;
  }
  console.log(`📊 Found ${totalToProcess} movies needing keywords.`);

  let totalProcessed = 0;
  let hasMore = true;
  let page = 0;

  while (hasMore) {
    const from = page * BATCH_SIZE;
    const to = from + BATCH_SIZE - 1;

    console.log(`\nFetching batch ${page + 1} (movies ${from} to ${to})...`);

    const { data: movies, error: fetchError } = await supabase
      .from("movies")
      .select("id, title")
      .is("keywords", null)
      .range(from, to);

    if (fetchError) {
      console.error("❌ Error fetching movies from Supabase:", fetchError.message);
      return;
    }

    if (!movies || movies.length === 0) {
      console.log("✅ No more movies to process.");
      hasMore = false;
      continue;
    }
    
    const keywordPromises = movies.map(async (movie: MovieRecord) => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movie.id}/keywords?api_key=${tmdbApiKey}`
        );

        if (!response.ok) {
          console.warn(`Could not fetch keywords for "${movie.title}" (ID: ${movie.id}). Status: ${response.status}`);
          return null;
        }

        const data = await response.json();
        const keywords = data.keywords || [];
        const formattedKeywords = keywords.map((kw: { name: string }) => formatKeyword(kw.name));
        
        return {
          id: movie.id,
          title: movie.title,
          keywords: formattedKeywords,
        };
      } catch (e) {
        console.error(`❌ Network error fetching keywords for "${movie.title}":`, e);
        return null;
      }
    });

    const moviesWithKeywords = (await Promise.all(keywordPromises)).filter(
      (m): m is { id: number; title: string; keywords: string[] } => m !== null && m.keywords.length > 0
    );

    if (moviesWithKeywords.length === 0) {
      console.log("No movies in this batch had keywords on TMDb. Moving to next batch.");
      page++;
      continue;
    }

    const { error: updateError } = await supabase
      .from("movies")
      .upsert(moviesWithKeywords);

    if (updateError) {
      console.error("❌ Error updating movies in Supabase:", updateError.message);
    } else {
      totalProcessed += moviesWithKeywords.length;
      // ✨ NEW: Improved progress log
      console.log(`✅ Successfully updated ${moviesWithKeywords.length} movies. Total processed so far: ${totalProcessed} of ${totalToProcess}.`);
    }

    page++;
    console.log(`--- Waiting ${DELAY_MS / 1000}s before next batch... ---`);
    await new Promise((res) => setTimeout(res, DELAY_MS));
  }

  console.log(`\n\n🎉 Script finished! Total movies updated in this run: ${totalProcessed}.`);
}

populateMovieKeywords();
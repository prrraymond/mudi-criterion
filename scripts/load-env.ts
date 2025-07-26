// Load environment variables for scripts
import { config } from "dotenv"
import { resolve } from "path"

// Load .env.local for local development
config({ path: resolve(process.cwd(), ".env.local") })

// Also try to load from process.env (for production)
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log("Loading from .env file...")
  config()
}

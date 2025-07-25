import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database
export interface UserProfile {
  id: string
  email: string
  display_name: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface SavedMovie {
  id: number
  user_id: string
  movie_id: number
  movie_title: string
  movie_poster_path?: string
  movie_overview?: string
  movie_release_date?: string
  saved_at: string
  mood_when_saved?: string
  reason_when_saved?: string
}

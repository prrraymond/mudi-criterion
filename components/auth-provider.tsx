"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@supabase/supabase-js"

// Create Supabase client with better error handling
let supabase: any = null

function getSupabaseClient() {
  if (supabase) return supabase

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Check if environment variables exist and are valid
  if (!supabaseUrl || !supabaseKey) {
    console.warn("Supabase environment variables not found")
    return createMockClient()
  }

  // Validate URL format
  if (!supabaseUrl.startsWith("https://") || !supabaseUrl.includes(".supabase.co")) {
    console.error("Invalid Supabase URL format:", supabaseUrl)
    return createMockClient()
  }

  // Validate API key format (should be a long string)
  if (supabaseKey.length < 100) {
    console.error("Invalid Supabase API key format - key too short")
    return createMockClient()
  }

  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })

    // Test the connection
    supabase.auth.getSession().catch((error: any) => {
      console.error("Supabase connection test failed:", error)
      if (error.message?.includes("Invalid API key") || error.message?.includes("API key")) {
        console.error("API key is invalid or project may be paused")
      }
    })

    return supabase
  } catch (error) {
    console.error("Failed to create Supabase client:", error)
    return createMockClient()
  }
}

function createMockClient() {
  console.warn("Using mock Supabase client - authentication will not work")
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: (callback: any) => {
        // Call callback immediately with no session
        callback("SIGNED_OUT", null)
        return {
          data: {
            subscription: {
              unsubscribe: () => console.log("Mock auth unsubscribed"),
            },
          },
        }
      },
      signInWithOAuth: () =>
        Promise.resolve({
          error: { message: "Authentication service unavailable. Please try again later." },
        }),
      signInWithPassword: () =>
        Promise.resolve({
          error: { message: "Authentication service unavailable. Please try again later." },
        }),
      signUp: () =>
        Promise.resolve({
          error: { message: "Authentication service unavailable. Please try again later." },
        }),
      resetPasswordForEmail: () =>
        Promise.resolve({
          error: { message: "Authentication service unavailable. Please try again later." },
        }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: () =>
            Promise.resolve({
              data: null,
              error: { message: "Database unavailable" },
            }),
        }),
      }),
    }),
  }
}

export { getSupabaseClient as supabase }

interface User {
  id: string
  email: string
  user_metadata: {
    full_name?: string
    name?: string
    first_name?: string
    avatar_url?: string
  }
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>
  signUpWithEmail: (email: string, password: string) => Promise<{ error: any }>
  resetPassword: (email: string) => Promise<{ error: any }>
  hasProfile: boolean
  checkProfile: () => Promise<boolean>
  isConfigured: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [hasProfile, setHasProfile] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    const client = getSupabaseClient()

    // Check if we have a real Supabase client or mock
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    setIsConfigured(!!(supabaseUrl && supabaseKey && supabaseUrl.includes(".supabase.co")))

    // Get initial session
    client.auth
      .getSession()
      .then(({ data: { session }, error }: any) => {
        if (error) {
          console.error("Session error:", error)
          if (error.message?.includes("Invalid API key")) {
            console.error("Invalid API key - check your Supabase configuration")
          }
        }
        setUser(session?.user as User | null)
        setLoading(false)
      })
      .catch((error: any) => {
        console.error("Failed to get session:", error)
        setLoading(false)
      })

    // Listen for auth changes
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (event: string, session: any) => {
      console.log("Auth state changed:", event)
      setUser(session?.user as User | null)
      setLoading(false)

      if (event === "SIGNED_IN" && session?.user) {
        console.log("User signed in:", session.user.email)
      }

      if (event === "SIGNED_OUT") {
        console.log("User signed out")
        setHasProfile(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user && isConfigured) {
      checkProfile()
    } else {
      setHasProfile(false)
    }
  }, [user, isConfigured])

  const signIn = async () => {
    if (!isConfigured) {
      throw new Error("Authentication service unavailable. Please try again later.")
    }

    try {
      const client = getSupabaseClient()
      const { error } = await client.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })
      if (error) {
        console.error("Google sign in error:", error)
        if (error.message?.includes("Invalid API key")) {
          throw new Error("Authentication service temporarily unavailable. Please try again later.")
        }
        throw error
      }
    } catch (error: any) {
      console.error("Sign in error:", error)
      throw error
    }
  }

  const signInWithEmail = async (email: string, password: string) => {
    if (!isConfigured) {
      return { error: { message: "Authentication service unavailable. Please try again later." } }
    }

    try {
      const client = getSupabaseClient()
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      })

      if (error && error.message?.includes("Invalid API key")) {
        return { error: { message: "Authentication service temporarily unavailable. Please try again later." } }
      }

      return { error }
    } catch (error: any) {
      console.error("Email sign in error:", error)
      return { error: { message: "Authentication service temporarily unavailable. Please try again later." } }
    }
  }

  const signUpWithEmail = async (email: string, password: string) => {
    if (!isConfigured) {
      return { error: { message: "Authentication service unavailable. Please try again later." } }
    }

    try {
      const client = getSupabaseClient()
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}`,
        },
      })

      if (error && error.message?.includes("Invalid API key")) {
        return { error: { message: "Authentication service temporarily unavailable. Please try again later." } }
      }

      return { error }
    } catch (error: any) {
      console.error("Email sign up error:", error)
      return { error: { message: "Authentication service temporarily unavailable. Please try again later." } }
    }
  }

  const resetPassword = async (email: string) => {
    if (!isConfigured) {
      return { error: { message: "Authentication service unavailable. Please try again later." } }
    }

    try {
      const client = getSupabaseClient()
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error && error.message?.includes("Invalid API key")) {
        return { error: { message: "Authentication service temporarily unavailable. Please try again later." } }
      }

      return { error }
    } catch (error: any) {
      console.error("Password reset error:", error)
      return { error: { message: "Authentication service temporarily unavailable. Please try again later." } }
    }
  }

  const signOut = async () => {
    try {
      const client = getSupabaseClient()
      const { error } = await client.auth.signOut()
      if (error && !error.message?.includes("Invalid API key")) {
        console.error("Error signing out:", error)
        throw error
      }
    } catch (error: any) {
      console.error("Sign out error:", error)
      // Don't throw on sign out errors - just log them
    }
  }

  const checkProfile = async (): Promise<boolean> => {
    if (!user || !isConfigured) return false

    try {
      const client = getSupabaseClient()
      const { data, error } = await client.from("user_profiles").select("id").eq("user_id", user.id).single()

      if (error && error.message?.includes("Invalid API key")) {
        console.error("Profile check failed - API key issue")
        setHasProfile(false)
        return false
      }

      const profileExists = !error && data
      setHasProfile(profileExists)
      return profileExists
    } catch (error) {
      console.error("Profile check error:", error)
      setHasProfile(false)
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        hasProfile,
        checkProfile,
        isConfigured,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

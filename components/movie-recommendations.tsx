"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Info, Play, RotateCcw, User, Eye, Bookmark, X, Check } from "lucide-react"
import type { Mood, Reason, Intention } from "@/app/page"
import { useAuth } from "./auth-provider"
import { supabase } from "@/lib/supabase"
import AuthModal from "./auth-modal"

interface StreamingProvider {
  provider_id: number
  provider_name: string
  logo_path: string
  display_priority: number
}

interface WatchProvider {
  flatrate?: StreamingProvider[]
  rent?: StreamingProvider[]
  buy?: StreamingProvider[]
  link?: string
}

interface Movie {
  id: number
  title: string
  release_date: string
  overview: string
  poster_path: string
  watch_providers?: WatchProvider
}

interface MovieRecommendationsProps {
  mood: Mood
  reason: Reason
  intention: Intention
}

// Function to get mood-based colors
const getMoodColors = (mood: Mood) => {
  if (mood.energy === "high" && mood.pleasantness === "pleasant") {
    // High Energy + Pleasant: Warm oranges/yellows (energetic, joyful)
    return {
      border: "border-orange-400/60 hover:border-orange-400/80",
      shadow: "shadow-orange-500/20",
      glow: "shadow-lg shadow-orange-500/25",
      gradient: "from-orange-500/10 to-yellow-500/10",
    }
  }

  if (mood.energy === "high" && mood.pleasantness === "unpleasant") {
    // High Energy + Unpleasant: Reds/pinks (intense, agitated)
    return {
      border: "border-red-400/60 hover:border-red-400/80",
      shadow: "shadow-red-500/20",
      glow: "shadow-lg shadow-red-500/25",
      gradient: "from-red-500/10 to-pink-500/10",
    }
  }

  if (mood.energy === "low" && mood.pleasantness === "pleasant") {
    // Low Energy + Pleasant: Cool blues/teals (calm, peaceful)
    return {
      border: "border-blue-400/60 hover:border-blue-400/80",
      shadow: "shadow-blue-500/20",
      glow: "shadow-lg shadow-blue-500/25",
      gradient: "from-blue-500/10 to-teal-500/10",
    }
  }

  if (mood.energy === "low" && mood.pleasantness === "unpleasant") {
    // Low Energy + Unpleasant: Purples/indigos (melancholic, subdued)
    return {
      border: "border-purple-400/60 hover:border-purple-400/80",
      shadow: "shadow-purple-500/20",
      glow: "shadow-lg shadow-purple-500/25",
      gradient: "from-purple-500/10 to-indigo-500/10",
    }
  }

  // Fallback
  return {
    border: "border-white/20 hover:border-white/40",
    shadow: "shadow-white/10",
    glow: "shadow-lg shadow-white/20",
    gradient: "from-white/5 to-white/5",
  }
}

export default function MovieRecommendations({ mood, reason, intention }: MovieRecommendationsProps) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState<number | null>(null)
  const [watchedMovies, setWatchedMovies] = useState<Set<number>>(new Set())
  const [savedMovies, setSavedMovies] = useState<Set<number>>(new Set())
  const [rejectedMovies, setRejectedMovies] = useState<Set<number>>(new Set())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const touchStartX = useRef<number>(0)
  const touchStartY = useRef<number>(0)

  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    // Load watched movies from localStorage on component mount
    const savedWatched = localStorage.getItem("mudi-watched-movies")
    if (savedWatched) {
      setWatchedMovies(new Set(JSON.parse(savedWatched)))
    }
  }, [])

  useEffect(() => {
    // Load saved movies from database when user is available
    if (user) {
      fetchSavedMovies()
    }
  }, [user])

  const fetchSavedMovies = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.from("saved_movies").select("movie_id").eq("user_id", user.id)

      if (error) {
        console.error("Error fetching saved movies:", error)
        return
      }

      const savedIds = new Set(data.map((item) => item.movie_id))
      setSavedMovies(savedIds)
    } catch (error) {
      console.error("Error fetching saved movies:", error)
    }
  }

  const toggleSavedMovie = async (movie: Movie, event: React.MouseEvent) => {
    event.stopPropagation()

    if (!user) {
      setShowAuthModal(true)
      return
    }

    const isSaved = savedMovies.has(movie.id)

    try {
      if (isSaved) {
        // Remove from saved movies
        const { error } = await supabase.from("saved_movies").delete().eq("user_id", user.id).eq("movie_id", movie.id)

        if (error) {
          console.error("Error removing saved movie:", error)
          return
        }

        setSavedMovies((prev) => {
          const newSet = new Set(prev)
          newSet.delete(movie.id)
          return newSet
        })
      } else {
        // Add to saved movies
        const { error } = await supabase.from("saved_movies").insert({
          user_id: user.id,
          movie_id: movie.id,
          movie_title: movie.title,
          movie_poster_path: movie.poster_path,
          movie_overview: movie.overview,
          movie_release_date: movie.release_date,
          mood_when_saved: mood.label,
          reason_when_saved: reason,
        })

        if (error) {
          console.error("Error saving movie:", error)
          return
        }

        setSavedMovies((prev) => new Set([...prev, movie.id]))
      }
    } catch (error) {
      console.error("Error toggling saved movie:", error)
    }
  }

  const fetchAdditionalMovie = async () => {
    if (isRefreshing) return null

    try {
      setIsRefreshing(true)
      console.log("=== FETCHING ADDITIONAL MOVIE ===")

      const getMoodKey = (mood: Mood): string => {
        // Use the specific mood label instead of constructing quadrant format
        return mood.label.toLowerCase();
      }

      const moodKey = getMoodKey(mood)

      // Collect movie IDs that should be excluded (only rejected and currently shown)
      const currentMovieIds = movies.map((m) => m.id)
      const rejectedMovieIds = Array.from(rejectedMovies)
      // Don't exclude watched movies - they should stay visible
      const allExcludedIds = [...new Set([...currentMovieIds, ...rejectedMovieIds])]

      console.log("Excluding movie IDs (current + rejected only):", allExcludedIds)
      console.log("Watched movies (keeping visible):", Array.from(watchedMovies))

      // Try multiple API calls with different parameters if needed
      const attempts = [
        { limit: 20, threshold: 0.3 },
        { limit: 50, threshold: 0.1 },
        { limit: 100, threshold: 0.05 },
      ]

      for (const attempt of attempts) {
        const excludeParam = allExcludedIds.length > 0 ? `&exclude=${allExcludedIds.join(",")}` : ""
        const apiUrl = `/api/movies/recommendations?mood=${moodKey}&limit=${attempt.limit}&threshold=${attempt.threshold}${excludeParam}`
        console.log("Trying API call:", apiUrl)

        const response = await fetch(apiUrl)

        if (!response.ok) {
          console.error("API call failed:", response.status, response.statusText)
          continue
        }

        const recommendations = await response.json()
        console.log(`Received ${recommendations.length} recommendations`)

        if (recommendations.length > 0) {
          const newMovie = recommendations[0]
          const transformedMovie = {
            id: newMovie.id,
            title: newMovie.title,
            release_date: newMovie.release_date,
            overview: newMovie.overview,
            poster_path: newMovie.poster_path
              ? newMovie.poster_path.startsWith("http")
                ? newMovie.poster_path
                : `https://image.tmdb.org/t/p/w500${newMovie.poster_path}`
              : "/placeholder.svg?height=300&width=200&text=No+Image",
            watch_providers: newMovie.watch_providers,
          }

          console.log("✅ Adding new movie:", transformedMovie.title)
          setMovies((prev) => {
            const updated = [...prev, transformedMovie]
            console.log("Updated movies list length:", updated.length)
            return updated
          })
          return transformedMovie
        }
      }

      console.log("❌ No new movies found after all attempts")
      return null
    } catch (err) {
      console.error("❌ Error fetching additional movie:", err)
      return null
    } finally {
      setIsRefreshing(false)
      console.log("=== FETCH COMPLETE ===")
    }
  }

  const toggleWatched = async (movieId: number, event: React.MouseEvent) => {
    event.stopPropagation()

    const newWatchedMovies = new Set(watchedMovies)
    const wasWatched = watchedMovies.has(movieId)

    if (wasWatched) {
      newWatchedMovies.delete(movieId)
    } else {
      newWatchedMovies.add(movieId)
      // Add a new movie to the bottom when marking as watched
      console.log("Movie marked as watched, fetching additional movie...")
      const newMovie = await fetchAdditionalMovie()
      if (newMovie) {
        console.log("Successfully added new movie:", newMovie.title)
      } else {
        console.log("Failed to fetch additional movie")
      }
    }

    setWatchedMovies(newWatchedMovies)
    localStorage.setItem("mudi-watched-movies", JSON.stringify(Array.from(newWatchedMovies)))
  }

  const rejectMovie = async (movieId: number, event?: React.MouseEvent) => {
    if (event) event.stopPropagation()

    console.log("=== REJECTING MOVIE ===", movieId)

    const newRejectedMovies = new Set(rejectedMovies)
    newRejectedMovies.add(movieId)
    setRejectedMovies(newRejectedMovies)

    console.log("Updated rejected movies:", Array.from(newRejectedMovies))

    // Remove from current movies list
    setMovies((prev) => {
      const filtered = prev.filter((movie) => movie.id !== movieId)
      console.log("Movies after removal:", filtered.length)
      return filtered
    })

    // Fetch a replacement movie
    console.log("Fetching replacement movie...")
    const newMovie = await fetchAdditionalMovie()
    if (newMovie) {
      console.log("✅ Successfully added replacement movie:", newMovie.title)
    } else {
      console.log("❌ Failed to fetch replacement movie")
    }
  }

  const acceptMovie = async (movieId: number, event?: React.MouseEvent) => {
    if (event) event.stopPropagation()

    const movie = movies.find((m) => m.id === movieId)
    if (!movie) return

    // Save the movie to user's collection instead of marking as watched
    await toggleSavedMovie(movie, event as any)

    // Add a new movie to the bottom
    console.log("Movie saved, fetching additional movie...")
    const newMovie = await fetchAdditionalMovie()
    if (newMovie) {
      console.log("Successfully added new movie:", newMovie.title)
    } else {
      console.log("Failed to fetch replacement movie")
    }
  }

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent, movieId: number) => {
    touchStartX.current = e.touches[0].clientX
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent, movieId: number) => {
    if (!touchStartX.current || !touchStartY.current) return

    const touchEndX = e.changedTouches[0].clientX
    const touchEndY = e.changedTouches[0].clientY

    const deltaX = touchEndX - touchStartX.current
    const deltaY = touchEndY - touchStartY.current

    // Only trigger swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100) {
      if (deltaX > 0) {
        // Swipe right - accept
        acceptMovie(movieId)
      } else {
        // Swipe left - reject
        rejectMovie(movieId)
      }
    }

    touchStartX.current = 0
    touchStartY.current = 0
  }

  const handleCardClick = (index: number) => {
    setShowDetails(showDetails === index ? null : index)
  }

  const handleStreamingClick = (provider: StreamingProvider, movie: Movie, event: React.MouseEvent) => {
    event.stopPropagation()

    // In production, this would use deep links or the TMDb link
    const searchQuery = encodeURIComponent(movie.title)
    let url = `https://www.google.com/search?q=${searchQuery}+${provider.provider_name}`

    // Add specific deep links for major providers
    switch (provider.provider_name.toLowerCase()) {
      case "netflix":
        url = `https://www.netflix.com/search?q=${searchQuery}`
        break
      case "hulu":
        url = `https://www.hulu.com/search?q=${searchQuery}`
        break
      case "amazon prime video":
        url = `https://www.amazon.com/s?k=${searchQuery}&i=prime-instant-video`
        break
      case "disney plus":
        url = `https://www.disneyplus.com/search?q=${searchQuery}`
        break
      case "hbo max":
        url = `https://www.hbomax.com/search?q=${searchQuery}`
        break
    }

    window.open(url, "_blank")
  }

  const renderStreamingOptions = (movie: Movie) => {
    const providers = movie.watch_providers
    if (!providers) return null

    const allProviders = [...(providers.flatrate || []), ...(providers.rent || []), ...(providers.buy || [])].filter(
      (provider, index, self) => index === self.findIndex((p) => p.provider_id === provider.provider_id),
    )

    if (allProviders.length === 0) return null

    return (
      <div className="mt-2 pt-2 border-t border-white/10">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Stream indicator inline with icons */}
          {providers.flatrate && providers.flatrate.length > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Play className="h-3 w-3 text-green-400" />
              <span className="text-xs text-green-400 font-light">Stream</span>
            </div>
          )}

          {/* Streaming provider icons */}
          {allProviders.slice(0, 6).map((provider) => {
            const isStreaming = providers.flatrate?.some((p) => p.provider_id === provider.provider_id)
            const isRental = providers.rent?.some((p) => p.provider_id === provider.provider_id)

            return (
              <Button
                key={provider.provider_id}
                variant="ghost"
                size="sm"
                className={`p-1 h-auto rounded-md transition-all hover:scale-105 flex-shrink-0 ${
                  isStreaming
                    ? "bg-green-500/20 hover:bg-green-500/30 border border-green-500/40"
                    : "bg-white/10 hover:bg-white/20 border border-white/20"
                }`}
                onClick={(e) => handleStreamingClick(provider, movie, e)}
                title={`${isStreaming ? "Stream" : isRental ? "Rent" : "Buy"} on ${provider.provider_name}`}
              >
                <Image
                  src={
                    provider.logo_path
                      ? `https://image.tmdb.org/t/p/w92${provider.logo_path}`
                      : "/placeholder.svg?height=28&width=28&text=Logo"
                  }
                  alt={provider.provider_name}
                  width={28}
                  height={28}
                  className="rounded"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=28&width=28&text=Logo"
                  }}
                />
              </Button>
            )
          })}
          {allProviders.length > 6 && (
            <div className="flex items-center justify-center w-7 h-7 bg-white/10 rounded-md flex-shrink-0">
              <span className="text-xs text-gray-400">+{allProviders.length - 6}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  const fetchRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)

      // Map your UI mood format to API format
      const getMoodKey = (mood: Mood): string => {
        // Use the specific mood label instead of constructing quadrant format
        return mood.label.toLowerCase();
      }

      const moodKey = getMoodKey(mood)
      const apiUrl = `/api/movies/recommendations?mood=${moodKey}&limit=5&threshold=0.6`

      console.log("🔧 FRONTEND DEBUG - Sending mood:", moodKey)

      console.log("Fetching recommendations from:", apiUrl)
      console.log("Mood details:", { mood, reason, intention, moodKey })

      const response = await fetch(apiUrl)

      console.log("API Response status:", response.status)
      console.log("API Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("API Error Response:", errorText)

        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText }
        }

        throw new Error(
          `API request failed: ${response.status} ${response.statusText}. ${errorData.error || errorData.details || ""}`,
        )
      }

      const recommendations = await response.json()
      console.log("Received recommendations:", recommendations)

      // Transform API response to match your Movie interface
      const transformedMovies: Movie[] = recommendations.map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        overview: movie.overview,
        poster_path: movie.poster_path
          ? movie.poster_path.startsWith("http")
            ? movie.poster_path
            : `https://image.tmdb.org/t/p/w500${movie.poster_path}`
          : "/placeholder.svg?height=300&width=200&text=No+Image",
        watch_providers: movie.watch_providers,
      }))

      console.log("Transformed movies:", transformedMovies)
      setMovies(transformedMovies)
    } catch (err) {
      console.error("Error fetching recommendations:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch recommendations. Please try again.")

      // Fallback to a helpful error message
      setMovies([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecommendations()
  }, [mood, reason, intention])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="h-10 w-10 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400 font-light">Finding films that match your mood...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-400 mb-4">{error}</p>
        <Button
          variant="outline"
          className="border-white/20 text-white hover:bg-white/10 bg-transparent"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full">
      {/* Auth status indicator - match header width */}
      {!authLoading && (
        <div className="flex items-center justify-between border border-white/20 p-3 rounded-lg w-full max-w-md mx-auto">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-white/70" />
            <span className="text-sm text-gray-300">
              {user ? `Signed in as ${user.email}` : "Sign in to save movies"}
            </span>
          </div>
          {!user && (
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent text-xs"
              onClick={() => setShowAuthModal(true)}
            >
              Sign In
            </Button>
          )}
        </div>
      )}

      <div className="border border-white/20 p-4 rounded-lg mb-6 w-full max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-white/70 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-gray-300">
            <p className="font-medium mb-1">Your selections:</p>
            <p className="font-light">
              Feeling: <span className="font-normal text-white">{mood.label}</span>
            </p>
            <p className="font-light">
              Reason: <span className="font-normal text-white">{reason}</span>
            </p>
            <p className="font-light">
              Intention:{" "}
              <span className="font-normal text-white">
                {intention === "sit" ? "Sit with this feeling" : "Shift to positive"}
              </span>
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-serif text-center mb-2">Recommended Films</h2>
      <div className="h-px w-16 bg-white/30 mx-auto mb-6"></div>

      {/* Wide movie cards */}
      <div className="w-full max-w-4xl mx-auto">
        <div className="space-y-4 px-6">
          {movies.map((movie, index) => {
            const moodColors = getMoodColors(mood)
            const isWatched = watchedMovies.has(movie.id)
            const isSaved = savedMovies.has(movie.id)

            return (
              <Card
                key={movie.id}
                className={`overflow-hidden bg-black border transition-all duration-300 cursor-pointer w-full ${
                  isWatched
                    ? `${moodColors.border.replace("/60", "/20").replace("/80", "/30")} opacity-60`
                    : `${moodColors.border} ${moodColors.glow}`
                }`}
                onClick={() => handleCardClick(index)}
                onTouchStart={(e) => handleTouchStart(e, movie.id)}
                onTouchEnd={(e) => handleTouchEnd(e, movie.id)}
              >
                <div className="flex flex-row h-56 lg:h-60">
                  {/* Poster section - smaller width */}
                  <div className="w-40 lg:w-44 flex-shrink-0 relative">
                    <div className="h-full relative">
                      <Image
                        src={movie.poster_path || "/placeholder.svg?height=450&width=300&text=No+Image"}
                        alt={movie.title}
                        fill
                        sizes="224px"
                        className="object-cover rounded-l-lg"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=450&width=300&text=No+Image"
                        }}
                      />
                    </div>

                    {/* Watched indicator overlay */}
                    {isWatched && (
                      <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center pointer-events-none rounded-l-lg">
                        <div className="bg-black/80 px-3 py-1 rounded-full border border-white/20">
                          <span className="text-white/80 text-sm font-light">Already Watched</span>
                        </div>
                      </div>
                    )}

                    {/* UPDATED: Bottom action buttons with subtle styling */}
                    <div className="absolute bottom-3 left-3 right-3 z-20 flex justify-between items-center">
                      {/* Reject button - more subtle */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1.5 rounded-full bg-black/40 text-white/60 hover:bg-black/60 hover:text-white/80 transition-all backdrop-blur-sm"
                        onClick={(e) => rejectMovie(movie.id, e)}
                        title="Reject this movie"
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>

                      {/* Action buttons group */}
                      <div className="flex gap-2">
                        {/* Save/Bookmark button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`p-1.5 rounded-full transition-all backdrop-blur-sm ${
                            isSaved
                              ? "bg-blue-500/30 text-blue-300 hover:bg-blue-500/40"
                              : "bg-black/40 text-white/60 hover:bg-black/60 hover:text-white/80"
                          }`}
                          onClick={(e) => toggleSavedMovie(movie, e)}
                          title={isSaved ? "Remove from saved" : "Save movie"}
                        >
                          <Bookmark className={`h-3.5 w-3.5 ${isSaved ? "fill-current" : ""}`} />
                        </Button>

                        {/* Watched toggle button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className={`p-1.5 rounded-full transition-all backdrop-blur-sm ${
                            isWatched
                              ? "bg-green-500/30 text-green-300 hover:bg-green-500/40"
                              : "bg-black/40 text-white/60 hover:bg-black/60 hover:text-white/80"
                          }`}
                          onClick={(e) => toggleWatched(movie.id, e)}
                          title={isWatched ? "Mark as unwatched" : "Mark as watched"}
                        >
                          <Eye className={`h-3.5 w-3.5 ${isWatched ? "fill-current" : ""}`} />
                        </Button>
                      </div>
                    </div>

                    {/* Keep the original accept/reject buttons for swipe functionality */}
                    <div className="absolute bottom-3 left-3 right-3 z-10 flex justify-between items-center opacity-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`p-2 rounded-full bg-red-500/90 text-white hover:bg-red-500 transition-all ${moodColors.shadow} border-2 border-red-400/40 backdrop-blur-sm`}
                        onClick={(e) => rejectMovie(movie.id, e)}
                        title="Reject this movie"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`p-2 rounded-full bg-green-500/90 text-white hover:bg-green-500 transition-all ${moodColors.shadow} border-2 border-green-400/40 backdrop-blur-sm`}
                        onClick={(e) => acceptMovie(movie.id, e)}
                        title="Save to your collection"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content section - takes remaining width */}
                  <div className="flex-1 p-3 lg:p-4 flex flex-col justify-between min-w-0">
                    {/* Title and streaming info */}
                    <div className="flex flex-row items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-lg lg:text-xl tracking-tight text-white leading-tight">
                          {movie.title}
                        </h3>
                        <p className="text-xs lg:text-sm text-gray-400 mt-1 font-light">
                          {movie.release_date?.substring(0, 4)}
                        </p>
                      </div>

                      {/* Streaming info */}
                      <div className="ml-4 flex-shrink-0">
                        {movie.watch_providers?.flatrate && movie.watch_providers.flatrate.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Play className="h-3 w-3 text-green-400" />
                            <span className="text-xs text-green-400 font-light">Available to Stream</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Overview text - much smaller */}
                    <div className="flex-1 mb-1">
                      {showDetails === index ? (
                        <>
                          <p className="text-xs lg:text-sm font-light leading-relaxed text-gray-300">
                            {movie.overview}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1 text-gray-400 hover:text-white hover:bg-transparent p-0 text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              setShowDetails(null)
                            }}
                          >
                            Show less
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="text-xs lg:text-sm line-clamp-2 font-light text-gray-300">
                            {movie.overview.length > 100 ? `${movie.overview.substring(0, 100)}...` : movie.overview}
                          </p>
                          {movie.overview.length > 100 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="mt-1 text-gray-400 hover:text-white hover:bg-transparent p-0 text-xs"
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowDetails(index)
                              }}
                            >
                              Show more
                            </Button>
                          )}
                        </>
                      )}
                    </div>

                    {/* Streaming Options */}
                    {renderStreamingOptions(movie)}
                  </div>
                </div>
              </Card>
            )
          })}

          {isRefreshing && (
            <div className="flex items-center justify-center py-4">
              <RotateCcw className="h-5 w-5 animate-spin text-white/70 mr-2" />
              <span className="text-sm text-gray-400 font-light">Finding more films...</span>
            </div>
          )}
        </div>
      </div>

      {(watchedMovies.size > 0 || (user && savedMovies.size > 0)) && (
        <div className="text-center pt-4 border-t border-white/10 space-y-1 mx-6">
          {watchedMovies.size > 0 && (
            <p className="text-sm text-gray-400 font-light">
              You've marked {watchedMovies.size} film{watchedMovies.size !== 1 ? "s" : ""} as watched
            </p>
          )}
          {user && savedMovies.size > 0 && (
            <p className="text-sm text-gray-400 font-light">
              {savedMovies.size} film{savedMovies.size !== 1 ? "s" : ""} saved to your collection
            </p>
          )}
        </div>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}

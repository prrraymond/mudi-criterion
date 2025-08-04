"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Heart, Film, ChevronDown, ChevronUp } from "lucide-react"
import { useAuth } from "./auth-provider"
import AuthModal from "./auth-modal"

// Dot visualization component for metrics
function DotVisualization({ count, color = "bg-blue-500" }: { count: number; color?: string }) {
  if (count === 0) {
    return <div className={`w-2 h-2 rounded-full ${color} opacity-30`} />
  }

  if (count <= 12) {
    return (
      <div className="flex flex-wrap gap-1 max-w-[60px]">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full ${color}`} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-1 max-w-[60px] items-center">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={`w-2 h-2 rounded-full ${color}`} />
      ))}
      <span className="text-xs text-gray-400 ml-1">+{count - 8}</span>
    </div>
  )
}

// Mock data for development
const mockMoodEntries = [
  { date: "2024-01-15", mood: "Joy", intensity: 0.8, reason: "Watched an amazing film" },
  { date: "2024-01-14", mood: "Calm", intensity: 0.6, reason: "Peaceful evening" },
  { date: "2024-01-13", mood: "Excited", intensity: 0.9, reason: "New movie release" },
  { date: "2024-01-12", mood: "Melancholy", intensity: 0.5, reason: "Nostalgic film" },
  { date: "2024-01-11", mood: "Inspired", intensity: 0.7, reason: "Great documentary" },
]

const mockMovieActions = [
  {
    id: 1,
    movie: { title: "Fight Club", year: 1999, poster: "/placeholder.svg?height=160&width=107" },
    action: "saved",
    date: "2024-01-15",
    mood: "Joy",
  },
  {
    id: 2,
    movie: { title: "Forrest Gump", year: 1994, poster: "/placeholder.svg?height=160&width=107" },
    action: "watched",
    date: "2024-01-14",
    mood: "Calm",
  },
  {
    id: 3,
    movie: { title: "The Shawshank Redemption", year: 1994, poster: "/placeholder.svg?height=160&width=107" },
    action: "saved",
    date: "2024-01-13",
    mood: "Inspired",
  },
  {
    id: 4,
    movie: { title: "The Godfather", year: 1972, poster: "/placeholder.svg?height=160&width=107" },
    action: "watched",
    date: "2024-01-12",
    mood: "Melancholy",
  },
  {
    id: 5,
    movie: { title: "Pulp Fiction", year: 1994, poster: "/placeholder.svg?height=160&width=107" },
    action: "saved",
    date: "2024-01-11",
    mood: "Excited",
  },
  {
    id: 6,
    movie: { title: "Schindler's List", year: 1993, poster: "/placeholder.svg?height=160&width=107" },
    action: "watched",
    date: "2024-01-10",
    mood: "Contemplative",
  },
  {
    id: 7,
    movie: { title: "Goodfellas", year: 1990, poster: "/placeholder.svg?height=160&width=107" },
    action: "saved",
    date: "2024-01-09",
    mood: "Thrilled",
  },
  {
    id: 8,
    movie: { title: "The Dark Knight", year: 2008, poster: "/placeholder.svg?height=160&width=107" },
    action: "watched",
    date: "2024-01-08",
    mood: "Intense",
  },
]

function getMoodColor(mood: string): string {
  const moodColors: { [key: string]: string } = {
    Joy: "bg-orange-500",
    Excited: "bg-red-500",
    Calm: "bg-blue-500",
    Melancholy: "bg-purple-500",
    Inspired: "bg-blue-400",
    Contemplative: "bg-indigo-500",
    Thrilled: "bg-pink-500",
    Intense: "bg-gray-500",
  }
  return moodColors[mood] || "bg-gray-400"
}

function generateTimelineData() {
  const timeline = []
  const today = new Date()

  for (let i = 89; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split("T")[0]

    const moodEntry = mockMoodEntries.find((entry) => entry.date === dateStr)
    const movieActions = mockMovieActions.filter((action) => action.date === dateStr)

    timeline.push({
      date: dateStr,
      mood: moodEntry?.mood,
      intensity: moodEntry?.intensity || 0,
      movieCount: movieActions.length,
      activities: movieActions,
    })
  }

  return timeline
}

export default function EntriesLog() {
  const { user, loading } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState<any>(null)
  const [moodFilter, setMoodFilter] = useState<string>("all")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [showAllMovies, setShowAllMovies] = useState(false)

  const timelineData = generateTimelineData()

  const filteredMovies = useMemo(() => {
    return mockMovieActions.filter((movie) => {
      const moodMatch = moodFilter === "all" || movie.mood === moodFilter
      const actionMatch = actionFilter === "all" || movie.action === actionFilter
      return moodMatch && actionMatch
    })
  }, [moodFilter, actionFilter])

  const displayedMovies = showAllMovies ? filteredMovies : filteredMovies.slice(0, 6)

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // Show auth modal if user is not signed in
  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Criterion Style Header */}
        <div className="text-center py-12 border-b border-white/20">
          <h1 className="text-2xl md:text-3xl font-serif tracking-wider text-white mb-2">YOUR ENTRIES</h1>
          <p className="text-sm text-gray-400 font-light">A personal journal of your emotional cinema journey</p>
        </div>

        {/* Authentication Required Message */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="bg-black border border-white/20 max-w-md mx-4">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8 text-blue-500" />
                </div>
                <h2 className="text-xl font-serif text-white mb-2">Sign In Required</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  Your personal entries are private. Sign in to view your mood timeline and movie activity.
                </p>
              </div>

              <Button
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium"
              >
                Sign In
              </Button>
            </CardContent>
          </Card>
        </div>

        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Criterion Style Header */}
      <div className="text-center py-12 border-b border-white/20">
        <h1 className="text-2xl md:text-3xl font-serif tracking-wider text-white mb-2">YOUR ENTRIES</h1>
        <p className="text-sm text-gray-400 font-light">A personal journal of your emotional cinema journey</p>
      </div>

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Mubi Style Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-black border border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-light">MOOD ENTRIES</p>
                  <p className="text-2xl font-light text-white">{mockMoodEntries.length}</p>
                </div>
                <DotVisualization count={mockMoodEntries.length} color="bg-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-light">SAVED MOVIES</p>
                  <p className="text-2xl font-light text-white">
                    {mockMovieActions.filter((m) => m.action === "saved").length}
                  </p>
                </div>
                <DotVisualization
                  count={mockMovieActions.filter((m) => m.action === "saved").length}
                  color="bg-green-500"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-black border border-gray-800">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-light">WATCHED MOVIES</p>
                  <p className="text-2xl font-light text-white">
                    {mockMovieActions.filter((m) => m.action === "watched").length}
                  </p>
                </div>
                <DotVisualization
                  count={mockMovieActions.filter((m) => m.action === "watched").length}
                  color="bg-purple-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Emotion Timeline */}
        <Card className="bg-black border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <h2 className="text-lg font-light uppercase tracking-wider text-white">EMOTION TIMELINE</h2>
            </div>

            <div className="grid grid-cols-13 gap-1 mb-4">
              {timelineData.map((day, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedDay(day)}
                  className={`
                    w-2.5 h-2.5 rounded-full transition-all duration-200 hover:scale-125
                    ${
                      day.mood
                        ? `${getMoodColor(day.mood)} opacity-${Math.max(30, Math.floor(day.intensity * 100))}`
                        : "bg-gray-800 opacity-30"
                    }
                    ${selectedDay?.date === day.date ? "ring-2 ring-blue-500 ring-offset-1 ring-offset-black" : ""}
                  `}
                  title={`${day.date}${day.mood ? ` - ${day.mood}` : " - No entry"}`}
                />
              ))}
            </div>

            {selectedDay && (
              <div className="mt-4 p-4 bg-gray-900/50 border border-gray-700">
                <h3 className="font-light text-white mb-2">{selectedDay.date}</h3>
                {selectedDay.mood ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs ${getMoodColor(selectedDay.mood)} text-white rounded-full`}>
                        {selectedDay.mood}
                      </span>
                      <span className="text-gray-400 text-sm">
                        Intensity: {Math.floor(selectedDay.intensity * 100)}%
                      </span>
                    </div>
                    {selectedDay.activities.length > 0 && (
                      <div className="text-sm text-gray-300">
                        Movie activity:{" "}
                        {selectedDay.activities.map((a: any) => `${a.action} ${a.movie.title}`).join(", ")}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">No mood entry for this day</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Movie Activity */}
        <Card className="bg-black border border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 bg-white rounded-full"></div>
                <h2 className="text-lg font-light uppercase tracking-wider text-white">MOVIE ACTIVITY</h2>
              </div>

              <div className="flex items-center gap-3">
                <Select value={moodFilter} onValueChange={setMoodFilter}>
                  <SelectTrigger className="w-32 bg-black border-gray-700 text-white text-xs">
                    <SelectValue placeholder="Mood" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gray-700">
                    <SelectItem value="all" className="text-white">
                      All Moods
                    </SelectItem>
                    {Array.from(new Set(mockMovieActions.map((m) => m.mood))).map((mood) => (
                      <SelectItem key={mood} value={mood} className="text-white">
                        {mood}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger className="w-32 bg-black border-gray-700 text-white text-xs">
                    <SelectValue placeholder="Action" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gray-700">
                    <SelectItem value="all" className="text-white">
                      All Actions
                    </SelectItem>
                    <SelectItem value="saved" className="text-white">
                      Saved
                    </SelectItem>
                    <SelectItem value="watched" className="text-white">
                      Watched
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {displayedMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="bg-gray-900/30 border border-gray-800 p-4 hover:bg-gray-800/30 transition-colors"
                >
                  <div className="flex gap-3">
                    <img
                      src={movie.movie.poster || "/placeholder.svg"}
                      alt={movie.movie.title}
                      className="w-12 h-18 object-cover bg-gray-800"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-light text-white text-sm truncate">{movie.movie.title}</h3>
                      <p className="text-xs text-gray-400 mb-2">{movie.movie.year}</p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-1 text-xs text-white ${
                            movie.action === "saved" ? "bg-blue-600" : "bg-green-600"
                          }`}
                        >
                          {movie.action}
                        </span>
                        <span className="text-xs text-gray-500">{movie.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredMovies.length > 6 && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setShowAllMovies(!showAllMovies)}
                  className="text-gray-400 hover:text-white text-xs uppercase tracking-wider font-light"
                >
                  {showAllMovies ? (
                    <>
                      SHOW LESS <ChevronUp className="ml-1 h-3 w-3" />
                    </>
                  ) : (
                    <>
                      SEE ALL ({filteredMovies.length}) <ChevronDown className="ml-1 h-3 w-3" />
                    </>
                  )}
                </Button>
              </div>
            )}

            {filteredMovies.length === 0 && (
              <div className="text-center py-8">
                <Film className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                <p className="text-gray-400 text-sm">No movies match your current filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

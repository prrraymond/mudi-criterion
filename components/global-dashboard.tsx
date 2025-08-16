"use client"

import { useState, useEffect, useRef } from "react"
import { Clock, Play, Pause, MapPin } from "lucide-react"
import Image from "next/image"

interface MovieFeel {
  id: string
  location: string
  timeAgo: string
  emotion: string
  movie: {
    title: string
    year: string
    poster: string
    rating: number
  }
  reason: string
  color: string
}

const movieFeels: MovieFeel[] = [
  {
    id: "1",
    location: "New York",
    timeAgo: "2m ago",
    emotion: "Mesmerized",
    movie: {
      title: "Blade Runner 2049",
      year: "2017",
      poster: "/placeholder.svg?height=90&width=60&text=BR2049",
      rating: 8.0,
    },
    reason: "The visuals are poetry in motion, making me question what it means to be human.",
    color: "from-cyan-400 to-blue-500",
  },
  {
    id: "2",
    location: "London",
    timeAgo: "5m ago",
    emotion: "Euphoric",
    movie: {
      title: "La La Land",
      year: "2016",
      poster: "/placeholder.svg?height=90&width=60&text=LaLaLand",
      rating: 8.0,
    },
    reason: "Every frame is a love letter to dreams and the magic of cinema.",
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: "3",
    location: "Tokyo",
    timeAgo: "8m ago",
    emotion: "Contemplative",
    movie: {
      title: "Lost in Translation",
      year: "2003",
      poster: "/lost-in-translation.png",
      rating: 7.7,
    },
    reason: "Loneliness has never felt so beautiful. Sofia Coppola understands the heart.",
    color: "from-purple-400 to-pink-500",
  },
  {
    id: "4",
    location: "Paris",
    timeAgo: "12m ago",
    emotion: "Exhilarated",
    movie: {
      title: "Mad Max: Fury Road",
      year: "2015",
      poster: "/placeholder.svg?height=90&width=60&text=MadMax",
      rating: 8.1,
    },
    reason: "Pure adrenaline. This is how you make action cinema that matters.",
    color: "from-red-500 to-orange-600",
  },
  {
    id: "5",
    location: "Mumbai",
    timeAgo: "15m ago",
    emotion: "Moved",
    movie: {
      title: "Moonlight",
      year: "2016",
      poster: "/placeholder.svg?height=90&width=60&text=Moonlight",
      rating: 7.4,
    },
    reason: "A masterpiece of vulnerability. Every moment feels like a gentle revelation.",
    color: "from-indigo-400 to-purple-500",
  },
  {
    id: "6",
    location: "Sydney",
    timeAgo: "18m ago",
    emotion: "Enchanted",
    movie: {
      title: "Spirited Away",
      year: "2001",
      poster: "/placeholder.svg?height=90&width=60&text=Spirited",
      rating: 9.3,
    },
    reason: "Miyazaki creates worlds that feel more real than reality itself.",
    color: "from-green-400 to-teal-500",
  },
  {
    id: "7",
    location: "Rome",
    timeAgo: "22m ago",
    emotion: "Heartbroken",
    movie: {
      title: "Her",
      year: "2013",
      poster: "/placeholder.svg?height=90&width=60&text=Her",
      rating: 8.0,
    },
    reason: "Love in the digital age. Joaquin Phoenix breaks my heart in the best way.",
    color: "from-rose-400 to-red-500",
  },
  {
    id: "8",
    location: "Berlin",
    timeAgo: "25m ago",
    emotion: "Inspired",
    movie: {
      title: "Whiplash",
      year: "2014",
      poster: "/placeholder.svg?height=90&width=60&text=Whiplash",
      rating: 8.5,
    },
    reason: "The pursuit of perfection has never been more terrifying or beautiful.",
    color: "from-amber-400 to-yellow-500",
  },
  {
    id: "9",
    location: "Toronto",
    timeAgo: "28m ago",
    emotion: "Peaceful",
    movie: {
      title: "My Neighbor Totoro",
      year: "1988",
      poster: "/placeholder.svg?height=90&width=60&text=Totoro",
      rating: 8.2,
    },
    reason: "Pure childhood wonder. This film is a warm hug for the soul.",
    color: "from-emerald-400 to-green-500",
  },
  {
    id: "10",
    location: "Vancouver",
    timeAgo: "32m ago",
    emotion: "Thrilled",
    movie: {
      title: "Parasite",
      year: "2019",
      poster: "/placeholder.svg?height=90&width=60&text=Parasite",
      rating: 8.5,
    },
    reason: "Bong Joon-ho crafted a masterpiece that will haunt me for days.",
    color: "from-gray-400 to-slate-500",
  },
  {
    id: "11",
    location: "São Paulo",
    timeAgo: "35m ago",
    emotion: "Nostalgic",
    movie: {
      title: "Cinema Paradiso",
      year: "1988",
      poster: "/placeholder.svg?height=90&width=60&text=Cinema",
      rating: 8.5,
    },
    reason: "A love letter to cinema itself. Tornatore captures the magic of movies perfectly.",
    color: "from-amber-300 to-orange-400",
  },
  {
    id: "12",
    location: "Seoul",
    timeAgo: "38m ago",
    emotion: "Anxious",
    movie: {
      title: "Burning",
      year: "2018",
      poster: "/placeholder.svg?height=90&width=60&text=Burning",
      rating: 7.5,
    },
    reason: "Lee Chang-dong builds tension like no other. The ambiguity is haunting.",
    color: "from-red-400 to-pink-400",
  },
]

export default function GlobalDashboard() {
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(new Date())
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll like movie credits
  useEffect(() => {
    if (!isPlaying) return

    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    const scroll = () => {
      scrollContainer.scrollTop += 0.5 // Smooth, slow scroll like credits

      // Reset to top when reaching bottom for continuous loop
      if (scrollContainer.scrollTop >= scrollContainer.scrollHeight - scrollContainer.clientHeight) {
        scrollContainer.scrollTop = 0
      }
    }

    const interval = setInterval(scroll, 50) // 20fps for smooth motion
    return () => clearInterval(interval)
  }, [isPlaying])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  // Duplicate the array for seamless looping
  const duplicatedFeels = [...movieFeels, ...movieFeels]

  return (
    <div className="w-full max-w-2xl mx-auto h-screen flex flex-col bg-black">
      {/* Mubi-style Header */}
      <div className="text-center py-6 border-b border-white/10">
        <h1 className="text-2xl font-light tracking-[0.2em] text-white mb-3 uppercase">MOVIE FEELS</h1>
        <div className="flex justify-center items-center gap-6 text-white/60 text-sm font-light">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span>Live from around the world</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      </div>

      {/* Minimal Play/Pause Control */}
      <div className="flex justify-center py-3">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-2 px-3 py-1 text-white/60 hover:text-white/80 text-xs font-light transition-colors uppercase tracking-wider"
        >
          {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
          {isPlaying ? "Pause" : "Play"}
        </button>
      </div>

      {/* Mubi-style Auto-scrolling Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-hidden relative"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 8%, black 92%, transparent 100%)",
        }}
      >
        <div className="space-y-0 px-4 py-6">
          {duplicatedFeels.map((feel, index) => (
            <div
              key={`${feel.id}-${index}`}
              className="group border-b border-white/5 py-6 hover:bg-white/[0.02] transition-all duration-500 cursor-pointer"
            >
              <div className="flex gap-4 items-start">
                {/* Left: Compact Movie Poster */}
                <div className="flex-shrink-0">
                  <div className="relative overflow-hidden rounded-sm bg-gray-800/50">
                    <Image
                      src={feel.movie.poster || "/placeholder.svg"}
                      alt={feel.movie.title}
                      width={60}
                      height={90}
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.style.display = "none"
                        const parent = target.parentElement
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-[60px] h-[90px] bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center rounded-sm">
                              <div class="text-white/40 text-xs font-light text-center px-2 leading-tight">
                                ${feel.movie.title}
                              </div>
                            </div>
                          `
                        }
                      }}
                      unoptimized
                    />
                  </div>
                </div>

                {/* Center: Movie Info and Quote */}
                <div className="flex-1 min-w-0 space-y-2">
                  {/* Movie Title and Year */}
                  <div>
                    <h3 className="font-light text-white text-lg leading-tight tracking-wide">{feel.movie.title}</h3>
                    <p className="text-white/40 text-sm font-light">{feel.movie.year}</p>
                  </div>

                  {/* Elegant Quote */}
                  <blockquote className="text-white/70 text-sm font-light leading-relaxed italic border-l-2 border-white/10 pl-3">
                    "{feel.reason}"
                  </blockquote>
                </div>

                {/* Right: Location, Time & Emotion */}
                <div className="flex flex-col items-end text-right space-y-2 min-w-0">
                  {/* Location and Time */}
                  <div className="text-xs text-white/40 font-light space-y-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span>{feel.location}</span>
                    </div>
                    <div className="text-white/30">{feel.timeAgo}</div>
                  </div>

                  {/* Emotion Badge - Mubi Style */}
                  <div className="mt-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-light bg-gradient-to-r ${feel.color} text-white/90 shadow-sm`}
                    >
                      {feel.emotion}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Minimal Footer */}
      <div className="text-center py-3 border-t border-white/5">
        <p className="text-white/30 text-xs font-light tracking-wide">
          Anonymous feelings • Real cinema • Authentic moments
        </p>
      </div>
    </div>
  )
}

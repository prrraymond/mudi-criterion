"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, Clock, Play, Pause } from "lucide-react"
import Image from "next/image"

interface MovieFeel {
  id: string
  user: string
  location: string
  timeAgo: string
  emotion: string
  movie: {
    title: string
    year: string
    poster: string
    rating: number
  }
  feeling: string
  color: string
}

const movieFeels: MovieFeel[] = [
  {
    id: "1",
    user: "Sarah M.",
    location: "New York",
    timeAgo: "2m ago",
    emotion: "Mesmerized",
    movie: {
      title: "Blade Runner 2049",
      year: "2017",
      poster: "/placeholder.svg?height=120&width=80&text=BR2049",
      rating: 8.0,
    },
    feeling: "This film made me question what it means to be human. The visuals are poetry in motion.",
    color: "from-cyan-400 to-blue-500",
  },
  {
    id: "2",
    user: "Marcus K.",
    location: "London",
    timeAgo: "5m ago",
    emotion: "Euphoric",
    movie: {
      title: "La La Land",
      year: "2016",
      poster: "/placeholder.svg?height=120&width=80&text=LaLaLand",
      rating: 8.0,
    },
    feeling: "Every frame is a love letter to dreams and the magic of cinema.",
    color: "from-yellow-400 to-orange-500",
  },
  {
    id: "3",
    user: "Elena R.",
    location: "Tokyo",
    timeAgo: "8m ago",
    emotion: "Contemplative",
    movie: {
      title: "Lost in Translation",
      year: "2003",
      poster: "/lost-in-translation.png",
      rating: 7.7,
    },
    feeling: "Loneliness has never felt so beautiful. Sofia Coppola understands the heart.",
    color: "from-purple-400 to-pink-500",
  },
  {
    id: "4",
    user: "David L.",
    location: "Paris",
    timeAgo: "12m ago",
    emotion: "Exhilarated",
    movie: {
      title: "Mad Max: Fury Road",
      year: "2015",
      poster: "/placeholder.svg?height=120&width=80&text=MadMax",
      rating: 8.1,
    },
    feeling: "Pure adrenaline. This is how you make action cinema that matters.",
    color: "from-red-500 to-orange-600",
  },
  {
    id: "5",
    user: "Amara S.",
    location: "Mumbai",
    timeAgo: "15m ago",
    emotion: "Moved",
    movie: {
      title: "Moonlight",
      year: "2016",
      poster: "/placeholder.svg?height=120&width=80&text=Moonlight",
      rating: 7.4,
    },
    feeling: "A masterpiece of vulnerability. Every moment feels like a gentle revelation.",
    color: "from-indigo-400 to-purple-500",
  },
  {
    id: "6",
    user: "James W.",
    location: "Sydney",
    timeAgo: "18m ago",
    emotion: "Enchanted",
    movie: {
      title: "Spirited Away",
      year: "2001",
      poster: "/placeholder.svg?height=120&width=80&text=Spirited",
      rating: 9.3,
    },
    feeling: "Miyazaki creates worlds that feel more real than reality itself.",
    color: "from-green-400 to-teal-500",
  },
  {
    id: "7",
    user: "Isabella C.",
    location: "Rome",
    timeAgo: "22m ago",
    emotion: "Heartbroken",
    movie: {
      title: "Her",
      year: "2013",
      poster: "/placeholder.svg?height=120&width=80&text=Her",
      rating: 8.0,
    },
    feeling: "Love in the digital age. Joaquin Phoenix breaks my heart in the best way.",
    color: "from-rose-400 to-red-500",
  },
  {
    id: "8",
    user: "Oliver T.",
    location: "Berlin",
    timeAgo: "25m ago",
    emotion: "Inspired",
    movie: {
      title: "Whiplash",
      year: "2014",
      poster: "/placeholder.svg?height=120&width=80&text=Whiplash",
      rating: 8.5,
    },
    feeling: "The pursuit of perfection has never been more terrifying or beautiful.",
    color: "from-amber-400 to-yellow-500",
  },
  {
    id: "9",
    user: "Zoe M.",
    location: "Toronto",
    timeAgo: "28m ago",
    emotion: "Peaceful",
    movie: {
      title: "My Neighbor Totoro",
      year: "1988",
      poster: "/placeholder.svg?height=120&width=80&text=Totoro",
      rating: 8.2,
    },
    feeling: "Pure childhood wonder. This film is a warm hug for the soul.",
    color: "from-emerald-400 to-green-500",
  },
  {
    id: "10",
    user: "Alex P.",
    location: "Vancouver",
    timeAgo: "32m ago",
    emotion: "Thrilled",
    movie: {
      title: "Parasite",
      year: "2019",
      poster: "/placeholder.svg?height=120&width=80&text=Parasite",
      rating: 8.5,
    },
    feeling: "Bong Joon-ho crafted a masterpiece that will haunt me for days.",
    color: "from-gray-400 to-slate-500",
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
    <div className="w-full max-w-2xl mx-auto h-screen flex flex-col">
      {/* Compact Header */}
      <div className="text-center py-8 border-b border-amber-900/20">
        <h1 className="text-3xl font-serif tracking-wider text-white mb-2">MOVIE FEELS</h1>
        <div className="flex justify-center items-center gap-4 text-amber-200/80 text-sm">
          <div className="flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-400" />
            <span>Live from around the world</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3" />
            <span>{currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>
      </div>

      {/* Play/Pause Control */}
      <div className="flex justify-center py-4">
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-600/20 hover:bg-amber-600/30 rounded-full text-amber-200 text-sm transition-colors"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isPlaying ? "Pause Feed" : "Play Feed"}
        </button>
      </div>

      {/* Auto-scrolling Feed */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-hidden relative"
        style={{
          maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
        }}
      >
        <div className="space-y-6 px-6 py-8">
          {duplicatedFeels.map((feel, index) => (
            <Card
              key={`${feel.id}-${index}`}
              className="bg-gradient-to-br from-gray-900/80 via-black/90 to-gray-900/80 border border-amber-900/20 backdrop-blur-sm hover:border-amber-600/40 transition-all duration-300"
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Movie Poster */}
                  <div className="flex-shrink-0 relative">
                    <Image
                      src={feel.movie.poster || "/placeholder.svg"}
                      alt={feel.movie.title}
                      width={60}
                      height={90}
                      className="rounded-md object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=90&width=60&text=Movie"
                      }}
                    />
                    <Badge className="absolute -top-2 -right-2 bg-amber-600 text-black text-xs px-1.5 py-0.5">
                      <Star className="h-2.5 w-2.5 mr-0.5 fill-current" />
                      {feel.movie.rating}
                    </Badge>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* User Info */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-white">{feel.user}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-400">{feel.location}</span>
                      </div>
                      <span className="text-xs text-gray-500">{feel.timeAgo}</span>
                    </div>

                    {/* Movie Title */}
                    <div className="mb-2">
                      <h3 className="font-bold text-white text-sm">{feel.movie.title}</h3>
                      <p className="text-xs text-gray-400">{feel.movie.year}</p>
                    </div>

                    {/* Emotion */}
                    <div className="mb-3">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${feel.color} text-white`}
                      >
                        {feel.emotion}
                      </span>
                    </div>

                    {/* Feeling */}
                    <p className="text-sm text-gray-300 font-light leading-relaxed italic">"{feel.feeling}"</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 border-t border-amber-900/20">
        <p className="text-gray-500 text-xs font-light">Real feelings • Real movies • Real moments</p>
      </div>
    </div>
  )
}

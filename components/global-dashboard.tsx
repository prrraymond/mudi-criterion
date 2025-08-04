"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Clock, Play, Pause, MapPin } from "lucide-react"
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
      poster: "/placeholder.svg?height=160&width=107&text=BR2049",
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
      poster: "/placeholder.svg?height=160&width=107&text=LaLaLand",
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
      poster: "/placeholder.svg?height=160&width=107&text=MadMax",
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
      poster: "/placeholder.svg?height=160&width=107&text=Moonlight",
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
      poster: "/placeholder.svg?height=160&width=107&text=Spirited",
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
      poster: "/placeholder.svg?height=160&width=107&text=Her",
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
      poster: "/placeholder.svg?height=160&width=107&text=Whiplash",
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
      poster: "/placeholder.svg?height=160&width=107&text=Totoro",
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
      poster: "/placeholder.svg?height=160&width=107&text=Parasite",
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
      poster: "/placeholder.svg?height=160&width=107&text=Cinema",
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
      poster: "/placeholder.svg?height=160&width=107&text=Burning",
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
        <div className="space-y-4 px-6 py-8">
          {duplicatedFeels.map((feel, index) => (
            <Card
              key={`${feel.id}-${index}`}
              className="bg-gradient-to-br from-gray-900/80 via-black/90 to-gray-900/80 border border-amber-900/20 backdrop-blur-sm hover:border-amber-600/40 transition-all duration-300"
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Left: Movie Thumbnail */}
                  <div className="flex-shrink-0">
                    <Image
                      src={feel.movie.poster || "/placeholder.svg"}
                      alt={feel.movie.title}
                      width={107}
                      height={160}
                      className="rounded-md object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg?height=160&width=107&text=Movie"
                      }}
                    />
                  </div>

                  {/* Middle: Movie Details */}
                  <div className="flex-1 min-w-0">
                    {/* Movie Title and Year */}
                    <div className="mb-3">
                      <h3 className="font-bold text-white text-xl leading-tight mb-1">{feel.movie.title}</h3>
                      <p className="text-base text-gray-400">{feel.movie.year}</p>
                    </div>

                    {/* Movie Description/Reason */}
                    <p className="text-sm text-gray-300 font-light leading-relaxed italic">"{feel.reason}"</p>
                  </div>

                  {/* Right: User Emotion Section */}
                  <div className="flex-shrink-0 flex flex-col items-end min-w-0 w-64">
                    {/* Location and Timestamp */}
                    <div className="flex items-center gap-2 text-sm mb-4">
                      <MapPin className="h-4 w-4 text-amber-400" />
                      <span className="text-amber-200 font-medium">{feel.location}</span>
                      <span className="text-gray-500">•</span>
                      <span className="text-gray-500">{feel.timeAgo}</span>
                    </div>

                    {/* Emotion Badge */}
                    <div>
                      <span
                        className={`inline-block px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r ${feel.color} text-white shadow-lg`}
                      >
                        {feel.emotion}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center py-4 border-t border-amber-900/20">
        <p className="text-gray-500 text-xs font-light">Anonymous feelings • Real movies • Authentic moments</p>
      </div>
    </div>
  )
}

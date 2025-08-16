"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { X, Share, Download } from "lucide-react"
import Image from "next/image"
import type { Mood, Reason, Intention } from "@/app/page"

interface Movie {
  id: number
  title: string
  release_date: string
  overview: string
  poster_path: string
  watch_providers?: any
}

interface SocialShareProps {
  movie: Movie
  mood: Mood
  reason: Reason
  intention: Intention
  isOpen: boolean
  onClose: () => void
}

export default function SocialShare({ movie, mood, reason, intention, isOpen, onClose }: SocialShareProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  if (!isOpen) return null

  // ✨ IMPROVEMENT: This function is now more flexible to handle different text lengths and platforms.
  const generateShareText = (overviewLength: number, addMovieUrl: boolean = false) => {
    const year = movie.release_date?.substring(0, 4) || ""
    const streamingText = movie.watch_providers?.flatrate?.length > 0 ? " (Available to Stream)" : ""
    const overview = movie.overview.length > overviewLength ? movie.overview.substring(0, overviewLength).trim() + "..." : movie.overview
    const movieUrlText = addMovieUrl ? `\n\nhttps://www.themoviedb.org/movie/${movie.id}` : ""

    return `My mudi movie recommendation is: ${movie.title}${year ? ` (${year})` : ""}${streamingText}

${overview}

Feeling: ${mood.label}
Reason: ${reason}
Intention: ${intention === "sit" ? "Sit with this feeling" : "Shift to positive"}

Find your perfect film match at mudicriterions.watch${movieUrlText}`
  }

  // ✨ IMPROVEMENT: Now calculates remaining space to avoid exceeding Twitter's character limit.
  const shareToX = () => {
    const templateText = generateShareText(0, false)
    const baseLength = templateText.length - movie.overview.length // Length of text without the overview
    const availableLength = 280 - baseLength - 5 // 280 limit, -5 for safety
    const finalShareText = generateShareText(availableLength, false)
    
    const text = encodeURIComponent(finalShareText)
    const url = `https://twitter.com/intent/tweet?text=${text}`
    window.open(url, "_blank", "width=550,height=420")
  }

  // ✨ IMPROVEMENT: Now calculates remaining space for Bluesky and adds a movie URL for a rich link card.
  const shareToBluesky = () => {
    const templateText = generateShareText(0, true)
    const baseLength = templateText.length - movie.overview.length
    const availableLength = 300 - baseLength - 5 // 300 limit, -5 for safety
    const finalShareText = generateShareText(availableLength, true)

    const text = encodeURIComponent(finalShareText)
    const url = `https://bsky.app/intent/compose?text=${text}`
    window.open(url, "_blank", "width=550,height=600")
  }

  const downloadCard = async () => {
    setIsGenerating(true)
    try {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = 400
      canvas.height = 240

      ctx.fillStyle = "#1f2937" // gray-800
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.strokeStyle = "#374151" // gray-700
      ctx.lineWidth = 1
      ctx.strokeRect(0, 0, canvas.width, canvas.height)

      // Nested function to draw text, callable from both image load success and failure
      const drawText = () => {
        // Title
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 18px system-ui"
        ctx.fillText(movie.title, 140, 30)

        // Year
        ctx.fillStyle = "#9ca3af" // gray-400
        ctx.font = "14px system-ui"
        const year = movie.release_date?.substring(0, 4) || ""
        if (year) {
          ctx.fillText(year, 140, 50)
        }

        // Streaming indicator
        if (movie.watch_providers?.flatrate?.length > 0) {
          ctx.fillStyle = "#10b981" // green-500
          ctx.font = "12px system-ui"
          ctx.fillText("▶ Available to Stream", 140, 70)
        }

        // Overview (truncated with wrapping)
        ctx.fillStyle = "#d1d5db" // gray-300
        ctx.font = "12px system-ui"
        const overview = movie.overview.length > 120 ? movie.overview.substring(0, 120) + "..." : movie.overview
        const words = overview.split(" ")
        let line = ""
        let y = 95
        
        for (let n = 0; n < words.length; n++) {
          const testLine = line + words[n] + " "
          const metrics = ctx.measureText(testLine)
          if (metrics.width > 240 && n > 0) {
            ctx.fillText(line, 140, y)
            line = words[n] + " "
            y += 16
            if (y > 180) break
          } else {
            line = testLine
          }
        }
        ctx.fillText(line, 140, y)

        // Mood info at bottom
        ctx.fillStyle = "#6b7280" // gray-500
        ctx.font = "11px system-ui"
        ctx.fillText(`Feeling: ${mood.label} • ${intention === "sit" ? "Sit with feeling" : "Shift positive"}`, 10, 220)

        // Trigger download
        const link = document.createElement("a")
        link.download = `mudi-recommendation-${movie.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.png`
        link.href = canvas.toDataURL("image/png")
        link.click()
      }

      if (movie.poster_path && !movie.poster_path.includes("placeholder")) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          ctx.drawImage(img, 10, 10, 120, 180)
          drawText() // Draw text after image has loaded
        }
        // ✨ IMPROVEMENT: Added error handler for failed image loads.
        img.onerror = () => {
          console.error("Poster image failed to load, drawing text only.")
          drawText() // Fallback to drawing text if image fails
        }
        img.src = movie.poster_path
      } else {
        drawText() // Draw text immediately if there's no poster
      }
    } catch (error) {
      console.error("Error generating card:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-900 border-white/20 text-white">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Share Your Recommendation</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white/60 hover:text-white hover:bg-white/10 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Preview Card */}
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-white/10">
            <div className="flex gap-3">
              <div className="w-16 h-24 flex-shrink-0 relative rounded overflow-hidden">
                <Image
                  src={movie.poster_path || "/placeholder.svg?height=96&width=64&text=No+Image"}
                  alt={movie.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=96&width=64&text=No+Image"
                  }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm">{movie.title}</h4>
                <p className="text-xs text-gray-400 mb-1">{movie.release_date?.substring(0, 4)}</p>
                {movie.watch_providers?.flatrate?.length > 0 && (
                  <p className="text-xs text-green-400 mb-2">▶ Available to Stream</p>
                )}
                <p className="text-xs text-gray-300 line-clamp-3">
                  {movie.overview.length > 80 ? movie.overview.substring(0, 80) + "..." : movie.overview}
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-gray-400">
                Feeling: <span className="text-white">{mood.label}</span> •
                {intention === "sit" ? " Sit with feeling" : " Shift positive"}
              </p>
            </div>
          </div>

          {/* Share Buttons */}
          <div className="space-y-3">
            <Button onClick={shareToX} className="w-full bg-black hover:bg-gray-800 text-white border border-white/20">
              <X className="h-4 w-4 mr-2" />
              Share on X (Twitter)
            </Button>

            <Button onClick={shareToBluesky} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Share className="h-4 w-4 mr-2" />
              Share on Bluesky
            </Button>

            <Button
              onClick={downloadCard}
              disabled={isGenerating}
              variant="outline"
              className="w-full border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              <Download className="h-4 w-4 mr-2" />
              {isGenerating ? "Generating..." : "Download Card"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import SocialShare from "./social-share"
import type { Mood, Reason, Intention } from "@/app/page"

interface Movie {
  id: number
  title: string
  release_date: string
  overview: string
  poster_path: string
  watch_providers?: any
}

interface SocialShareButtonProps {
  movie: Movie
  mood: Mood
  reason: Reason
  intention: Intention
}

export default function SocialShareButton({ movie, mood, reason, intention }: SocialShareButtonProps) {
  const [showShareModal, setShowShareModal] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="p-1.5 rounded-full bg-black/40 text-white/60 hover:bg-black/60 hover:text-white/80 transition-all backdrop-blur-sm"
        onClick={(e) => {
          e.stopPropagation()
          setShowShareModal(true)
        }}
        title="Share this recommendation"
      >
        <Share2 className="h-3.5 w-3.5" />
      </Button>

      <SocialShare
        movie={movie}
        mood={mood}
        reason={reason}
        intention={intention}
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
      />
    </>
  )
}

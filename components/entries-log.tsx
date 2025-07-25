"use client"

import { Card, CardContent } from "@/components/ui/card"
import { BookOpen, Calendar, Heart, Film } from "lucide-react"

export default function EntriesLog() {
  return (
    <div className="w-full max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center items-center gap-3 mb-4">
          <BookOpen className="h-8 w-8 text-amber-400" />
          <h1 className="text-4xl font-serif tracking-wider text-white">Your Entries</h1>
        </div>
        <p className="text-gray-400 font-light">A personal journal of your emotional cinema journey</p>
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent mx-auto"></div>
      </div>

      {/* Coming Soon Placeholder */}
      <Card className="bg-gradient-to-br from-gray-900/80 via-black/90 to-gray-900/80 border border-amber-900/20">
        <CardContent className="p-12 text-center space-y-6">
          <div className="flex justify-center items-center gap-4 text-amber-400/60">
            <Calendar className="h-12 w-12" />
            <Heart className="h-12 w-12" />
            <Film className="h-12 w-12" />
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-serif text-white">Coming Soon</h2>
            <p className="text-gray-400 font-light max-w-md mx-auto leading-relaxed">
              Your personal log will track your emotional journey through cinema, saving your moods, reasons, and
              discovered films for reflection and rediscovery.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 text-left">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Mood Timeline</span>
              </div>
              <p className="text-xs text-gray-500">Track your emotional patterns over time</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400">
                <Heart className="h-4 w-4" />
                <span className="text-sm font-medium">Saved Films</span>
              </div>
              <p className="text-xs text-gray-500">Your personal collection of meaningful movies</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-amber-400">
                <Film className="h-4 w-4" />
                <span className="text-sm font-medium">Viewing History</span>
              </div>
              <p className="text-xs text-gray-500">Remember what you watched and when</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

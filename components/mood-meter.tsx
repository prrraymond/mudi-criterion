"use client"

import { Button } from "@/components/ui/button"
import type { Mood } from "@/app/page"

const moodOptions: Mood[] = [
  { energy: "high", pleasantness: "pleasant", label: "Excited" },
  { energy: "high", pleasantness: "pleasant", label: "Happy" },
  { energy: "high", pleasantness: "pleasant", label: "Energetic" },
  { energy: "high", pleasantness: "unpleasant", label: "Angry" },
  { energy: "high", pleasantness: "unpleasant", label: "Anxious" },
  { energy: "high", pleasantness: "unpleasant", label: "Stressed" },
  { energy: "low", pleasantness: "pleasant", label: "Calm" },
  { energy: "low", pleasantness: "pleasant", label: "Content" },
  { energy: "low", pleasantness: "pleasant", label: "Relaxed" },
  { energy: "low", pleasantness: "unpleasant", label: "Sad" },
  { energy: "low", pleasantness: "unpleasant", label: "Tired" },
  { energy: "low", pleasantness: "unpleasant", label: "Bored" },
]

interface MoodMeterProps {
  selectedMood: Mood | null
  setSelectedMood: (mood: Mood) => void
}

export default function MoodMeter({ selectedMood, setSelectedMood }: MoodMeterProps) {
  const getButtonStyles = (mood: Mood, isSelected: boolean) => {
    const baseStyles = "w-full text-sm font-medium transition-all duration-300 transform hover:scale-105"

    if (mood.energy === "high" && mood.pleasantness === "pleasant") {
      // High Energy + Pleasant: Warm oranges/yellows (energetic, joyful)
      return isSelected
        ? `${baseStyles} bg-gradient-to-r from-orange-500 to-yellow-500 text-white hover:from-orange-400 hover:to-yellow-400 shadow-lg shadow-orange-500/25`
        : `${baseStyles} bg-gradient-to-r from-orange-500/20 to-yellow-500/20 border-orange-400/40 text-orange-300 hover:from-orange-500/40 hover:to-yellow-500/40 hover:border-orange-400/80 hover:text-orange-100 hover:shadow-md hover:shadow-orange-500/20`
    }

    if (mood.energy === "high" && mood.pleasantness === "unpleasant") {
      // High Energy + Unpleasant: Reds/pinks (intense, agitated)
      return isSelected
        ? `${baseStyles} bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-400 hover:to-pink-400 shadow-lg shadow-red-500/25`
        : `${baseStyles} bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-400/40 text-red-300 hover:from-red-500/40 hover:to-pink-500/40 hover:border-red-400/80 hover:text-red-100 hover:shadow-md hover:shadow-red-500/20`
    }

    if (mood.energy === "low" && mood.pleasantness === "pleasant") {
      // Low Energy + Pleasant: Cool blues/teals (calm, peaceful)
      return isSelected
        ? `${baseStyles} bg-gradient-to-r from-blue-500 to-teal-500 text-white hover:from-blue-400 hover:to-teal-400 shadow-lg shadow-blue-500/25`
        : `${baseStyles} bg-gradient-to-r from-blue-500/20 to-teal-500/20 border-blue-400/40 text-blue-300 hover:from-blue-500/40 hover:to-teal-500/40 hover:border-blue-400/80 hover:text-blue-100 hover:shadow-md hover:shadow-blue-500/20`
    }

    if (mood.energy === "low" && mood.pleasantness === "unpleasant") {
      // Low Energy + Unpleasant: Purples/indigos (melancholic, subdued)
      return isSelected
        ? `${baseStyles} bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:from-purple-400 hover:to-indigo-400 shadow-lg shadow-purple-500/25`
        : `${baseStyles} bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border-purple-400/40 text-purple-300 hover:from-purple-500/40 hover:to-indigo-500/40 hover:border-purple-400/80 hover:text-purple-100 hover:shadow-md hover:shadow-purple-500/20`
    }

    return baseStyles
  }

  const getQuadrantHoverStyles = (energy: "high" | "low", pleasantness: "pleasant" | "unpleasant") => {
    if (energy === "high" && pleasantness === "pleasant") {
      return "hover:bg-gradient-to-bl from-orange-500/10 to-yellow-500/10 transition-all duration-300"
    }
    if (energy === "high" && pleasantness === "unpleasant") {
      return "hover:bg-gradient-to-br from-red-500/10 to-pink-500/10 transition-all duration-300"
    }
    if (energy === "low" && pleasantness === "pleasant") {
      return "hover:bg-gradient-to-tl from-blue-500/10 to-teal-500/10 transition-all duration-300"
    }
    if (energy === "low" && pleasantness === "unpleasant") {
      return "hover:bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 transition-all duration-300"
    }
    return ""
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-serif text-center mb-6">Mood Meter</h2>

      {/* Mood coordinate system */}
      <div className="relative">
        {/* Vertical axis label (Energy) */}
        <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-gray-400 font-light whitespace-nowrap">
          Energy
        </div>

        {/* Horizontal axis label (Pleasantness) */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-xs text-gray-400 font-light">
          Pleasantness
        </div>

        {/* Main grid container */}
        <div className="relative border border-white/20 rounded-lg overflow-hidden">
          {/* Energy level indicators */}
          <div className="absolute -left-12 top-4 text-xs text-gray-400 font-light">High</div>
          <div className="absolute -left-12 bottom-4 text-xs text-gray-400 font-light">Low</div>

          {/* Pleasantness level indicators */}
          <div className="absolute -bottom-6 left-4 text-xs text-gray-400 font-light">Unpleasant</div>
          <div className="absolute -bottom-6 right-4 text-xs text-gray-400 font-light">Pleasant</div>

          {/* Center axes lines */}
          <div className="absolute top-0 left-1/2 w-px h-full bg-white/30"></div>
          <div className="absolute left-0 top-1/2 w-full h-px bg-white/30"></div>

          {/* 2x2 Grid */}
          <div className="grid grid-cols-2 grid-rows-2 min-h-[320px]">
            {/* Top Left: High Energy / Unpleasant */}
            <div
              className={`p-4 border-r border-b border-white/10 flex flex-col gap-2 bg-gradient-to-br from-red-500/5 to-pink-500/5 ${getQuadrantHoverStyles("high", "unpleasant")}`}
            >
              {moodOptions
                .filter((mood) => mood.energy === "high" && mood.pleasantness === "unpleasant")
                .map((mood) => (
                  <Button
                    key={mood.label}
                    variant="outline"
                    size="sm"
                    className={getButtonStyles(mood, selectedMood?.label === mood.label)}
                    onClick={() => setSelectedMood(mood)}
                  >
                    {mood.label}
                  </Button>
                ))}
            </div>

            {/* Top Right: High Energy / Pleasant */}
            <div
              className={`p-4 border-b border-white/10 flex flex-col gap-2 bg-gradient-to-bl from-orange-500/5 to-yellow-500/5 ${getQuadrantHoverStyles("high", "pleasant")}`}
            >
              {moodOptions
                .filter((mood) => mood.energy === "high" && mood.pleasantness === "pleasant")
                .map((mood) => (
                  <Button
                    key={mood.label}
                    variant="outline"
                    size="sm"
                    className={getButtonStyles(mood, selectedMood?.label === mood.label)}
                    onClick={() => setSelectedMood(mood)}
                  >
                    {mood.label}
                  </Button>
                ))}
            </div>

            {/* Bottom Left: Low Energy / Unpleasant */}
            <div
              className={`p-4 border-r border-white/10 flex flex-col gap-2 bg-gradient-to-tr from-purple-500/5 to-indigo-500/5 ${getQuadrantHoverStyles("low", "unpleasant")}`}
            >
              {moodOptions
                .filter((mood) => mood.energy === "low" && mood.pleasantness === "unpleasant")
                .map((mood) => (
                  <Button
                    key={mood.label}
                    variant="outline"
                    size="sm"
                    className={getButtonStyles(mood, selectedMood?.label === mood.label)}
                    onClick={() => setSelectedMood(mood)}
                  >
                    {mood.label}
                  </Button>
                ))}
            </div>

            {/* Bottom Right: Low Energy / Pleasant */}
            <div
              className={`p-4 flex flex-col gap-2 bg-gradient-to-tl from-blue-500/5 to-teal-500/5 ${getQuadrantHoverStyles("low", "pleasant")}`}
            >
              {moodOptions
                .filter((mood) => mood.energy === "low" && mood.pleasantness === "pleasant")
                .map((mood) => (
                  <Button
                    key={mood.label}
                    variant="outline"
                    size="sm"
                    className={getButtonStyles(mood, selectedMood?.label === mood.label)}
                    onClick={() => setSelectedMood(mood)}
                  >
                    {mood.label}
                  </Button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

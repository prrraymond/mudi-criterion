"use client"

import { Button } from "@/components/ui/button"
import type { Mood, Reason } from "@/app/page"

// Define reason categories mapped to mood types
const reasonsByMoodType = {
  "high-pleasant": [
    "Achievement or success",
    "Social interaction",
    "Creative expression",
    "Personal growth",
    "Exciting opportunity",
    "New relationship or connection",
  ],
  "high-unpleasant": [
    "Work or school stress",
    "Relationship conflict",
    "Financial pressure",
    "Health concerns",
    "Major deadline or pressure",
    "Overwhelming responsibilities",
  ],
  "low-pleasant": [
    "Personal reflection time",
    "Peaceful moment",
    "Completed a goal",
    "Quality time alone",
    "Meditation or mindfulness",
    "Enjoying simple pleasures",
  ],
  "low-unpleasant": [
    "Loss or grief",
    "Disappointment",
    "Feeling isolated",
    "Health concerns",
    "Major life change",
    "Seasonal or weather effects",
  ],
}

interface ReasonSelectorProps {
  selectedReason: Reason | null
  setSelectedReason: (reason: Reason) => void
  selectedMood: Mood | null
}

export default function ReasonSelector({ selectedReason, setSelectedReason, selectedMood }: ReasonSelectorProps) {
  // Determine which reasons to show based on mood
  const getMoodKey = (mood: Mood): keyof typeof reasonsByMoodType => {
    return `${mood.energy}-${mood.pleasantness}` as keyof typeof reasonsByMoodType
  }

  const availableReasons = selectedMood
    ? reasonsByMoodType[getMoodKey(selectedMood)]
    : reasonsByMoodType["high-pleasant"] // fallback

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-serif text-center">Why might you be feeling this way?</h2>
      <div className="grid grid-cols-1 gap-2">
        {availableReasons.map((reason) => (
          <Button
            key={reason}
            variant={selectedReason === reason ? "default" : "outline"}
            className={`w-full justify-start text-left ${
              selectedReason === reason
                ? "bg-white text-black hover:bg-white/90 hover:text-black"
                : "bg-transparent border-white/20 text-white hover:bg-white/10"
            }`}
            onClick={() => setSelectedReason(reason)}
          >
            {reason}
          </Button>
        ))}
      </div>
    </div>
  )
}

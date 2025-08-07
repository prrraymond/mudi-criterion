"use client"

import { Button } from "@/components/ui/button"
import type { Mood, Reason } from "@/app/page"

// 💡 Updated mood-to-reason mapping with optimized, user-centric wording
const reasonsBySpecificMood = {
  // HIGH ENERGY + PLEASANT
  "excited": [
    "Looking forward to an event",
    "Planning an adventure or trip",
    "A promising new start",
    "A creative breakthrough or discovery",
    "A new connection or romance",
    "Anticipating a personal win"
  ],

  "happy": [
    "A recent success or achievement",
    "Connecting with people I care about",
    "Receiving good news",
    "Feeling loved or appreciated",
    "Enjoying my surroundings",
    "A simple, joyful moment"
  ],

  "energetic": [
    "Feeling healthy and physically well",
    "After a great workout",
    "Inspired and driven by my goals",
    "Riding a wave of productivity",
    "From a good night's sleep",
    "Just feeling naturally full of life"
  ],

  // HIGH ENERGY + UNPLEASANT
  "angry": [
    "Feeling treated unfairly",
    "My boundaries were crossed",
    "Feeling disrespected or unheard",
    "Feeling blocked or frustrated",
    "Witnessing an injustice",
    "Dealing with a betrayal"
  ],

  "anxious": [
    "Worrying about the unknown",
    "Facing a big decision",
    "Afraid of failing or being judged",
    "Concerns about health or safety",
    "Feeling social pressure",
    "Stress about money or work"
  ],

  "stressed": [
    "Too much to do, too little time",
    "Juggling multiple responsibilities",
    "Facing high-stakes pressure",
    "Dealing with a difficult conflict",
    "Feeling overwhelmed by my environment",
    "Feeling completely burned out"
  ],

  // LOW ENERGY + PLEASANT
  "calm": [
    "A quiet moment of mindfulness",
    "After resolving a problem",
    "Being in a peaceful environment",
    "Feeling safe and sound",
    "A deep sense of inner peace",
    "Reflecting on my values"
  ],

  "content": [
    "Accepting things as they are",
    "Feeling grateful for what I have",
    "Fulfilled by my relationships",
    "Proud of my personal journey",
    "Enjoying the simple comforts of life",
    "Feeling aligned with who I am"
  ],

  "relaxed": [
    "Unwinding after a stressful period",
    "In a comfortable, cozy space",
    "Taking a well-deserved break",
    "Physical relief from tension",
    "On vacation or taking time off",
    "Successfully letting go of worry"
  ],

  // LOW ENERGY + UNPLEASANT
  "sad": [
    "Grieving a loss",
    "Disappointed with an outcome",
    "Feeling lonely or misunderstood",
    "Missing someone or something from the past",
    "Hurting for someone else",
    "A sense of emptiness or longing"
  ],

  "tired": [
    "Physically exhausted",
    "Mentally or emotionally drained",
    "From a lack of quality sleep",
    "Feeling run-down or unwell",
    "Worn out from a long day or week",
    "Just a general lack of energy"
  ],

  "bored": [
    "Needing mental stimulation",
    "Stuck in a monotonous routine",
    "Feeling unchallenged or underused",
    "Lacking a meaningful task or goal",
    "Feeling socially disconnected",
    "Feeling stuck or without direction"
  ]
}


interface ReasonSelectorProps {
  selectedReason: Reason | null
  setSelectedReason: (reason: Reason) => void
  selectedMood: Mood | null
}

export default function ReasonSelector({ selectedReason, setSelectedReason, selectedMood }: ReasonSelectorProps) {
  // Get reasons based on specific mood label
  const getMoodKey = (mood: Mood): keyof typeof reasonsBySpecificMood => {
    return mood.label.toLowerCase() as keyof typeof reasonsBySpecificMood
  }

  const availableReasons = selectedMood
    ? reasonsBySpecificMood[getMoodKey(selectedMood)]
    : reasonsBySpecificMood["happy"] // fallback to a neutral positive mood

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
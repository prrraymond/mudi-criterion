"use client"

import { Button } from "@/components/ui/button"
import type { Mood, Reason } from "@/app/page"

// Enhanced mood-to-reason mapping with unique sets for each emotion
const reasonsBySpecificMood = {
  // HIGH ENERGY + PLEASANT
  "excited": [
    "Upcoming event or opportunity",
    "New adventure or travel plans", 
    "Anticipating a special occasion",
    "Starting something new and challenging",
    "Breakthrough or discovery",
    "Romantic anticipation or attraction"
  ],
  
  "happy": [
    "Recent accomplishment or success",
    "Positive social interaction",
    "Receiving good news",
    "Feeling appreciated or loved",
    "Beautiful weather or environment",
    "Spontaneous joy or gratitude"
  ],
  
  "energetic": [
    "Good physical health and vitality",
    "Productive morning routine",
    "Exercise or physical activity",
    "Caffeine or natural energy boost",
    "Motivated by clear goals",
    "Feeling physically strong and capable"
  ],

  // HIGH ENERGY + UNPLEASANT
  "angry": [
    "Injustice or unfair treatment",
    "Boundaries being violated",
    "Feeling disrespected or dismissed",
    "Blocked goals or thwarted plans",
    "Witnessing wrongdoing",
    "Betrayal or broken trust"
  ],
  
  "anxious": [
    "Uncertainty about the future",
    "Important upcoming decision",
    "Fear of failure or judgment",
    "Health or safety concerns",
    "Social performance pressure",
    "Financial or security worries"
  ],
  
  "stressed": [
    "Multiple competing deadlines",
    "Overwhelming workload",
    "Time pressure and rushing",
    "Juggling too many responsibilities",
    "Difficult decision-making",
    "Pressure to meet expectations"
  ],

  // LOW ENERGY + PLEASANT
  "calm": [
    "Meditation or mindfulness practice",
    "Resolved conflict or problem",
    "Peaceful natural environment",
    "Sense of safety and security",
    "Deep breathing or relaxation",
    "Spiritual or philosophical reflection"
  ],
  
  "content": [
    "Acceptance of current circumstances",
    "Gratitude for what you have",
    "Feeling fulfilled in relationships",
    "Pride in personal progress",
    "Simple pleasures and comforts",
    "Alignment with personal values"
  ],
  
  "relaxed": [
    "End of a stressful period",
    "Comfortable physical environment",
    "Quality rest or leisure time",
    "Massage or physical relief",
    "Vacation or break from routine",
    "Letting go of control or worry"
  ],

  // LOW ENERGY + UNPLEASANT
  "sad": [
    "Loss or grief",
    "Disappointment in outcomes", 
    "Feeling misunderstood or alone",
    "Nostalgia or missing someone",
    "Empathy for others' suffering",
    "Unmet emotional needs"
  ],
  
  "tired": [
    "Physical or mental exhaustion",
    "Poor sleep quality or insomnia",
    "Emotional burnout",
    "Chronic stress effects",
    "Overcommitment and depletion",
    "Seasonal energy changes"
  ],
  
  "bored": [
    "Lack of mental stimulation",
    "Repetitive routine or monotony",
    "Underutilization of skills",
    "Absence of meaningful challenges",
    "Social isolation or understimulation",
    "Lack of purpose or direction"
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
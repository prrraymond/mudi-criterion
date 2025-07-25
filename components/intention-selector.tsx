"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Anchor, ArrowUpRight } from "lucide-react"
import type { Intention } from "@/app/page"

interface IntentionSelectorProps {
  selectedIntention: Intention | null
  setSelectedIntention: (intention: Intention) => void
}

export default function IntentionSelector({ selectedIntention, setSelectedIntention }: IntentionSelectorProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-serif text-center">What would you like to do with this feeling?</h2>

      <div className="grid grid-cols-1 gap-6">
        <Card
          className={`cursor-pointer border ${
            selectedIntention === "sit" ? "border-white" : "border-white/20"
          } hover:border-white/60 transition-colors bg-black`}
          onClick={() => setSelectedIntention("sit")}
        >
          <CardContent className="p-6 flex flex-col items-center text-center">
            <Anchor className="h-10 w-10 mb-3 text-white/80" />
            <h3 className="font-serif text-lg">Sit with this feeling</h3>
            <p className="text-sm text-gray-400 mt-2 font-light">
              Process and explore films that match your current emotional state
            </p>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer border ${
            selectedIntention === "shift" ? "border-white" : "border-white/20"
          } hover:border-white/60 transition-colors bg-black`}
          onClick={() => setSelectedIntention("shift")}
        >
          <CardContent className="p-6 flex flex-col items-center text-center">
            <ArrowUpRight className="h-10 w-10 mb-3 text-white/80" />
            <h3 className="font-serif text-lg">Shift to positive</h3>
            <p className="text-sm text-gray-400 mt-2 font-light">
              Find films that might help lift your mood to a more positive state
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

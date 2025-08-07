"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Film, Users, TrendingUp, Package, MessageSquare, Calendar } from 'lucide-react'
import FeaturebaseFeedback from "./featurebase-feedback"

export default function ProductionMap() {
  const [activeSubTab, setActiveSubTab] = useState<"board" | "schedule" | "notes">("board")

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Film className="h-8 w-8 text-blue-500" />
          <h1 className="text-4xl font-light tracking-tight">
            <span className="font-medium">Production</span>
            <span className="font-serif"> Map</span>
          </h1>
        </div>
        <div className="h-px w-24 bg-white/30 mx-auto"></div>
        <p className="text-gray-400 font-light max-w-2xl mx-auto">
          Behind the scenes of emotional cinema discovery. Share your vision, vote on features, and track our creative journey.
        </p>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">24</div>
            <div className="text-sm text-gray-400">Active Scenes</div>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">156</div>
            <div className="text-sm text-gray-400">Audience Votes</div>
          </CardContent>
        </Card>
        <Card className="bg-black/40 border-white/10">
          <CardContent className="p-4 text-center">
            <Package className="h-6 w-6 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">12</div>
            <div className="text-sm text-gray-400">Features Released</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 justify-center mb-8">
        <Button className="bg-blue-500 hover:bg-blue-600 text-white">
          <MessageSquare className="h-4 w-4 mr-2" />
          Pitch an Idea
        </Button>
        <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
          <TrendingUp className="h-4 w-4 mr-2" />
          View Popular Scripts
        </Button>
      </div>

      {/* Sub Navigation */}
      <div className="flex justify-center">
        <div className="flex border border-white/20 rounded-lg overflow-hidden bg-black/30">
          <button
            onClick={() => setActiveSubTab("board")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
              activeSubTab === "board" ? "bg-blue-500 text-white" : "bg-transparent text-white hover:bg-white/10"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Story Board
          </button>
          <button
            onClick={() => setActiveSubTab("schedule")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
              activeSubTab === "schedule" ? "bg-blue-500 text-white" : "bg-transparent text-white hover:bg-white/10"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Production Schedule
          </button>
          <button
            onClick={() => setActiveSubTab("notes")}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-all ${
              activeSubTab === "notes" ? "bg-blue-500 text-white" : "bg-transparent text-white hover:bg-white/10"
            }`}
          >
            <Package className="h-4 w-4" />
            Release Notes
          </button>
        </div>
      </div>

      {/* Featurebase Embed */}
      <Card className="bg-black/20 border-white/10 min-h-[600px]">
        <CardContent className="p-0">
          <FeaturebaseFeedback
            organization="mudicriterions" // You need to replace this with your actual organization
            path={activeSubTab === "board" ? "/" : activeSubTab === "schedule" ? "/roadmap" : "/changelog"}
            theme="dark"
            hideMenu={false}
            hideLogo={false}
          />
        </CardContent>
      </Card>
    </div>
  )
}


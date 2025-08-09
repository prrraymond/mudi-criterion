"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Heart, Film, Users } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl tracking-tight text-white mb-4">
          <span className="font-medium">Mudi</span>
          <span className="font-serif"> Criterions</span>
        </h1>
        <div className="h-px w-24 bg-white/30 mx-auto mb-6"></div>
        <p className="text-gray-300 text-lg font-light leading-relaxed">
          Emotional cinema discovery for the thoughtful viewer
        </p>
      </div>

      {/* Mission */}
      <Card className="bg-black/50 border-white/10">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-medium text-white">Our Mission</h2>
          </div>
          <p className="text-gray-300 leading-relaxed mb-4">
            We believe films have the power to move the soul. Mudi Criterions connects your current emotional state with carefully curated cinema, helping you discover movies that resonate with how you're feeling right now.
          </p>
          <p className="text-gray-300 leading-relaxed">
            Our goal is simple: connect more people with more movies that matter.
          </p>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="bg-black/50 border-white/10">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <Film className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-medium text-white">How It Works</h2>
          </div>
          <div className="space-y-3 text-gray-300">
            <p><span className="text-white font-medium">1. Mood Check:</span> Tell us how you're feeling using our emotion meter</p>
            <p><span className="text-white font-medium">2. Context:</span> Share why you might be feeling this way</p>
            <p><span className="text-white font-medium">3. Intention:</span> Choose whether you want to sit with the feeling or shift it</p>
            <p><span className="text-white font-medium">4. Discover:</span> Get personalized film recommendations that match your emotional state</p>
          </div>
        </CardContent>
      </Card>

      {/* Inspiration */}
      <Card className="bg-black/50 border-white/10">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <Users className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-medium text-white">Inspiration</h2>
          </div>
          <p className="text-gray-300 leading-relaxed">
            Inspired by the mood meter approach to emotional intelligence and a deep love for cinema's ability to reflect and transform our inner lives. Every recommendation is crafted to honor both your current emotional state and the artistry of film.
          </p>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="bg-black/50 border-white/10">
        <CardContent className="p-8 text-center">
          <h2 className="text-xl font-medium text-white mb-4">Get in Touch</h2>
          <p className="text-gray-300 mb-6">
            Questions, suggestions, or just want to chat about movies?
          </p>
          <Button
            asChild
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            <a
              href="https://www.linkedin.com/in/paulrenaud-raymond"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              Connect on LinkedIn
              <ExternalLink className="h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

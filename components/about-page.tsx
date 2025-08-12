"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Heart, Film, Users, Target } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl tracking-tight text-white mb-2">
          <span className="font-medium">About</span>
          <span className="font-serif"> Mudi Criterions</span>
        </h1>
        <div className="h-px w-16 bg-white/30 mx-auto my-4"></div>
        <p className="text-lg text-gray-300 font-light">Emotional cinema discovery for the thoughtful viewer</p>
      </div>

      {/* Mission */}
      <Card className="bg-black border-white/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Target className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-medium text-white mb-3">Our Mission</h2>
              <p className="text-gray-300 font-light leading-relaxed">
                Connect more people with more movies that matter. We believe cinema has the power to transform, heal,
                and inspire—when matched thoughtfully to your emotional state.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card className="bg-black border-white/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Film className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-medium text-white mb-4">How It Works</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-medium mt-0.5">
                    1
                  </div>
                  <p className="text-gray-300 font-light">
                    <span className="text-white font-medium">Identify your mood</span> using our emotion meter
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-medium mt-0.5">
                    2
                  </div>
                  <p className="text-gray-300 font-light">
                    <span className="text-white font-medium">Share the reason</span> behind your current feeling
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-medium mt-0.5">
                    3
                  </div>
                  <p className="text-gray-300 font-light">
                    <span className="text-white font-medium">Choose your intention</span>—sit with the feeling or shift
                    to positive
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs flex items-center justify-center font-medium mt-0.5">
                    4
                  </div>
                  <p className="text-gray-300 font-light">
                    <span className="text-white font-medium">Discover films</span> curated to resonate with your
                    emotional journey
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inspiration */}
      <Card className="bg-black border-white/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Heart className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-medium text-white mb-3">Inspiration</h2>
              <p className="text-gray-300 font-light leading-relaxed mb-4">
                Born from a love of cinema's transformative power and inspired by emotional intelligence research. We
                believe the right film at the right moment can provide comfort, catharsis, or a new perspective on
                life's complexities.
              </p>
              <p className="text-gray-300 font-light leading-relaxed">
                Drawing from the curatorial excellence of Criterion Collection and the thoughtful discovery approach of
                Mubi, we've created a space where emotion meets cinema.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="bg-black border-white/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Users className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-xl font-medium text-white mb-3">Get in Touch</h2>
              <p className="text-gray-300 font-light leading-relaxed mb-4">
                Questions, suggestions, or just want to share how a film moved you? We'd love to hear from you.
              </p>
              <Button
                asChild
                variant="outline"
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500/70 bg-transparent"
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
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Database, Film, Tv, Globe } from 'lucide-react'

export default function CreditsPage() {
  const dataSources = [
    {
      name: "The Movie Database (TMDB)",
      description: "Comprehensive movie metadata and imagery",
      url: "https://www.themoviedb.org/",
      icon: Database
    }
  ]

  const inspirations = [
    {
      name: "Criterion Collection",
      description: "Curating important classic and contemporary films",
      url: "https://www.criterion.com/",
      icon: Film
    },
    {
      name: "Mubi",
      description: "Hand-picked cinema for the curious",
      url: "https://mubi.com/",
      icon: Globe
    }
  ]

  const streamingServices = [
    {
      name: "Netflix",
      url: "https://www.netflix.com/"
    },
    {
      name: "Amazon Prime Video",
      url: "https://www.primevideo.com/"
    },
    {
      name: "Hulu",
      url: "https://www.hulu.com/"
    },
    {
      name: "HBO Max",
      url: "https://www.hbomax.com/"
    },
    {
      name: "Disney+",
      url: "https://www.disneyplus.com/"
    },
    {
      name: "Apple TV+",
      url: "https://tv.apple.com/"
    },
    {
      name: "Paramount+",
      url: "https://www.paramountplus.com/"
    },
    {
      name: "Peacock",
      url: "https://www.peacocktv.com/"
    }
  ]

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl tracking-tight text-white mb-4">Credits</h1>
        <div className="h-px w-16 bg-white/30 mx-auto mb-6"></div>
        <p className="text-gray-300 font-light">
          Built with gratitude to the platforms and services that make this possible
        </p>
      </div>

      {/* Data Sources */}
      <Card className="bg-black/50 border-white/10">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Database className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-medium text-white">Data Sources</h2>
          </div>
          <div className="space-y-4">
            {dataSources.map((source) => (
              <div key={source.name} className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">{source.name}</h3>
                  <p className="text-gray-400 text-sm">{source.description}</p>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                >
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    Visit
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Inspirations */}
      <Card className="bg-black/50 border-white/10">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Film className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-medium text-white">Inspirations</h2>
          </div>
          <div className="space-y-4">
            {inspirations.map((inspiration) => (
              <div key={inspiration.name} className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-medium mb-1">{inspiration.name}</h3>
                  <p className="text-gray-400 text-sm">{inspiration.description}</p>
                </div>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                >
                  <a
                    href={inspiration.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1"
                  >
                    Visit
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Streaming Services */}
      <Card className="bg-black/50 border-white/10">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Tv className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-medium text-white">Streaming Partners</h2>
          </div>
          <p className="text-gray-400 text-sm mb-4">
            Availability information provided for the following platforms:
          </p>
          <div className="grid grid-cols-2 gap-3">
            {streamingServices.map((service) => (
              <Button
                key={service.name}
                asChild
                variant="ghost"
                size="sm"
                className="justify-start text-gray-300 hover:text-white hover:bg-white/5 h-auto py-2"
              >
                <a
                  href={service.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between w-full"
                >
                  <span className="text-sm">{service.name}</span>
                  <ExternalLink className="h-3 w-3 opacity-50" />
                </a>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer Note */}
      <div className="text-center">
        <p className="text-gray-500 text-sm">
          This product uses the TMDB API but is not endorsed or certified by TMDB.
        </p>
      </div>
    </div>
  )
}

"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Database, Palette, Tv } from "lucide-react"

export default function CreditsPage() {
  const streamingServices = [
    { name: "Netflix", url: "https://netflix.com" },
    { name: "Amazon Prime Video", url: "https://primevideo.com" },
    { name: "Hulu", url: "https://hulu.com" },
    { name: "Disney+", url: "https://disneyplus.com" },
    { name: "HBO Max", url: "https://hbomax.com" },
    { name: "Apple TV+", url: "https://tv.apple.com" },
    { name: "Paramount+", url: "https://paramountplus.com" },
    { name: "Peacock", url: "https://peacocktv.com" },
    { name: "Starz", url: "https://starz.com" },
    { name: "Showtime", url: "https://showtime.com" },
    { name: "Crunchyroll", url: "https://crunchyroll.com" },
    { name: "Funimation", url: "https://funimation.com" },
  ]

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl tracking-tight text-white mb-2">
          <span className="font-medium">Credits &</span>
          <span className="font-serif"> Acknowledgments</span>
        </h1>
        <div className="h-px w-16 bg-white/30 mx-auto my-4"></div>
        <p className="text-lg text-gray-300 font-light">
          Built with gratitude to the platforms and services that make cinema accessible
        </p>
      </div>

      {/* Data Sources */}
      <Card className="bg-black border-white/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Database className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-xl font-medium text-white mb-4">Data Sources</h2>

              <div className="space-y-4">
                <div className="border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white">The Movie Database (TMDB)</h3>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    >
                      <a
                        href="https://www.themoviedb.org"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        Visit <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                  <p className="text-gray-300 font-light text-sm leading-relaxed">
                    Movie metadata, posters, and streaming availability powered by TMDB. This product uses the TMDB API
                    but is not endorsed or certified by TMDB.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inspirations */}
      <Card className="bg-black border-white/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Palette className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-xl font-medium text-white mb-4">Design Inspirations</h2>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white">Criterion Collection</h3>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    >
                      <a
                        href="https://criterion.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        Visit <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                  <p className="text-gray-300 font-light text-sm">
                    Aesthetic inspiration from the gold standard of film curation and presentation.
                  </p>
                </div>

                <div className="border border-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-white">Mubi</h3>
                    <Button
                      asChild
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                    >
                      <a
                        href="https://mubi.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        Visit <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                  <p className="text-gray-300 font-light text-sm">
                    Thoughtful curation approach and sophisticated design philosophy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Streaming Services */}
      <Card className="bg-black border-white/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Tv className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-xl font-medium text-white mb-4">Streaming Partners</h2>
              <p className="text-gray-300 font-light text-sm mb-4">
                Availability information provided for the following streaming services:
              </p>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
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
                      className="flex items-center gap-2 text-xs"
                    >
                      {service.name}
                      <ExternalLink className="h-3 w-3 opacity-50" />
                    </a>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-black border-white/10">
        <CardContent className="p-6">
          <p className="text-gray-400 font-light text-sm leading-relaxed">
            All trademarks, service marks, and company names are the property of their respective owners. This
            application is not affiliated with, endorsed by, or sponsored by any of the mentioned services. Streaming
            availability may vary by region and change without notice.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

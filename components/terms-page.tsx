"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Shield, AlertTriangle, Scale, Mail } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl tracking-tight text-white mb-2">
          <span className="font-medium">Terms &</span>
          <span className="font-serif"> Conditions</span>
        </h1>
        <div className="h-px w-16 bg-white/30 mx-auto my-4"></div>
        <p className="text-lg text-gray-300 font-light">Last updated: August 2024</p>
      </div>

      {/* Acceptance */}
      <Card className="bg-black border-white/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Scale className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-medium text-white mb-3">Acceptance of Terms</h2>
              <p className="text-gray-300 font-light leading-relaxed">
                By accessing and using Mudi Criterions, you accept and agree to be bound by the terms and provision of
                this agreement. This service is provided for educational and entertainment purposes only, with no
                commercial intent.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Description */}
      <Card className="bg-black border-white/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Shield className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-medium text-white mb-3">Service Description</h2>
              <p className="text-gray-300 font-light leading-relaxed mb-4">
                Mudi Criterions is a mood-based movie recommendation platform that helps users discover films based on
                their emotional state. We provide curated suggestions using data from The Movie Database (TMDB) and
                streaming availability information.
              </p>
              <p className="text-gray-300 font-light leading-relaxed">
                This service is provided as-is for personal, non-commercial use only. We do not claim ownership of any
                copyrighted content and respect all intellectual property rights.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Third-Party Services */}
      <Card className="bg-black border-white/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <ExternalLink className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-medium text-white mb-3">Third-Party Services</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-white mb-2">Data Sources</h3>
                  <p className="text-gray-300 font-light leading-relaxed">
                    We use The Movie Database (TMDB) API for movie information. By using our service, you agree to
                    comply with TMDB's terms of service. We are not affiliated with or endorsed by TMDB.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-white mb-2">Streaming Services</h3>
                  <p className="text-gray-300 font-light leading-relaxed">
                    Streaming availability information is provided for convenience only. We are not affiliated with any
                    streaming platforms. Access to content is subject to each platform's terms of service and regional
                    availability.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liability Limitations */}
      <Card className="bg-black border-white/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-medium text-white mb-3">Limitation of Liability</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-white mb-2">Content Recommendations</h3>
                  <p className="text-gray-300 font-light leading-relaxed">
                    Movie recommendations are generated algorithmically based on mood inputs. We are not responsible for
                    any adverse emotional reactions, psychological effects, or other consequences resulting from viewing
                    recommended content.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-white mb-2">Service Availability</h3>
                  <p className="text-gray-300 font-light leading-relaxed">
                    We do not guarantee uninterrupted service availability. The service may be temporarily unavailable
                    due to maintenance, updates, or technical issues beyond our control.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-white mb-2">External Links</h3>
                  <p className="text-gray-300 font-light leading-relaxed">
                    We are not responsible for the content, privacy policies, or practices of third-party websites
                    linked from our service.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Intellectual Property */}
      <Card className="bg-black border-white/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Shield className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-medium text-white mb-3">Intellectual Property</h2>
              <p className="text-gray-300 font-light leading-relaxed mb-4">
                We respect intellectual property rights and do not claim ownership of any copyrighted movie content,
                posters, or metadata. All movie-related content is used under fair use for educational and informational
                purposes.
              </p>
              <p className="text-gray-300 font-light leading-relaxed">
                If you believe your intellectual property rights have been infringed, please contact us immediately for
                resolution.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="bg-black border-white/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Shield className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-medium text-white mb-3">Privacy & Data</h2>
              <p className="text-gray-300 font-light leading-relaxed mb-4">
                We collect minimal personal information necessary to provide the service. Mood entries and movie
                interactions are stored securely and used only to improve recommendations and track usage patterns.
              </p>
              <p className="text-gray-300 font-light leading-relaxed">
                We do not sell, share, or distribute personal data to third parties for commercial purposes.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Changes to Terms */}
      <Card className="bg-black border-white/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <AlertTriangle className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
            <div>
              <h2 className="text-xl font-medium text-white mb-3">Changes to Terms</h2>
              <p className="text-gray-300 font-light leading-relaxed">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon
                posting. Continued use of the service constitutes acceptance of modified terms.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="bg-black border-white/10">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Mail className="h-6 w-6 text-blue-500 mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h2 className="text-xl font-medium text-white mb-3">Contact Information</h2>
              <p className="text-gray-300 font-light leading-relaxed mb-4">
                For questions about these terms, intellectual property concerns, or general inquiries, please contact
                us:
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
                  Contact via LinkedIn
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

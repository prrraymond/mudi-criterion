"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Shield, AlertTriangle, ExternalLink, Scale } from 'lucide-react'

export default function TermsPage() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl tracking-tight text-white mb-4">Terms & Conditions</h1>
        <div className="h-px w-24 bg-white/30 mx-auto mb-6"></div>
        <p className="text-gray-300 font-light">
          Last updated: December 2024
        </p>
      </div>

      {/* Acceptance of Terms */}
      <Card className="bg-black/50 border-white/10">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-medium text-white">Acceptance of Terms</h2>
          </div>
          <p className="text-gray-300 leading-relaxed">
            By accessing and using Mudi Criterions, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </CardContent>
      </Card>

      {/* Service Description */}
      <Card className="bg-black/50 border-white/10">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-medium text-white">Service Description</h2>
          </div>
          <p className="text-gray-300 leading-relaxed mb-4">
            Mudi Criterions is a non-commercial, educational platform that provides movie recommendations based on emotional states. This service is provided for personal, non-commercial use only.
          </p>
          <p className="text-gray-300 leading-relaxed">
            We do not host, store, or distribute any copyrighted content. All movie information is sourced from publicly available APIs and databases.
          </p>
        </CardContent>
      </Card>

      {/* Third-Party Services */}
      <Card className="bg-black/50 border-white/10">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <ExternalLink className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-medium text-white">Third-Party Services</h2>
          </div>
          <p className="text-gray-300 leading-relaxed mb-4">
            Our service integrates with and references various third-party platforms and services, including but not limited to:
          </p>
          <ul className="text-gray-300 space-y-2 mb-4">
            <li>• The Movie Database (TMDB)</li>
            <li>• Streaming platforms (Netflix, Amazon Prime, Hulu, etc.)</li>
            <li>• Criterion Collection</li>
            <li>• Mubi</li>
          </ul>
          <p className="text-gray-300 leading-relaxed">
            Your use of these third-party services is governed by their respective terms of service. We are not responsible for the content, privacy policies, or practices of any third-party services.
          </p>
        </CardContent>
      </Card>

      {/* Intellectual Property */}
      <Card className="bg-black/50 border-white/10">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-medium text-white">Intellectual Property</h2>
          </div>
          <p className="text-gray-300 leading-relaxed mb-4">
            All movie titles, images, descriptions, and related content are the property of their respective owners. We make no claim to ownership of any copyrighted material.
          </p>
          <p className="text-gray-300 leading-relaxed mb-4">
            This service is created for educational and personal use purposes only, with no intent for commercialization or infringement of existing intellectual property rights.
          </p>
          <p className="text-gray-300 leading-relaxed">
            If you are a rights holder and believe your content is being used inappropriately, please contact us for immediate resolution.
          </p>
        </CardContent>
      </Card>

      {/* Disclaimer of Warranties */}
      <Card className="bg-black/50 border-white/10">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-medium text-white">Disclaimer of Warranties</h2>
          </div>
          <p className="text-gray-300 leading-relaxed mb-4">
            The information on this service is provided on an "as is" basis. To the fullest extent permitted by law, this service:
          </p>
          <ul className="text-gray-300 space-y-2 mb-4">
            <li>• Excludes all representations and warranties relating to this service and its contents</li>
            <li>• Excludes all liability for damages arising out of or in connection with your use of this service</li>
            <li>• Makes no guarantees about the accuracy, completeness, or timeliness of movie information</li>
          </ul>
        </CardContent>
      </Card>

      {/* Limitation of Liability */}
      <Card className="bg-black/50 border-white/10">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-medium text-white">Limitation of Liability</h2>
          </div>
          <p className="text-gray-300 leading-relaxed mb-4">
            We shall not be liable for any adverse externalities, emotional responses, or consequences resulting from:
          </p>
          <ul className="text-gray-300 space-y-2 mb-4">
            <li>• Movie recommendations provided by this service</li>
            <li>• Content of recommended films</li>
            <li>• Availability or unavailability of streaming services</li>
            <li>• Technical issues or service interruptions</li>
            <li>• Any decisions made based on recommendations from this service</li>
          </ul>
          <p className="text-gray-300 leading-relaxed">
            Users are responsible for their own viewing choices and any consequences thereof.
          </p>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="bg-black/50 border-white/10">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-medium text-white">Privacy</h2>
          </div>
          <p className="text-gray-300 leading-relaxed">
            We respect your privacy. Any personal information collected is used solely to provide and improve our service. We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except as described in our privacy practices.
          </p>
        </CardContent>
      </Card>

      {/* Changes to Terms */}
      <Card className="bg-black/50 border-white/10">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <Scale className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-medium text-white">Changes to Terms</h2>
          </div>
          <p className="text-gray-300 leading-relaxed">
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service after any changes constitutes acceptance of the new terms.
          </p>
        </CardContent>
      </Card>

      {/* Contact */}
      <Card className="bg-black/50 border-white/10">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-4">
            <ExternalLink className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-medium text-white">Contact</h2>
          </div>
          <p className="text-gray-300 leading-relaxed">
            If you have any questions about these Terms & Conditions, please contact us at{' '}
            <a 
              href="https://www.linkedin.com/in/paulrenaud-raymond" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              LinkedIn
            </a>.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

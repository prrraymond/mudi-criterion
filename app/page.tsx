"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import MoodMeter from "@/components/mood-meter"
import ReasonSelector from "@/components/reason-selector"
import IntentionSelector from "@/components/intention-selector"
import MovieRecommendations from "@/components/movie-recommendations"
import GlobalDashboard from "@/components/global-dashboard"
import EntriesLog from "@/components/entries-log"
import AuthModal from "@/components/auth-modal"
import { useAuth } from "@/components/auth-provider"
import { ArrowLeft, ArrowRight, Home, BookOpen, Globe, User, LogOut } from "lucide-react"
import ProfileSetup from "@/components/profile-setup"

export type Mood = {
  energy: "high" | "low"
  pleasantness: "pleasant" | "unpleasant"
  label: string
}

export type Reason = string
export type Intention = "sit" | "shift"

export default function HomePage() {
  const [step, setStep] = useState(1)
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null)
  const [selectedReason, setSelectedReason] = useState<Reason | null>(null)
  const [selectedIntention, setSelectedIntention] = useState<Intention | null>(null)
  const [activeTab, setActiveTab] = useState<"home" | "entries" | "global">("home")
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user, loading, signOut, hasProfile, checkProfile } = useAuth()

  // Fix hydration by ensuring component is mounted
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (user && !loading && mounted) {
      checkProfile().then((exists) => {
        if (!exists) {
          setShowProfileSetup(true)
        }
      })
    }
  }, [user, loading, checkProfile, mounted])

  // Prevent hydration mismatch by not rendering auth-dependent content until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <nav className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="w-full px-4">
            <div className="flex items-center justify-between">
              <div className="flex border border-white/20 rounded-lg overflow-hidden bg-black/30">
                <button className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-white text-black">
                  <Home className="h-3 w-3" />
                  Home
                </button>
              </div>
              <div className="flex items-center">
                <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              </div>
            </div>
          </div>
        </nav>
        <main className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center p-4">
          <div className="h-10 w-10 border-4 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400 font-light">Loading...</p>
        </main>
      </div>
    )
  }

  const getUserName = () => {
    if (!user) return ""
    return (
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      user.user_metadata?.first_name ||
      user.email?.split("@")[0] ||
      "there"
    )
  }

  const nextStep = () => {
    if (
      (step === 1 && selectedMood) ||
      (step === 2 && selectedReason) ||
      (step === 3 && selectedIntention) ||
      step === 4
    ) {
      setStep((prevStep) => prevStep + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep((prevStep) => prevStep - 1)
    }
  }

  const resetFlow = () => {
    setStep(1)
    setSelectedMood(null)
    setSelectedReason(null)
    setSelectedIntention(null)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Menu Bar */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="w-full px-4">
          <div className="flex items-center justify-between">
            {/* Navigation Tabs - Anchored to far left */}
            <div className="flex border border-white/20 rounded-lg overflow-hidden bg-black/30">
              <button
                onClick={() => {
                  setActiveTab("home")
                  if (activeTab !== "home") resetFlow()
                }}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-medium transition-all ${
                  activeTab === "home" ? "bg-white text-black" : "bg-transparent text-white hover:bg-white/10"
                }`}
              >
                <Home className="h-3 w-3" />
                Home
              </button>
              <button
                onClick={() => setActiveTab("entries")}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-medium transition-all ${
                  activeTab === "entries" ? "bg-white text-black" : "bg-transparent text-white hover:bg-white/10"
                }`}
              >
                <BookOpen className="h-3 w-3" />
                Entries Log
              </button>
              <button
                onClick={() => setActiveTab("global")}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-medium transition-all ${
                  activeTab === "global" ? "bg-white text-black" : "bg-transparent text-white hover:bg-white/10"
                }`}
              >
                <Globe className="h-3 w-3" />
                Global
              </button>
            </div>

            {/* Auth Section - Anchored to far right */}
            <div className="flex items-center">
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : user ? (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-300 font-light">Welcome, {getUserName()}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowProfileSetup(true)}
                    className="text-white/60 hover:text-white hover:bg-white/10 p-2"
                    title="Edit profile"
                  >
                    <User className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="text-white/60 hover:text-white hover:bg-white/10 p-2"
                    title="Sign out"
                  >
                    <LogOut className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAuthModal(true)}
                  className="text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2 text-xs"
                >
                  <User className="h-3 w-3" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center p-4">
        {activeTab === "home" && (
          <>
            {step < 4 ? (
              <Card className="w-full max-w-md bg-black text-white shadow-md rounded-lg border border-white/10">
                <CardContent className="pt-6 px-6 pb-6">
                  <div className="mb-8 text-center">
                    <h1 className="text-3xl tracking-tight text-white">
                      <span className="font-medium">Mudi</span>
                      <span className="font-serif"> Criterions</span>
                    </h1>
                    <div className="h-px w-16 bg-white/30 mx-auto my-3"></div>
                    <p className="text-gray-400 mt-1 font-light tracking-wide">
                      {step === 1
                        ? "What are you feeling right now?"
                        : step === 2
                          ? "Why might you be feeling this way?"
                          : "What would you like to do with this feeling?"}
                    </p>
                  </div>

                  <div className="my-6">
                    {step === 1 && <MoodMeter selectedMood={selectedMood} setSelectedMood={setSelectedMood} />}
                    {step === 2 && (
                      <ReasonSelector
                        selectedReason={selectedReason}
                        setSelectedReason={setSelectedReason}
                        selectedMood={selectedMood}
                      />
                    )}
                    {step === 3 && (
                      <IntentionSelector
                        selectedIntention={selectedIntention}
                        setSelectedIntention={setSelectedIntention}
                      />
                    )}
                  </div>

                  <div className="flex justify-between mt-10 border-t border-white/10 pt-4">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={step === 1}
                      className="flex items-center gap-1 border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>

                    <Button
                      onClick={nextStep}
                      disabled={
                        (step === 1 && !selectedMood) ||
                        (step === 2 && !selectedReason) ||
                        (step === 3 && !selectedIntention)
                      }
                      className="flex items-center gap-1 bg-white text-black hover:bg-white/90"
                    >
                      Next <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="w-full">
                {/* Header section in narrow format */}
                <div className="w-full max-w-md mx-auto mb-8 text-center">
                  <h1 className="text-3xl tracking-tight text-white">
                    <span className="font-medium">Mudi</span>
                    <span className="font-serif"> Criterions</span>
                  </h1>
                  <div className="h-px w-16 bg-white/30 mx-auto my-3"></div>
                  <p className="text-gray-400 mt-1 font-light tracking-wide">
                    Films that might resonate with you
                  </p>
                </div>

                {/* Movie recommendations in full width */}
                {selectedMood && selectedReason && selectedIntention && (
                  <MovieRecommendations mood={selectedMood} reason={selectedReason} intention={selectedIntention} />
                )}

                {/* Navigation in narrow format */}
                <div className="w-full max-w-md mx-auto mt-8">
                  <div className="flex justify-between border-t border-white/10 pt-4">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      className="flex items-center gap-1 border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button
                      onClick={resetFlow}
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent"
                    >
                      Start Over
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === "entries" && <EntriesLog />}

        {activeTab === "global" && <GlobalDashboard />}
      </main>

      {/* Profile Setup Modal */}
      <ProfileSetup
        isOpen={showProfileSetup}
        onClose={() => setShowProfileSetup(false)}
        onComplete={() => {
          setShowProfileSetup(false)
          checkProfile() // Refresh profile status
        }}
      />

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  )
}
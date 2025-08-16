"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, ArrowLeft } from "lucide-react"
import { useAuth } from "./auth-provider"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [view, setView] = useState<"main" | "signin" | "signup" | "reset">("main")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const { signIn, signInWithEmail, signUpWithEmail, resetPassword } = useAuth()

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError("")
      await signIn()
    } catch (error: any) {
      console.error("Google sign in error:", error)
      if (error?.message?.includes("Invalid API key") || error?.message?.includes("API key")) {
        setError("Authentication service temporarily unavailable. Please try again later.")
      } else {
        setError("Failed to sign in with Google. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    try {
      setLoading(true)
      setError("")
      const { error } = await signInWithEmail(email, password)
      if (error) {
        if (error.message?.includes("Invalid API key") || error.message?.includes("API key")) {
          setError("Authentication service temporarily unavailable. Please try again later.")
        } else if (error.message?.includes("Invalid login credentials")) {
          setError("Invalid email or password")
        } else {
          setError(error.message || "Failed to sign in")
        }
      } else {
        onClose()
      }
    } catch (error: any) {
      console.error("Email sign in error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    try {
      setLoading(true)
      setError("")
      const { error } = await signUpWithEmail(email, password)
      if (error) {
        if (error.message?.includes("Invalid API key") || error.message?.includes("API key")) {
          setError("Authentication service temporarily unavailable. Please try again later.")
        } else if (error.message?.includes("User already registered")) {
          setError("An account with this email already exists. Try signing in instead.")
        } else {
          setError(error.message || "Failed to create account")
        }
      } else {
        setSuccess("Check your email for a confirmation link!")
        setEmail("")
        setPassword("")
      }
    } catch (error: any) {
      console.error("Email sign up error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError("Please enter your email address")
      return
    }

    try {
      setLoading(true)
      setError("")
      const { error } = await resetPassword(email)
      if (error) {
        if (error.message?.includes("Invalid API key") || error.message?.includes("API key")) {
          setError("Authentication service temporarily unavailable. Please try again later.")
        } else {
          setError(error.message || "Failed to send reset email")
        }
      } else {
        setSuccess("Password reset email sent! Check your inbox.")
        setEmail("")
      }
    } catch (error: any) {
      console.error("Password reset error:", error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setError("")
    setSuccess("")
    setLoading(false)
  }

  const handleViewChange = (newView: typeof view) => {
    resetForm()
    setView(newView)
  }

  const handleClose = () => {
    resetForm()
    setView("main")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Background with cinematic image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/lost-in-translation.png')",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Modal Content */}
      <div className="relative w-full max-w-md mx-4">
        {view === "main" ? (
          // Main Welcome Screen (Mubi Style)
          <div className="text-white">
            {/* Brand Dots */}
            <div className="flex gap-1 mb-8">
              <div className="w-2 h-2 bg-white rounded-full" />
              <div className="w-2 h-2 bg-white rounded-full" />
              <div className="w-2 h-2 bg-white rounded-full" />
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>

            {/* Close Button */}
            <button
              onClick={handleClose}
              className="absolute top-0 right-0 p-2 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Welcome Content */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl font-light tracking-wide mb-4">
                  WELCOME TO
                  <br />
                  EMOTIONAL CINEMA
                </h1>
                <p className="text-lg font-light text-white/80 mb-2">FREE TO USE</p>
                <p className="text-sm text-white/60 leading-relaxed">
                  Discover movies that match your mood.
                  <br />
                  No subscription required.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <Button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-full transition-all duration-200"
                >
                  {loading ? "SIGNING IN..." : "SIGN IN WITH GOOGLE"}
                </Button>

                <Button
                  onClick={() => handleViewChange("signup")}
                  variant="outline"
                  className="w-full h-14 bg-white/10 hover:bg-white/20 text-white border-white/20 font-medium rounded-full backdrop-blur-sm transition-all duration-200"
                >
                  CREATE ACCOUNT
                </Button>

                <Button
                  onClick={() => handleViewChange("signin")}
                  variant="ghost"
                  className="w-full h-14 text-white/80 hover:text-white hover:bg-white/10 font-medium rounded-full transition-all duration-200"
                >
                  SIGN IN WITH EMAIL
                </Button>
              </div>
            </div>
          </div>
        ) : (
          // Form Views
          <div className="bg-black/80 backdrop-blur-md rounded-2xl p-8 text-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleViewChange("main")}
                  className="p-1 text-white/70 hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-xl font-medium">
                  {view === "signin" && "Sign In"}
                  {view === "signup" && "Sign Up"}
                  {view === "reset" && "Reset Password"}
                </h2>
              </div>
              <button onClick={handleClose} className="p-1 text-white/70 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg text-red-200 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 bg-green-900/50 border border-green-500/50 rounded-lg text-green-200 text-sm">
                {success}
              </div>
            )}

            {/* Forms */}
            {view === "signin" && (
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
                  required
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? "SIGNING IN..." : "SIGN IN"}
                </Button>
                <button
                  type="button"
                  onClick={() => handleViewChange("reset")}
                  className="w-full text-sm text-white/60 hover:text-white/80 transition-colors"
                >
                  Forgot your password?
                </button>
              </form>
            )}

            {view === "signup" && (
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
                  required
                />
                <Input
                  type="password"
                  placeholder="Password (min. 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
                  required
                  minLength={6}
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? "CREATING ACCOUNT..." : "SIGN UP"}
                </Button>
                <p className="text-xs text-white/50 text-center leading-relaxed">
                  By signing up, you agree to our terms and privacy policy.
                </p>
              </form>
            )}

            {view === "reset" && (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 bg-white/10 border-white/20 text-white placeholder:text-white/50 rounded-lg focus:border-blue-500 focus:ring-blue-500/20"
                  required
                />
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                >
                  {loading ? "SENDING..." : "SEND RESET EMAIL"}
                </Button>
                <p className="text-xs text-white/60 text-center">We'll send you a link to reset your password.</p>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

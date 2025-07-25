"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, LogIn, Mail, ArrowLeft } from "lucide-react"
import { useAuth } from "./auth-provider"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"main" | "email-signin" | "email-signup" | "reset">("main")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const { signIn, signInWithEmail, signUpWithEmail, resetPassword } = useAuth()

  if (!isOpen) return null

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true)
      setError("")
      await signIn()
      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google")
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await signInWithEmail(email, password)

    if (error) {
      setError(error.message)
    } else {
      onClose()
    }
    setLoading(false)
  }

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await signUpWithEmail(email, password)

    if (error) {
      setError(error.message)
    } else {
      setMessage("Check your email for the confirmation link!")
    }
    setLoading(false)
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const { error } = await resetPassword(email)

    if (error) {
      setError(error.message)
    } else {
      setMessage("Password reset email sent!")
    }
    setLoading(false)
  }

  const resetForm = () => {
    setEmail("")
    setPassword("")
    setError("")
    setMessage("")
    setLoading(false)
  }

  const goBack = () => {
    resetForm()
    setMode("main")
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-black border border-white/20">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              {mode !== "main" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                  className="text-white/60 hover:text-white hover:bg-white/10 p-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              )}
              <h2 className="text-xl font-serif text-white">
                {mode === "main" && "Sign In"}
                {mode === "email-signin" && "Sign In"}
                {mode === "email-signup" && "Sign Up"}
                {mode === "reset" && "Reset Password"}
              </h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded text-red-300 text-sm">{error}</div>
          )}

          {message && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/40 rounded text-green-300 text-sm">
              {message}
            </div>
          )}

          {mode === "main" && (
            <div className="space-y-4">
              <p className="text-gray-400 text-sm font-light">
                Sign in to save your movie discoveries and track your emotional cinema journey.
              </p>

              <Button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-white text-black hover:bg-white/90 flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                {loading ? "Signing in..." : "Continue with Google"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-black px-2 text-gray-400">or</span>
                </div>
              </div>

              <Button
                onClick={() => setMode("email-signin")}
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10 flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Sign in with Email
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Don't have an account?{" "}
                <button onClick={() => setMode("email-signup")} className="text-white hover:underline">
                  Sign up
                </button>
              </p>
            </div>
          )}

          {mode === "email-signin" && (
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-white text-black hover:bg-white/90">
                {loading ? "Signing in..." : "Sign In"}
              </Button>
              <p className="text-xs text-center">
                <button
                  type="button"
                  onClick={() => setMode("reset")}
                  className="text-gray-400 hover:text-white hover:underline"
                >
                  Forgot password?
                </button>
              </p>
            </form>
          )}

          {mode === "email-signup" && (
            <form onSubmit={handleEmailSignUp} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <div>
                <Input
                  type="password"
                  placeholder="Password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-white text-black hover:bg-white/90">
                {loading ? "Creating account..." : "Sign Up"}
              </Button>
            </form>
          )}

          {mode === "reset" && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <p className="text-gray-400 text-sm">
                Enter your email address and we'll send you a link to reset your password.
              </p>
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-white text-black hover:bg-white/90">
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          )}

          <p className="text-xs text-gray-500 text-center mt-4">
            By signing in, you agree to our terms and privacy policy.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

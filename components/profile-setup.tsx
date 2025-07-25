"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { User, MapPin, Film, Save, X } from "lucide-react"
import { useAuth, supabase } from "./auth-provider"

interface UserProfile {
  display_name: string
  location: string
  letterboxd_username: string
  bio: string
  is_public: boolean
}

interface ProfileSetupProps {
  isOpen: boolean
  onClose: () => void
  onComplete?: () => void
}

export default function ProfileSetup({ isOpen, onClose, onComplete }: ProfileSetupProps) {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile>({
    display_name: "",
    location: "",
    letterboxd_username: "",
    bio: "",
    is_public: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (user && isOpen) {
      fetchProfile()
    }
  }, [user, isOpen])

  const fetchProfile = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 is "not found" error, which is expected for new users
        console.error("Error fetching profile:", error)
        return
      }

      if (data) {
        setProfile({
          display_name: data.display_name || "",
          location: data.location || "",
          letterboxd_username: data.letterboxd_username || "",
          bio: data.bio || "",
          is_public: data.is_public ?? true,
        })
        setIsEditing(true)
      } else {
        // New user - pre-fill with available info
        const displayName =
          user.user_metadata?.name ||
          user.user_metadata?.full_name ||
          user.user_metadata?.first_name ||
          user.email?.split("@")[0] ||
          ""

        setProfile((prev) => ({
          ...prev,
          display_name: displayName,
        }))
      }
    } catch (err) {
      console.error("Error fetching profile:", err)
    }
  }

  const handleSave = async () => {
    if (!user) return
    if (!profile.display_name.trim()) {
      setError("Display name is required")
      return
    }

    setLoading(true)
    setError("")

    try {
      // Prepare the profile data - DO NOT include 'id' field
      const profileData = {
        user_id: user.id,
        display_name: profile.display_name.trim(),
        location: profile.location.trim() || null,
        letterboxd_username: profile.letterboxd_username.trim() || null,
        bio: profile.bio.trim() || null,
        is_public: profile.is_public,
      }

      console.log("Saving profile data:", profileData)

      const { error } = await supabase.from("user_profiles").upsert(profileData, {
        onConflict: "user_id",
        ignoreDuplicates: false,
      })

      if (error) {
        console.error("Supabase error:", error)
        setError(`Failed to save profile: ${error.message}`)
        return
      }

      console.log("Profile saved successfully")
      onComplete?.()
      onClose()
    } catch (err: any) {
      console.error("Unexpected error:", err)
      setError(err.message || "Failed to save profile")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md bg-black border border-white/20">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-serif text-white">{isEditing ? "Edit Profile" : "Complete Your Profile"}</h2>
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

          <div className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <User className="h-4 w-4 inline mr-2" />
                Display Name *
              </label>
              <Input
                value={profile.display_name}
                onChange={(e) => setProfile((prev) => ({ ...prev, display_name: e.target.value }))}
                placeholder="How should others see your name?"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                maxLength={50}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <MapPin className="h-4 w-4 inline mr-2" />
                Location
              </label>
              <Input
                value={profile.location}
                onChange={(e) => setProfile((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="City, Country"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                maxLength={100}
              />
            </div>

            {/* Letterboxd Username */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Film className="h-4 w-4 inline mr-2" />
                Letterboxd Username
              </label>
              <Input
                value={profile.letterboxd_username}
                onChange={(e) => setProfile((prev) => ({ ...prev, letterboxd_username: e.target.value }))}
                placeholder="Your Letterboxd username"
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                maxLength={50}
              />
              <p className="text-xs text-gray-500 mt-1">Optional: Link to your Letterboxd profile</p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">About You</label>
              <Textarea
                value={profile.bio}
                onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                placeholder="Tell others about your movie taste..."
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 resize-none"
                rows={3}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">{profile.bio.length}/200 characters</p>
            </div>

            {/* Public Profile Toggle */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-sm font-medium text-white">Public Profile</p>
                <p className="text-xs text-gray-400">Show your movie feels in the global feed</p>
              </div>
              <Switch
                checked={profile.is_public}
                onCheckedChange={(checked) => setProfile((prev) => ({ ...prev, is_public: checked }))}
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={loading || !profile.display_name.trim()}
              className="w-full bg-white text-black hover:bg-white/90 flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : isEditing ? "Update Profile" : "Create Profile"}
            </Button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Your profile helps create a community of movie lovers sharing their feelings.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

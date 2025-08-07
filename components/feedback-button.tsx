"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import FeaturebaseFeedback from "./featurebase-feedback"

interface FeedbackButtonProps {
  variant?: "floating" | "inline"
}

export default function FeedbackButton({ variant = "floating" }: FeedbackButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (variant === "inline") {
    return (
      <>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Production Notes
        </Button>
        {isModalOpen && <FeedbackModal onClose={() => setIsModalOpen(false)} />}
      </>
    )
  }

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-blue-500 hover:bg-blue-600 text-white shadow-lg rounded-full p-4"
        size="lg"
      >
        <MessageSquare className="h-5 w-5" />
      </Button>
      {isModalOpen && <FeedbackModal onClose={() => setIsModalOpen(false)} />}
    </>
  )
}

function FeedbackModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <Card className="w-full max-w-4xl max-h-[90vh] bg-gray-900 border-white/20 overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between border-b border-white/10 bg-black/50">
          <CardTitle className="text-xl font-light text-white">
            Production Notes
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0 overflow-auto max-h-[calc(90vh-80px)]">
          <FeaturebaseFeedback
            organization="your-org-name" // You need to replace this with your actual organization
            theme="dark"
            hideMenu={false}
            hideLogo={false}
          />
        </CardContent>
      </Card>
    </div>
  )
}


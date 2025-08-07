"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageSquare, X } from 'lucide-react'
import FeaturebaseFeedback from "./featurebase-feedback"

interface FeedbackButtonProps {
  variant?: "floating" | "inline"
}

export default function FeedbackButton({ variant = "inline" }: FeedbackButtonProps) {
  const [showModal, setShowModal] = useState(false)

  if (variant === "floating") {
    return (
      <>
        <Button
          onClick={() => setShowModal(true)}
          className="fixed bottom-6 right-6 z-40 bg-blue-500 hover:bg-blue-600 text-white shadow-lg rounded-full p-3"
          size="sm"
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
        
        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            />
            
            {/* Modal */}
            <div className="relative w-full max-w-4xl h-[90vh] mx-4 bg-gray-900 border border-white/20 rounded-lg overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div>
                  <h2 className="text-xl font-medium text-white">Production Notes</h2>
                  <p className="text-sm text-gray-400">Share your vision for the future</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowModal(false)}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Content */}
              <div className="p-4 h-[calc(100%-80px)]">
                <FeaturebaseFeedback 
                  organization="mudi-criterions" // Replace with your actual organization
                  theme="dark"
                  hideMenu={true}
                  hideLogo={false}
                />
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white"
      >
        <MessageSquare className="h-4 w-4 mr-2" />
        Share Feedback
      </Button>
      
      {/* Modal for inline variant */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-4xl h-[90vh] mx-4 bg-gray-900 border border-white/20 rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <div>
                <h2 className="text-xl font-medium text-white">Production Notes</h2>
                <p className="text-sm text-gray-400">Share your vision for the future</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4 h-[calc(100%-80px)]">
              <FeaturebaseFeedback 
                organization="mudi-criterions"
                theme="dark"
                hideMenu={true}
                hideLogo={false}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}


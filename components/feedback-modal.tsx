"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X } from 'lucide-react'
import FeaturebaseFeedback from "./featurebase-feedback"

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
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
            onClick={onClose}
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
  )
}

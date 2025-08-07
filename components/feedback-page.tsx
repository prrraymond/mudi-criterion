"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, ThumbsUp, Plus, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import FeaturebaseFeedback from "./featurebase-feedback"

export default function FeedbackPage() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl tracking-tight text-white">
          <span className="font-medium">Community</span>
          <span className="font-serif"> Feedback</span>
        </h1>
        <div className="h-px w-16 bg-white/30 mx-auto"></div>
        <p className="text-gray-400 font-light tracking-wide">
          Help shape the future of emotional movie discovery
        </p>
      </div>

      {/* Tabs for different feedback views */}
      <Tabs defaultValue="board" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-black/50 border border-white/20">
          <TabsTrigger 
            value="board" 
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-400"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Feedback Board
          </TabsTrigger>
          <TabsTrigger 
            value="roadmap" 
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-400"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Roadmap
          </TabsTrigger>
          <TabsTrigger 
            value="changelog" 
            className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-400"
          >
            <Clock className="h-4 w-4 mr-2" />
            Changelog
          </TabsTrigger>
        </TabsList>

        <TabsContent value="board" className="mt-6">
          <div className="bg-black/30 border border-white/10 rounded-lg p-1">
            <FeaturebaseFeedback 
              organization="mudi-criterions" // Replace with your actual organization
              theme="dark"
              hideMenu={true}
              hideLogo={false}
              path="/"
              filters=""
            />
          </div>
        </TabsContent>

        <TabsContent value="roadmap" className="mt-6">
          <div className="bg-black/30 border border-white/10 rounded-lg p-1">
            <FeaturebaseFeedback 
              organization="mudi-criterions" // Replace with your actual organization
              theme="dark"
              hideMenu={true}
              hideLogo={false}
              path="/roadmap"
              filters=""
            />
          </div>
        </TabsContent>

        <TabsContent value="changelog" className="mt-6">
          <div className="bg-black/30 border border-white/10 rounded-lg p-1">
            <FeaturebaseFeedback 
              organization="mudi-criterions" // Replace with your actual organization
              theme="dark"
              hideMenu={true}
              hideLogo={false}
              path="/changelog"
              filters=""
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        <Card className="bg-black/30 border border-white/10">
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">127</div>
            <div className="text-sm text-gray-400">Active Discussions</div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/30 border border-white/10">
          <CardContent className="p-4 text-center">
            <ThumbsUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">1,234</div>
            <div className="text-sm text-gray-400">Total Votes</div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/30 border border-white/10">
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">23</div>
            <div className="text-sm text-gray-400">Features Shipped</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button 
          className="bg-blue-500 hover:bg-blue-600 text-white"
          onClick={() => {
            // This will be handled by the embedded Featurebase widget
            const feedbackButton = document.querySelector('[data-featurebase-embed] button') as HTMLElement;
            if (feedbackButton) {
              feedbackButton.click();
            }
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Submit Feedback
        </Button>
        
        <Button 
          variant="outline" 
          className="border-white/20 text-white hover:bg-white/10 hover:text-white bg-transparent"
        >
          <TrendingUp className="h-4 w-4 mr-2" />
          View Popular Requests
        </Button>
      </div>
    </div>
  )
}

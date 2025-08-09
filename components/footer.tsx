"use client"

import { Button } from "@/components/ui/button"

interface FooterProps {
  activeTab: string
  setActiveTab: (tab: "home" | "entries" | "global" | "about" | "credits" | "terms") => void
}

export default function Footer({ activeTab, setActiveTab }: FooterProps) {
  return (
    <footer className="border-t border-white/10 bg-black/30 backdrop-blur-sm mt-auto">
      <div className="w-full px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Brand */}
          <div className="text-sm text-gray-400">
            <span className="font-medium">Mudi</span>
            <span className="font-serif"> Criterions</span>
          </div>

          {/* Center - Links */}
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("about")}
              className={`text-xs ${
                activeTab === "about" 
                  ? "text-white" 
                  : "text-gray-400 hover:text-white"
              } hover:bg-white/5 px-2 py-1 h-auto`}
            >
              About
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("credits")}
              className={`text-xs ${
                activeTab === "credits" 
                  ? "text-white" 
                  : "text-gray-400 hover:text-white"
              } hover:bg-white/5 px-2 py-1 h-auto`}
            >
              Credits
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveTab("terms")}
              className={`text-xs ${
                activeTab === "terms" 
                  ? "text-white" 
                  : "text-gray-400 hover:text-white"
              } hover:bg-white/5 px-2 py-1 h-auto`}
            >
              Terms
            </Button>
          </div>

          {/* Right side - Copyright */}
          <div className="text-xs text-gray-500">
            © 2024
          </div>
        </div>
      </div>
    </footer>
  )
}

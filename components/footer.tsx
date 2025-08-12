"use client"

interface FooterProps {
  activeTab: string
  setActiveTab: (tab: "home" | "entries" | "global" | "about" | "credits" | "terms") => void
}

export default function Footer({ activeTab, setActiveTab }: FooterProps) {
  return (
    <footer className="border-t border-white/10 bg-black/30 backdrop-blur-sm">
      <div className="w-full px-4 py-3">
        <div className="flex items-center justify-between text-xs">
          {/* Brand */}
          <div className="text-white/60">
            <span className="font-medium">Mudi</span>
            <span className="font-serif"> Criterions</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab("about")}
              className={`transition-colors hover:text-white ${activeTab === "about" ? "text-white" : "text-white/60"}`}
            >
              About
            </button>
            <button
              onClick={() => setActiveTab("credits")}
              className={`transition-colors hover:text-white ${
                activeTab === "credits" ? "text-white" : "text-white/60"
              }`}
            >
              Credits
            </button>
            <button
              onClick={() => setActiveTab("terms")}
              className={`transition-colors hover:text-white ${activeTab === "terms" ? "text-white" : "text-white/60"}`}
            >
              Terms
            </button>
          </div>

          {/* Copyright */}
          <div className="text-white/40">© 2024</div>
        </div>
      </div>
    </footer>
  )
}

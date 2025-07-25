import type React from "react"
import "./globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { AuthProvider } from "@/components/auth-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Mudi Criterions",
  description: "Find films that match your mood in a Criterion-inspired experience",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* FIX: Changed background from bg-gray-900 to a rich "Mubi-blue" (bg-blue-950) */}
      <body className={`${inter.className} bg-blue-950 text-white`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}


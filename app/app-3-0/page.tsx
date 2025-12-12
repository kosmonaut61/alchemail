"use client"

import { Button } from "@/components/ui/button"
import { Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function Alchemail30() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Application Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Branding */}
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Alchemail 3.0</h1>
                <p className="text-xs text-muted-foreground">Next-generation email sequence generator</p>
              </div>
            </div>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to 2.0
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-foreground">Coming Soon</h2>
          <p className="text-lg text-muted-foreground">Alchemail 3.0 is under development</p>
        </div>
      </main>
    </div>
  )
}


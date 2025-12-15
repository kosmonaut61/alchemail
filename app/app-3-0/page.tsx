"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { ChatKit, useChatKit } from '@openai/chatkit-react'

// ChatKit component
function ChatKitComponent() {
  const [isInitialized, setIsInitialized] = useState(false)

  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) {
          // For now, create a new session each time
          // You can implement session refresh logic here if needed
        }

        const res = await fetch('/api/chatkit/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user: `user-${Date.now()}`, // Generate a unique user ID
          }),
        })

        if (!res.ok) {
          const error = await res.json()
          throw new Error(error.error || 'Failed to create session')
        }

        const { client_secret } = await res.json()
        setIsInitialized(true)
        return client_secret
      },
    },
  })

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>AI Email Generator</CardTitle>
          <CardDescription>
            Chat with the AI to generate your email campaign. The workflow will handle all the logic behind the scenes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] w-full">
            <ChatKit control={control} className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

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
                <p className="text-xs text-muted-foreground">AI-powered email generation</p>
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

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-6">
        <ChatKitComponent />
      </main>
    </div>
  )
}

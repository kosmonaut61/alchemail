"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Settings, Mail, Filter } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { EmailOutput } from "@/components/email-output"
import { PreambleEditor } from "@/components/preamble-editor"
import { ContextSelector } from "@/components/context-selector"
import { ContextItem } from "@/lib/context-repository"

export default function EmailGenerator() {
  const [persona, setPersona] = useState<string>("")
  const [signal, setSignal] = useState("")
  const [painPoints, setPainPoints] = useState<string[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedEmail, setGeneratedEmail] = useState("")
  const [showPreambleEditor, setShowPreambleEditor] = useState(false)
  const [showContextSelector, setShowContextSelector] = useState(false)
  const [selectedContextItems, setSelectedContextItems] = useState<ContextItem[]>([])
  const [isAnalyzingContext, setIsAnalyzingContext] = useState(false)
  const { toast } = useToast()

  const handlePainPointChange = (painPoint: string, checked: boolean) => {
    if (checked) {
      setPainPoints([...painPoints, painPoint])
    } else {
      setPainPoints(painPoints.filter((p) => p !== painPoint))
    }
  }

  // Auto-analyze context when form is filled out
  const analyzeContext = async () => {
    if (!signal || !persona) return

    setIsAnalyzingContext(true)
    try {
      const response = await fetch("/api/analyze-context", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          signal,
          persona,
          painPoints,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedContextItems(data.suggestedItems)
      }
    } catch (error) {
      console.error("Error analyzing context:", error)
    } finally {
      setIsAnalyzingContext(false)
    }
  }

  // Auto-analyze context when signal or persona changes
  useEffect(() => {
    if (signal && persona) {
      const timeoutId = setTimeout(() => {
        analyzeContext()
      }, 1000) // Debounce for 1 second
      
      return () => clearTimeout(timeoutId)
    }
  }, [signal, persona, painPoints])

  const handleGenerate = async () => {
    if (!persona || !signal) {
      toast({
        title: "Missing Information",
        description: "Please select a persona and provide a signal.",
        variant: "destructive",
      })
      return
    }

    // If no context items are selected, try to analyze context first
    if (selectedContextItems.length === 0) {
      console.log("No context items selected, analyzing context first...")
      await analyzeContext()
      
      // If still no context items after analysis, show warning
      if (selectedContextItems.length === 0) {
        toast({
          title: "No Context Selected",
          description: "No context items were selected. The email will be generated with basic information only.",
          variant: "destructive",
        })
      }
    }

    setIsGenerating(true)
    try {
      console.log("[v0] Starting email generation with:", { 
        persona, 
        signal, 
        painPoints, 
        selectedContextItems: selectedContextItems.length,
        contextItems: selectedContextItems.map(item => ({ id: item.id, title: item.title }))
      })

      const response = await fetch("/api/generate-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          persona,
          signal,
          painPoints,
          contextItems: selectedContextItems,
        }),
      })

      console.log("[v0] API response status:", response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        console.log("[v0] API error:", errorData)
        throw new Error(errorData.error || "Failed to generate email")
      }

      const data = await response.json()
      console.log("[v0] Email generated successfully")
      setGeneratedEmail(data.email)

      toast({
        title: "Email Generated!",
        description: "Your email sequence has been generated successfully.",
      })
    } catch (error) {
      console.error("[v0] Error generating email:", error)
      toast({
        title: "Generation Failed",
        description:
          error instanceof Error ? error.message : "There was an error generating your email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mail className="h-8 w-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email Sequence Generator</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Generate personalized email sequences powered by AI. Configure your persona, signal, and pain points to
            create compelling outreach campaigns.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Configuration
                  </CardTitle>
                  <CardDescription>Configure your email parameters to generate targeted sequences</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowContextSelector(!showContextSelector)}>
                    <Filter className="h-4 w-4 mr-2" />
                    Context
                    {isAnalyzingContext && <Loader2 className="h-3 w-3 ml-1 animate-spin" />}
                    {selectedContextItems.length > 0 && !isAnalyzingContext && (
                      <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-1 rounded">
                        {selectedContextItems.length}
                      </span>
                    )}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowPreambleEditor(!showPreambleEditor)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Persona Selection */}
              <div className="space-y-2">
                <Label htmlFor="persona">Persona/Role</Label>
                <Select value={persona} onValueChange={setPersona}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target persona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Enterprise">Enterprise</SelectItem>
                    <SelectItem value="SMB">SMB</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Signal Input */}
              <div className="space-y-2">
                <Label htmlFor="signal">Signal</Label>
                <Textarea
                  id="signal"
                  placeholder="Describe what the email should be about..."
                  value={signal}
                  onChange={(e) => setSignal(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Pain Points */}
              <div className="space-y-3">
                <Label>Pain Points</Label>
                <div className="space-y-3">
                  {["Cost", "Effort", "Efficiency"].map((painPoint) => (
                    <div key={painPoint} className="flex items-center space-x-2">
                      <Checkbox
                        id={painPoint.toLowerCase()}
                        checked={painPoints.includes(painPoint)}
                        onCheckedChange={(checked) => handlePainPointChange(painPoint, checked as boolean)}
                      />
                      <Label
                        htmlFor={painPoint.toLowerCase()}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {painPoint}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Generate Button */}
              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full" size="lg">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Email Sequence"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Output */}
          <EmailOutput email={generatedEmail} />
        </div>

        {/* Context Selector */}
        {showContextSelector && (
          <ContextSelector
            signal={signal}
            persona={persona}
            painPoints={painPoints}
            selectedContextItems={selectedContextItems}
            onContextChange={setSelectedContextItems}
            onClose={() => setShowContextSelector(false)}
          />
        )}

        {/* Preamble Editor */}
        {showPreambleEditor && <PreambleEditor onClose={() => setShowPreambleEditor(false)} />}
      </div>
      <Toaster />
    </div>
  )
}

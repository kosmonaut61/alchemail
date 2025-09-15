"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Mail, Edit3, Eye, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { PreambleEditor } from "@/components/preamble-editor"
import { ContextSelector } from "@/components/context-selector"
import { PromptPreview } from "@/components/prompt-preview"
import { EmailOutput } from "@/components/email-output"
import { ContextItem } from "@/lib/context-repository"

export default function EmailGenerator() {
  const [currentStep, setCurrentStep] = useState(1)
  const [signal, setSignal] = useState("")
  const [persona, setPersona] = useState<string>("")
  const [painPoints, setPainPoints] = useState<string[]>([])
  const [selectedContextItems, setSelectedContextItems] = useState<ContextItem[]>([])
  const [isAnalyzingContext, setIsAnalyzingContext] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedEmail, setGeneratedEmail] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editFeedback, setEditFeedback] = useState("")
  const [showPreambleEditor, setShowPreambleEditor] = useState(false)
  const { toast } = useToast()

  const steps = [
    { id: 1, title: "Campaign Signal", description: "Describe your email campaign context" },
    { id: 2, title: "Context Review", description: "Review and customize AI-suggested context" },
    { id: 3, title: "Prompt Review", description: "Review the final ChatGPT prompt" },
    { id: 4, title: "Output & Edit", description: "View results and request edits" }
  ]

  // Auto-analyze context when signal and persona are filled
  useEffect(() => {
    if (signal && persona && currentStep >= 2) {
      analyzeContext()
    }
  }, [signal, persona, currentStep])

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
      toast({
        title: "Context Analysis Failed",
        description: "Failed to analyze context. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzingContext(false)
    }
  }

  const handlePainPointChange = (painPoint: string, checked: boolean) => {
    if (checked) {
      setPainPoints([...painPoints, painPoint])
    } else {
      setPainPoints(painPoints.filter((p) => p !== painPoint))
    }
  }

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleGenerate = async () => {
    if (!persona || !signal) {
      toast({
        title: "Missing Information",
        description: "Please complete all required fields.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
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

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || "Failed to generate email")
      }

      const data = await response.json()
      setGeneratedEmail(data.email)
      setCurrentStep(4)

      toast({
        title: "Email Generated!",
        description: "Your email sequence has been generated successfully.",
      })
    } catch (error) {
      console.error("Error generating email:", error)
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "There was an error generating your email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleEditRequest = async () => {
    if (!editFeedback.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please provide feedback for the edit request.",
        variant: "destructive",
      })
      return
    }

    setIsEditing(true)
    try {
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
          editFeedback: editFeedback,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || "Failed to edit email")
      }

      const data = await response.json()
      setGeneratedEmail(data.email)
      setEditFeedback("")

      toast({
        title: "Email Updated!",
        description: "Your email has been updated based on your feedback.",
      })
    } catch (error) {
      console.error("Error editing email:", error)
      toast({
        title: "Edit Failed",
        description: error instanceof Error ? error.message : "There was an error editing your email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsEditing(false)
    }
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return signal.trim().length > 0 && persona.length > 0
      case 2:
        return selectedContextItems.length > 0
      case 3:
        return true
      case 4:
        return true
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Mail className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Email Campaign Generator</h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Create personalized email sequences powered by AI. Follow the steps below to craft compelling outreach campaigns.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step.id 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-2 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Campaign Signal */}
        {currentStep >= 1 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                Campaign Signal
              </CardTitle>
              <CardDescription>Describe your email campaign context and target audience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signal">Campaign Signal *</Label>
                  <Textarea
                    id="signal"
                    placeholder="Describe what the email should be about... (e.g., 'Create a personalized marketing campaign for a ENT organization. The target audience is: Food & Beverages industry Enterprise...')"
                    value={signal}
                    onChange={(e) => setSignal(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="persona">Target Persona *</Label>
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

                <div className="space-y-3">
                  <Label>Pain Points (Optional)</Label>
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
              </div>

              {currentStep === 1 && (
                <div className="flex justify-end">
                  <Button 
                    onClick={handleNext} 
                    disabled={!canProceedToNext()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Next: Review Context
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Context Review */}
        {currentStep >= 2 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                Context Review
              </CardTitle>
              <CardDescription>The AI has analyzed your signal and suggested relevant context items. Review and customize the selection.</CardDescription>
            </CardHeader>
            <CardContent>
              {isAnalyzingContext ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Analyzing context...
                </div>
              ) : (
                <ContextSelector
                  signal={signal}
                  persona={persona}
                  painPoints={painPoints}
                  selectedContextItems={selectedContextItems}
                  onContextChange={setSelectedContextItems}
                  onClose={() => {}} // No close button in inline flow
                />
              )}

              {currentStep === 2 && (
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={handlePrevious}>
                    Previous
                  </Button>
                  <Button 
                    onClick={handleNext} 
                    disabled={!canProceedToNext()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Next: Review Prompt
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Prompt Review */}
        {currentStep >= 3 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                Prompt Review
              </CardTitle>
              <CardDescription>This is exactly what will be sent to ChatGPT to generate your email sequence.</CardDescription>
            </CardHeader>
            <CardContent>
              <PromptPreview
                signal={signal}
                persona={persona}
                painPoints={painPoints}
                selectedContextItems={selectedContextItems}
                onClose={() => {}} // No close button in inline flow
              />

              {currentStep === 3 && (
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={handlePrevious}>
                    Previous
                  </Button>
                  <Button 
                    onClick={handleGenerate} 
                    disabled={!canProceedToNext() || isGenerating}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Generate Email
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Output & Edit */}
        {currentStep >= 4 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                Output & Edit
              </CardTitle>
              <CardDescription>Review your generated email sequence and request edits if needed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <EmailOutput email={generatedEmail} />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="editFeedback">Request Changes (Optional)</Label>
                  <Textarea
                    id="editFeedback"
                    placeholder="Describe what you'd like to change about the email sequence..."
                    value={editFeedback}
                    onChange={(e) => setEditFeedback(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={handlePrevious}>
                    Previous
                  </Button>
                  <Button 
                    onClick={handleEditRequest} 
                    disabled={isEditing || !editFeedback.trim()}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    {isEditing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Edit3 className="mr-2 h-4 w-4" />
                        Request Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings Button */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => setShowPreambleEditor(true)}
            className="text-gray-600"
          >
            <Settings className="h-4 w-4 mr-2" />
            Advanced Settings
          </Button>
        </div>
      </div>

      {/* Preamble Editor */}
      {showPreambleEditor && (
        <PreambleEditor onClose={() => setShowPreambleEditor(false)} />
      )}

      <Toaster />
    </div>
  )
}

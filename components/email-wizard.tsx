"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, ArrowRight, Check, Loader2, Eye, Edit3, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ContextItem } from "@/lib/context-repository"
import { ContextSelector } from "@/components/context-selector"
import { PromptPreview } from "@/components/prompt-preview"
import { EmailOutput } from "@/components/email-output"

interface EmailWizardProps {
  onClose: () => void
}

export function EmailWizard({ onClose }: EmailWizardProps) {
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Describe Your Email Campaign</h3>
              <p className="text-gray-600">Provide the main context and signal for your email campaign.</p>
            </div>

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
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Review AI-Suggested Context</h3>
              <p className="text-gray-600">The AI has analyzed your signal and suggested relevant context items. Review and customize the selection.</p>
            </div>

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
                onClose={() => {}} // No close button in wizard
              />
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Review ChatGPT Prompt</h3>
              <p className="text-gray-600">This is exactly what will be sent to ChatGPT to generate your email sequence.</p>
            </div>

            <PromptPreview
              signal={signal}
              persona={persona}
              painPoints={painPoints}
              selectedContextItems={selectedContextItems}
              onClose={() => {}} // No close button in wizard
            />
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">Email Output & Editing</h3>
              <p className="text-gray-600">Review your generated email sequence and request edits if needed.</p>
            </div>

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

              <Button 
                onClick={handleEditRequest} 
                disabled={isEditing || !editFeedback.trim()}
                className="w-full"
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
        )

      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Email Campaign Generator</CardTitle>
              <CardDescription>Step {currentStep} of {steps.length}: {steps[currentStep - 1].title}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
          
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={(currentStep / steps.length) * 100} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              {steps.map((step) => (
                <div key={step.id} className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    currentStep >= step.id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.id ? <Check className="h-3 w-3" /> : step.id}
                  </div>
                  <span className="mt-1 text-center max-w-20">{step.title}</span>
                </div>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[60vh]">
          {renderStepContent()}
        </CardContent>

        <div className="border-t p-4 flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            {currentStep === 3 ? (
              <Button
                onClick={handleGenerate}
                disabled={!canProceedToNext() || isGenerating}
                className="bg-green-600 hover:bg-green-700"
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
            ) : (
              <Button
                onClick={handleNext}
                disabled={!canProceedToNext()}
              >
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Mail, ArrowRight, ArrowLeft, Loader2, Target, Users, Calendar, Sparkles, RefreshCw } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { PERSONA_DEFINITIONS } from "@/lib/personas"
import { ContextItem } from "@/lib/context-repository"

// Types for the 2.0 app
interface SequencePlan {
  emails: Array<{
    day: number
    subject: string
    purpose: string
    signalIntegration: string
  }>
  linkedInMessages: Array<{
    day: number
    purpose: string
    signalIntegration: string
  }>
  totalDays: number
}

interface GeneratedMessage {
  id: string
  type: 'email' | 'linkedin'
  day: number
  content: string
  originalContent?: string
  isOptimized?: boolean
  isGenerating?: boolean
  isOptimizing?: boolean
}

export default function AlchemailApp20() {
  const [currentStep, setCurrentStep] = useState(1)
  const [signal, setSignal] = useState("")
  const [persona, setPersona] = useState<string>("")
  const [painPoints, setPainPoints] = useState<string[]>([])
  const [selectedContextItems, setSelectedContextItems] = useState<ContextItem[]>([])
  const [allContextItems, setAllContextItems] = useState<ContextItem[]>([])
  const [emailCount, setEmailCount] = useState(3)
  const [linkedInCount, setLinkedInCount] = useState(2)
  const [sequencePlan, setSequencePlan] = useState<SequencePlan | null>(null)
  const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([])
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [isGeneratingMessages, setIsGeneratingMessages] = useState(false)
  const { toast } = useToast()

  const steps = [
    { id: 1, title: "Signal", description: "Define your outreach signal and target persona" },
    { id: 2, title: "Sequence Plan", description: "Review context and generate sequence plan" },
    { id: 3, title: "Generate", description: "Generate and optimize your sequence" }
  ]

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return signal.trim().length > 0 && persona.length > 0
      case 2:
        return sequencePlan !== null
      case 3:
        return generatedMessages.length > 0
      default:
        return false
    }
  }

  const handlePainPointChange = (painPoint: string, checked: boolean) => {
    if (checked) {
      setPainPoints([...painPoints, painPoint])
    } else {
      setPainPoints(painPoints.filter((p) => p !== painPoint))
    }
  }

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
                <h1 className="text-2xl font-bold text-foreground tracking-tight">Alchemail 2.0</h1>
                <p className="text-xs text-muted-foreground">Next-generation email sequence generator</p>
              </div>
            </div>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-8">
        {/* Welcome Message */}
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-foreground">Create Your Outreach Sequence</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Build powerful, personalized email and LinkedIn sequences that drive results. 
            Start with your signal and let AI craft the perfect outreach strategy.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-center space-x-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                currentStep >= step.id 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {step.id}
              </div>
              <div className="ml-3 text-left">
                <p className={`text-sm font-medium ${
                  currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <ArrowRight className="h-4 w-4 text-muted-foreground mx-4" />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Signal */}
        {currentStep >= 1 && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/25">1</div>
                <Target className="h-5 w-5 text-primary" />
                Signal
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Define the primary reason for your outreach and select your target persona
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signal">Signal - Primary Reason for Outreach *</Label>
                  <Textarea
                    id="signal"
                    placeholder="What's the main reason you're reaching out? (e.g., 'We just helped a similar company reduce freight costs by 18% and I think you'd benefit from the same approach...')"
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
                      {/* C-Suite Level */}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        C-Suite
                      </div>
                      <SelectItem value="ceo">CEO</SelectItem>
                      <SelectItem value="coo">COO</SelectItem>
                      <SelectItem value="cfo">CFO</SelectItem>
                      <SelectItem value="cpo">CPO (Chief Procurement Officer)</SelectItem>
                      <SelectItem value="csco">CSCO (Chief Supply Chain Officer)</SelectItem>
                      <SelectItem value="owner_founder">Owner / Founder</SelectItem>
                      
                      {/* Upper Management Level */}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">
                        Upper Management
                      </div>
                      <SelectItem value="operations_upper_management">Operations</SelectItem>
                      <SelectItem value="finance_upper_management">Finance</SelectItem>
                      
                      {/* Middle Management Level */}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">
                        Middle Management
                      </div>
                      <SelectItem value="operations_middle_management">Operations</SelectItem>
                      <SelectItem value="finance_middle_management">Finance</SelectItem>
                      
                      {/* Entry Level */}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">
                        Entry Level
                      </div>
                      <SelectItem value="operations_entry_level">Operations</SelectItem>
                      <SelectItem value="finance_entry_level">Finance</SelectItem>
                      
                      {/* Intern Level */}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">
                        Intern
                      </div>
                      <SelectItem value="operations_intern">Operations</SelectItem>
                      <SelectItem value="finance_intern">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {persona && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Pain Points (Optional)</Label>
                      {painPoints.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setPainPoints([])}
                          className="text-xs"
                        >
                          Clear All
                        </Button>
                      )}
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto border rounded-md p-4">
                      {(() => {
                        const selectedPersona = PERSONA_DEFINITIONS.find(p => p.id === persona)
                        if (!selectedPersona) return null
                        
                        return selectedPersona.painPoints.map((painPoint, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <Checkbox
                              id={`pain-point-${index}`}
                              checked={painPoints.includes(painPoint)}
                              onCheckedChange={(checked) => handlePainPointChange(painPoint, checked as boolean)}
                              className="mt-1"
                            />
                            <Label
                              htmlFor={`pain-point-${index}`}
                              className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {painPoint}
                            </Label>
                          </div>
                        ))
                      })()}
                    </div>
                    {painPoints.length > 0 && (
                      <p className="text-xs text-muted-foreground">
                        {painPoints.length} pain point{painPoints.length !== 1 ? 's' : ''} selected
                      </p>
                    )}
                  </div>
                )}
              </div>

              {currentStep === 1 && (
                <div className="flex justify-end">
                  <Button 
                    onClick={handleNext} 
                    disabled={!canProceedToNext()}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                  >
                    Next: Sequence Plan
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Sequence Plan */}
        {currentStep >= 2 && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg shadow-green-600/25">2</div>
                <Users className="h-5 w-5 text-green-600" />
                Sequence Plan
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Configure your sequence and let AI create a strategic plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="emailCount">Number of Emails</Label>
                  <Input
                    id="emailCount"
                    type="number"
                    min="1"
                    max="10"
                    value={emailCount}
                    onChange={(e) => setEmailCount(parseInt(e.target.value) || 1)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedInCount">Number of LinkedIn Messages</Label>
                  <Input
                    id="linkedInCount"
                    type="number"
                    min="0"
                    max="5"
                    value={linkedInCount}
                    onChange={(e) => setLinkedInCount(parseInt(e.target.value) || 0)}
                    className="w-full"
                  />
                </div>
              </div>

              {!sequencePlan ? (
                <div className="text-center py-8">
                  <Button 
                    onClick={async () => {
                      setIsGeneratingPlan(true)
                      try {
                        const response = await fetch('/api/generate-sequence-plan', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            signal,
                            persona,
                            painPoints,
                            emailCount,
                            linkedInCount
                          }),
                        })

                        if (!response.ok) {
                          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                          throw new Error(errorData.error || `HTTP ${response.status}: Failed to generate sequence plan`)
                        }

                        const data = await response.json()
                        setSequencePlan(data.sequencePlan)
                        
                        toast({
                          title: "Sequence Plan Generated!",
                          description: `Created ${data.sequencePlan.emails.length} emails and ${data.sequencePlan.linkedInMessages.length} LinkedIn messages.`,
                        })
                      } catch (error) {
                        console.error('Error generating sequence plan:', error)
                        toast({
                          title: "Generation Failed",
                          description: "Failed to generate sequence plan. Please try again.",
                          variant: "destructive",
                        })
                      } finally {
                        setIsGeneratingPlan(false)
                      }
                    }}
                    disabled={isGeneratingPlan}
                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25"
                  >
                    {isGeneratingPlan ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Plan...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Sequence Plan
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">Sequence Overview</h3>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Total sequence length: {sequencePlan.totalDays} days
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold">Email Sequence</h3>
                    {sequencePlan.emails.map((email, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Day {email.day}</span>
                          <span className="text-xs text-muted-foreground">Email {index + 1}</span>
                        </div>
                        <h4 className="font-medium">{email.subject}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{email.purpose}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                          <strong>Signal Integration:</strong> {email.signalIntegration}
                        </p>
                      </div>
                    ))}
                  </div>

                  {sequencePlan.linkedInMessages.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold">LinkedIn Messages</h3>
                      {sequencePlan.linkedInMessages.map((message, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Day {message.day}</span>
                            <span className="text-xs text-muted-foreground">LinkedIn {index + 1}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{message.purpose}</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                            <strong>Signal Integration:</strong> {message.signalIntegration}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handlePrevious}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={async () => {
                          setSequencePlan(null)
                          setIsGeneratingPlan(true)
                          try {
                            const response = await fetch('/api/generate-sequence-plan', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                signal,
                                persona,
                                painPoints,
                                emailCount,
                                linkedInCount
                              }),
                            })

                            if (!response.ok) {
                              const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                              throw new Error(errorData.error || `HTTP ${response.status}: Failed to generate sequence plan`)
                            }

                            const data = await response.json()
                            setSequencePlan(data.sequencePlan)
                            
                            toast({
                              title: "Sequence Plan Regenerated!",
                              description: `Created new ${data.sequencePlan.emails.length} emails and ${data.sequencePlan.linkedInMessages.length} LinkedIn messages.`,
                            })
                          } catch (error) {
                            console.error('Error regenerating sequence plan:', error)
                            toast({
                              title: "Regeneration Failed",
                              description: "Failed to regenerate sequence plan. Please try again.",
                              variant: "destructive",
                            })
                          } finally {
                            setIsGeneratingPlan(false)
                          }
                        }}
                        disabled={isGeneratingPlan}
                      >
                        <Sparkles className="mr-2 h-4 w-4" />
                        Retry
                      </Button>
                      <Button 
                        onClick={handleNext} 
                        disabled={!canProceedToNext()}
                        className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25"
                      >
                        Next: Generate
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Generate */}
        {currentStep >= 3 && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-600/25">3</div>
                <Calendar className="h-5 w-5 text-purple-600" />
                Generate
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">
                Generate your complete sequence with AI optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {generatedMessages.length === 0 ? (
                <div className="text-center py-8">
                  <Button 
                    onClick={async () => {
                      setIsGeneratingMessages(true)
                      try {
                        const response = await fetch('/api/generate-messages', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            signal,
                            persona,
                            painPoints,
                            sequencePlan
                          }),
                        })

                        if (!response.ok) {
                          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                          throw new Error(errorData.error || `HTTP ${response.status}: Failed to generate messages`)
                        }

                        const data = await response.json()
                        setGeneratedMessages(data.messages)
                        
                        toast({
                          title: "Messages Generated!",
                          description: `Created ${data.emailsGenerated} emails and ${data.linkedInGenerated} LinkedIn messages.`,
                        })
                      } catch (error) {
                        console.error('Error generating messages:', error)
                        toast({
                          title: "Generation Failed",
                          description: "Failed to generate messages. Please try again.",
                          variant: "destructive",
                        })
                      } finally {
                        setIsGeneratingMessages(false)
                      }
                    }}
                    disabled={isGeneratingMessages}
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/25"
                  >
                    {isGeneratingMessages ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Messages...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Complete Sequence
                      </>
                    )}
                  </Button>
                </div>
              ) : isGeneratingMessages ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="font-semibold mb-2">Generating Your Sequence</h3>
                    <p className="text-sm text-muted-foreground">Creating personalized messages for your outreach...</p>
                  </div>
                  
                  {sequencePlan && (
                    <>
                      {sequencePlan.emails.map((email, index) => (
                        <div key={`skeleton-email-${index}`} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-4 w-12" />
                              <Skeleton className="h-6 w-16" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-2/3" />
                          </div>
                        </div>
                      ))}
                      
                      {sequencePlan.linkedInMessages.map((message, index) => (
                        <div key={`skeleton-linkedin-${index}`} className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Skeleton className="h-4 w-12" />
                              <Skeleton className="h-6 w-20" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-4 w-3/4" />
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Generated Messages</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Previous
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          setIsGeneratingMessages(true)
                          setGeneratedMessages([])
                          try {
                            const response = await fetch('/api/generate-messages', {
                              method: 'POST',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                signal,
                                persona,
                                painPoints,
                                sequencePlan
                              }),
                            })

                            if (!response.ok) {
                              const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                              throw new Error(errorData.error || `HTTP ${response.status}: Failed to generate messages`)
                            }

                            const data = await response.json()
                            setGeneratedMessages(data.messages)
                            
                            toast({
                              title: "Messages Regenerated!",
                              description: `Created new ${data.emailsGenerated} emails and ${data.linkedInGenerated} LinkedIn messages.`,
                            })
                          } catch (error) {
                            console.error('Error regenerating messages:', error)
                            toast({
                              title: "Regeneration Failed",
                              description: "Failed to regenerate messages. Please try again.",
                              variant: "destructive",
                            })
                          } finally {
                            setIsGeneratingMessages(false)
                          }
                        }}
                        disabled={isGeneratingMessages}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate
                      </Button>
                    </div>
                  </div>

                  {generatedMessages.map((message) => (
                    <div key={message.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Day {message.day}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            message.type === 'email' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {message.type === 'email' ? 'Email' : 'LinkedIn'}
                          </span>
                          {message.isOptimized && (
                            <span className="px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                              Optimized
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant={message.isOptimized ? "default" : "outline"} 
                            size="sm"
                            onClick={async () => {
                              if (message.isOptimized) {
                                // Show original content
                                setGeneratedMessages(prev => prev.map(m => 
                                  m.id === message.id ? { 
                                    ...m, 
                                    isOptimized: false,
                                    content: m.originalContent || m.content
                                  } : m
                                ))
                                
                                toast({
                                  title: "Showing Original",
                                  description: "Now displaying the original version of this message.",
                                })
                              } else {
                                // Optimize the message
                                setGeneratedMessages(prev => prev.map(m => 
                                  m.id === message.id ? { ...m, isOptimizing: true } : m
                                ))
                                
                                try {
                                  const response = await fetch('/api/optimize-message', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                      messageId: message.id,
                                      originalContent: message.originalContent,
                                      type: message.type,
                                      signal,
                                      persona,
                                      painPoints
                                    }),
                                  })

                                  if (!response.ok) {
                                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                                    throw new Error(errorData.error || `HTTP ${response.status}: Failed to optimize message`)
                                  }

                                  const data = await response.json()
                                  
                                  setGeneratedMessages(prev => prev.map(m => 
                                    m.id === message.id ? { 
                                      ...m, 
                                      content: data.optimizedContent,
                                      isOptimized: true,
                                      isOptimizing: false
                                    } : m
                                  ))
                                  
                                  toast({
                                    title: "Message Optimized with GPT-5 Nano!",
                                    description: "Your message has been enhanced using advanced AI for better engagement.",
                                  })
                                } catch (error) {
                                  console.error('Error optimizing message:', error)
                                  setGeneratedMessages(prev => prev.map(m => 
                                    m.id === message.id ? { ...m, isOptimizing: false } : m
                                  ))
                                  toast({
                                    title: "Optimization Failed",
                                    description: "Failed to optimize message. Please try again.",
                                    variant: "destructive",
                                  })
                                }
                              }
                            }}
                            disabled={message.isOptimizing}
                          >
                            {message.isOptimizing ? (
                              <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                Optimizing...
                              </>
                            ) : message.isOptimized ? (
                              <>
                                <RefreshCw className="mr-2 h-3 w-3" />
                                Show Original
                              </>
                            ) : (
                              <>
                                <Sparkles className="mr-2 h-3 w-3" />
                                Optimize
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded-md p-3">
                        <pre className="text-sm whitespace-pre-wrap font-mono">
                          {message.content}
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>

      <Toaster />
    </div>
  )
}

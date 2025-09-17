"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Mail, Edit3, Eye, Loader2, RefreshCw } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { PreambleEditor } from "@/components/preamble-editor"
import { ContextSelector } from "@/components/context-selector"
import { PromptPreview } from "@/components/prompt-preview"
import { EmailOutput } from "@/components/email-output"
import { Skeleton } from "@/components/ui/skeleton"
import { ContextItem } from "@/lib/context-repository"
import { PERSONA_DEFINITIONS } from "@/lib/personas"

export default function EmailGenerator() {
  const [currentStep, setCurrentStep] = useState(1)
  const [signal, setSignal] = useState("")
  const [persona, setPersona] = useState<string>("")
  const [painPoints, setPainPoints] = useState<string[]>([])
  const [selectedContextItems, setSelectedContextItems] = useState<ContextItem[]>([])
  const [allContextItems, setAllContextItems] = useState<ContextItem[]>([])
  const [isAnalyzingContext, setIsAnalyzingContext] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedEmail, setGeneratedEmail] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editFeedback, setEditFeedback] = useState("")
  const [showPreambleEditor, setShowPreambleEditor] = useState(false)
  const [hasAnalyzedContext, setHasAnalyzedContext] = useState(false)
  const [qualityReport, setQualityReport] = useState<any>(null)
  const [fixesApplied, setFixesApplied] = useState<string[]>([])
  const [originalEmail, setOriginalEmail] = useState<string>("")
  const [selectedModel, setSelectedModel] = useState<string>("gpt-5")
  const { toast } = useToast()

  const steps = [
    { id: 1, title: "Campaign Signal", description: "Describe your email campaign context" },
    { id: 2, title: "Context Review", description: "Review and customize AI-suggested context" },
    { id: 3, title: "Prompt Review", description: "Review the final ChatGPT prompt" },
    { id: 4, title: "Output & Edit", description: "View results and request edits" }
  ]

  // Auto-analyze context when signal and persona are filled
  useEffect(() => {
    if (signal && persona && currentStep >= 2 && !hasAnalyzedContext && !isAnalyzingContext) {
      analyzeContext()
    }
  }, [signal, persona, painPoints, currentStep, hasAnalyzedContext, isAnalyzingContext])

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
        setAllContextItems(data.allItems)
        setHasAnalyzedContext(true)
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


  const autoDetectPainPoints = (signalText: string, selectedPersona: string) => {
    const selectedPersonaData = PERSONA_DEFINITIONS.find(p => p.id === selectedPersona)
    if (!selectedPersonaData) return

    const signalLower = signalText.toLowerCase()
    const detectedPainPoints: string[] = []

    // Define keyword mappings for different pain point categories
    const keywordMappings: { [key: string]: string[] } = {
      // Strategic keywords
      'strategic': ['strategy', 'strategic', 'vision', 'growth', 'expansion', 'scaling', 'transformation', 'digital transformation', 'long-term', 'short-term'],
      'cost': ['cost', 'costs', 'budget', 'savings', 'spend', 'money', 'price', 'expensive', 'cheap', 'affordable', 'roi', 'investment'],
      'efficiency': ['efficiency', 'efficient', 'streamline', 'optimize', 'automation', 'process', 'workflow', 'productivity', 'faster', 'speed'],
      'risk': ['risk', 'risks', 'compliance', 'regulatory', 'audit', 'security', 'cybersecurity', 'fraud', 'disruption', 'crisis'],
      'data': ['data', 'analytics', 'insights', 'reporting', 'visibility', 'dashboard', 'metrics', 'kpi', 'real-time', 'integration'],
      'technology': ['technology', 'tech', 'digital', 'ai', 'automation', 'software', 'system', 'platform', 'tools', 'solutions'],
      'talent': ['talent', 'team', 'staff', 'people', 'hiring', 'retention', 'training', 'skills', 'leadership', 'culture'],
      'customer': ['customer', 'client', 'experience', 'service', 'quality', 'satisfaction', 'expectations', 'demand'],
      'supply': ['supply chain', 'logistics', 'procurement', 'carrier', 'supplier', 'vendor', 'shipping', 'transport', 'freight'],
      'financial': ['financial', 'finance', 'cash flow', 'liquidity', 'forecasting', 'capital', 'investment', 'profitability'],
      'operational': ['operational', 'operations', 'process', 'workflow', 'execution', 'performance', 'standardization'],
      'external': ['market', 'competition', 'economic', 'inflation', 'geopolitical', 'sustainability', 'environmental']
    }

    // Check each pain point against the signal
    selectedPersonaData.painPoints.forEach(painPoint => {
      const painPointLower = painPoint.toLowerCase()
      
      // Check for direct keyword matches
      for (const [category, keywords] of Object.entries(keywordMappings)) {
        if (keywords.some(keyword => signalLower.includes(keyword) && painPointLower.includes(category))) {
          detectedPainPoints.push(painPoint)
          break
        }
      }
      
      // Check for specific pain point keywords
      const specificKeywords = [
        'manual', 'automation', 'integration', 'visibility', 'real-time', 'forecasting',
        'volatility', 'disruption', 'compliance', 'audit', 'talent', 'retention',
        'cost', 'savings', 'efficiency', 'streamline', 'process', 'workflow',
        'customer', 'experience', 'service', 'quality', 'demand', 'capacity',
        'supply chain', 'logistics', 'procurement', 'carrier', 'supplier',
        'financial', 'budget', 'cash flow', 'investment', 'roi', 'profitability',
        'risk', 'security', 'compliance', 'regulatory', 'governance',
        'data', 'analytics', 'insights', 'reporting', 'dashboard', 'metrics',
        'technology', 'digital', 'ai', 'automation', 'software', 'platform',
        'leadership', 'team', 'culture', 'change', 'transformation',
        'market', 'competition', 'economic', 'inflation', 'sustainability'
      ]
      
      if (specificKeywords.some(keyword => 
        signalLower.includes(keyword) && painPointLower.includes(keyword)
      )) {
        if (!detectedPainPoints.includes(painPoint)) {
          detectedPainPoints.push(painPoint)
        }
      }
    })

    // Limit to top 5 most relevant pain points to avoid overwhelming the user
    setPainPoints(detectedPainPoints.slice(0, 5))
  }

  const handlePainPointChange = (painPoint: string, checked: boolean) => {
    if (checked) {
      setPainPoints([...painPoints, painPoint])
    } else {
      setPainPoints(painPoints.filter((p) => p !== painPoint))
    }
    // Reset analysis flag when pain points change
    setHasAnalyzedContext(false)
  }

  const handleSignalChange = (newSignal: string) => {
    setSignal(newSignal)
    // Reset analysis flag when signal changes
    setHasAnalyzedContext(false)
    
    // Auto-detect relevant pain points based on signal content
    if (persona && newSignal.trim()) {
      autoDetectPainPoints(newSignal, persona)
    }
  }

  const handlePersonaChange = (newPersona: string) => {
    setPersona(newPersona)
    // Reset analysis flag when persona changes
    setHasAnalyzedContext(false)
    
    // Auto-detect relevant pain points based on signal content
    if (signal.trim() && newPersona) {
      autoDetectPainPoints(signal, newPersona)
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
    setQualityReport(null)
    setFixesApplied([])
    setOriginalEmail("")
    
    try {

      const response = await fetch("/api/generate-email-enhanced", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          persona,
          signal,
          painPoints,
          contextItems: selectedContextItems,
          enableQA: true,
          model: selectedModel
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || "Failed to generate email")
      }


      const data = await response.json()
      

      setGeneratedEmail(data.email)
      setQualityReport(data.qualityReport)
      setFixesApplied(data.fixesApplied || [])
      setOriginalEmail(data.originalEmail || "")
      setCurrentStep(4)

      // Show success message with quality info
      let qualityMessage = 'Your email sequence has been generated successfully.'
      
      if (data.qualityReport) {
        if (data.optimized && data.fixesApplied) {
          qualityMessage = `Quality Score: ${data.qualityReport.score}/100 (${data.fixesApplied.length} improvements applied automatically)`
        } else {
          qualityMessage = `Quality Score: ${data.qualityReport.score}/100 (meets all standards)`
        }
      }

      toast({
        title: "Email Generated!",
        description: qualityMessage,
      })

      // Generation completed successfully

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
              <h1 className="text-2xl font-bold text-foreground tracking-tight">Alchemail</h1>
            </div>
            
            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowPreambleEditor(true)}
                className="border-border/50 bg-card/50 hover:bg-card text-muted-foreground hover:text-foreground"
              >
                <Settings className="h-4 w-4 mr-2" />
                Advanced Settings
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-8">
        {/* Welcome Message */}
        <div className="text-center space-y-4">
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Create personalized email sequences powered by AI. Follow the steps below to craft compelling outreach campaigns.
          </p>
        </div>

        {/* Step 1: Campaign Signal */}
        {currentStep >= 1 && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center text-sm font-bold shadow-lg shadow-primary/25">1</div>
                Campaign Signal
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">Describe your email campaign context and target audience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signal">Campaign Signal *</Label>
                  <Textarea
                    id="signal"
                    placeholder="Describe what the email should be about... (e.g., 'Create a personalized marketing campaign for a ENT organization. The target audience is: Food & Beverages industry Enterprise...')"
                    value={signal}
                    onChange={(e) => handleSignalChange(e.target.value)}
                    rows={6}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="persona">Target Persona *</Label>
                  <Select value={persona} onValueChange={handlePersonaChange}>
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
                        {painPoints.length} pain point{painPoints.length !== 1 ? 's' : ''} selected based on your signal
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
                    Next: Review Context
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 2: Context Review */}
        {currentStep >= 2 && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg shadow-green-600/25">2</div>
                Context Review
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">The AI has analyzed your signal and suggested relevant context items. Review and customize the selection.</CardDescription>
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
                  allContextItems={allContextItems}
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
                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-600/25"
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
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-purple-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-600/25">3</div>
                Prompt Review
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">This is exactly what will be sent to ChatGPT to generate your email sequence.</CardDescription>
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
                <div className="mt-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <Label htmlFor="model-select" className="text-sm font-medium">
                      AI Model:
                    </Label>
                    <Select value={selectedModel} onValueChange={setSelectedModel}>
                      <SelectTrigger id="model-select" className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gpt-5">GPT-5 (Latest & Most Capable)</SelectItem>
                        <SelectItem value="gpt-5-mini">GPT-5 Mini (Balanced)</SelectItem>
                        <SelectItem value="gpt-5-nano">GPT-5 Nano (Fastest)</SelectItem>
                        <SelectItem value="gpt-4.1">GPT-4.1 (Enhanced)</SelectItem>
                        <SelectItem value="gpt-4.1-mini">GPT-4.1 Mini (Fast & Cheap)</SelectItem>
                        <SelectItem value="gpt-4.1-nano">GPT-4.1 Nano (Ultra Fast)</SelectItem>
                        <SelectItem value="gpt-4o">GPT-4o (Recommended)</SelectItem>
                        <SelectItem value="gpt-4o-mini">GPT-4o Mini (Faster)</SelectItem>
                        <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                        <SelectItem value="o1-pro">O1 Pro (Reasoning)</SelectItem>
                        <SelectItem value="o1-mini">O1 Mini (Fast Reasoning)</SelectItem>
                        <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" onClick={handlePrevious}>
                      Previous
                    </Button>
                    <Button 
                      onClick={handleGenerate} 
                      disabled={!canProceedToNext() || isGenerating}
                      className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/25"
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
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Skeleton UI for Step 4 when generating */}
        {isGenerating && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg shadow-orange-600/25">4</div>
                Output & Edit
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">Generating your personalized email sequence...</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Email skeleton */}
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
                <Skeleton className="h-8 w-1/3" />
              </div>
              
              {/* LinkedIn message skeleton */}
              <div className="space-y-3 pt-4 border-t">
                <Skeleton className="h-5 w-1/2" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
              
              {/* Quality score skeleton */}
              <div className="space-y-3 pt-4 border-t">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Output & Edit */}
        {currentStep >= 4 && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg shadow-orange-600/25">4</div>
                Output & Edit
              </CardTitle>
              <CardDescription className="text-base text-muted-foreground">Review your generated email sequence and request edits if needed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <EmailOutput 
                email={generatedEmail}
                originalEmail={originalEmail}
                qualityReport={qualityReport}
                optimized={qualityReport ? !qualityReport.passed : false}
                fixesApplied={fixesApplied}
              />

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
                    className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25"
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

      </main>

      {/* Preamble Editor */}
      {showPreambleEditor && (
        <PreambleEditor onClose={() => setShowPreambleEditor(false)} />
      )}

      <Toaster />
    </div>
  )
}

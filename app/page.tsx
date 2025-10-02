"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, ArrowRight, ArrowLeft, Loader2, Target, Users, Calendar, Sparkles, RefreshCw, X, Eye, Plus, Search, Copy } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { HelpModal } from "@/components/help-modal"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { PERSONA_DEFINITIONS } from "@/lib/personas"
import { ContextItem, CONTEXT_REPOSITORY } from "@/lib/context-repository"

// Types for the 2.0 app
interface SequencePlan {
  isIncentivized?: boolean
  incentiveAmount?: number
  linkedInConnectionRequest?: {
    daysLater: number
    purpose: string
  }
  emails: Array<{
    daysLater: number
    subject: string
    purpose: string
    signalIntegration: string
    includeIncentive?: boolean
    messageOutline?: {
      assignedContext?: string
    }
  }>
  linkedInMessages: Array<{
    daysLater: number
    purpose: string
    signalIntegration: string
    includeIncentive?: boolean
    messageOutline?: {
      assignedContext?: string
    }
  }>
  totalDays: number
}

interface GeneratedMessage {
  id: string
  type: 'email' | 'linkedin'
  daysLater: number
  content: string
  originalContent?: string
  isOptimized?: boolean
  isGenerating?: boolean
  isOptimizing?: boolean
  isRefinalizing?: boolean
}

export default function AlchemailApp20() {
  const [currentStep, setCurrentStep] = useState(1)

  // Auto-optimize all messages function
  const autoOptimizeAllMessages = async (messages: any[], signal: string, persona: string, painPoints: string[], contextItems: any[]) => {
    const unoptimizedMessages = messages.filter(m => !m.isOptimized && !m.isOptimizing)
    
    if (unoptimizedMessages.length === 0) {
      return
    }

    console.log(`🚀 Auto-optimizing ${unoptimizedMessages.length} messages...`)

    // Set all unoptimized messages to optimizing state
    setGeneratedMessages(prev => prev.map(m => 
      !m.isOptimized && !m.isOptimizing ? { ...m, isOptimizing: true } : m
    ))

    let successCount = 0
    let failureCount = 0

    // Optimize each message individually with delays to prevent rate limiting
    const optimizationPromises = unoptimizedMessages.map(async (message, index) => {
      // Add a small delay between requests to prevent overwhelming the server
      if (index > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * index))
      }
      try {
        const response = await fetch('/api/optimize-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messageId: message.id,
            originalContent: message.content,
            type: message.type,
            signal,
            persona,
            painPoints,
            contextItems
          }),
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to optimize message`)
        }

        const data = await response.json()
        
        // Update the message with optimized content
        setGeneratedMessages(prev => prev.map(m => 
          m.id === message.id ? {
            ...m,
            content: data.optimizedContent,
            originalContent: message.content,
            isOptimized: true,
            isOptimizing: false
          } : m
        ))

        successCount++
      } catch (error) {
        console.error(`Error auto-optimizing message ${message.id}:`, error)
        failureCount++
        
        // Reset optimizing state on failure
        setGeneratedMessages(prev => prev.map(m => 
          m.id === message.id ? { ...m, isOptimizing: false } : m
        ))
      }
    })

    // Wait for all optimizations to complete
    await Promise.all(optimizationPromises)

    // Show final toast
    if (failureCount === 0) {
      toast({
        title: "Auto-optimization complete!",
        description: `Successfully optimized ${successCount} messages.`,
      })
    } else if (successCount > 0) {
      toast({
        title: "Auto-optimization completed with some issues",
        description: `Optimized ${successCount} messages successfully, ${failureCount} failed.`,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Auto-optimization failed",
        description: "Failed to optimize any messages. You can try the Optimize All button manually.",
        variant: "destructive",
      })
    }
  }
  const [signal, setSignal] = useState("")
  const [persona, setPersona] = useState<string>("")
  const [painPoints, setPainPoints] = useState<string[]>([])
  const [selectedContextItems, setSelectedContextItems] = useState<ContextItem[]>([])
  const [allContextItems, setAllContextItems] = useState<ContextItem[]>([])

  // Auto-select context items when persona changes
  const handlePersonaChange = (newPersona: string) => {
    setPersona(newPersona)
    
    // Auto-select relevant context items for this persona
    const personaData = PERSONA_DEFINITIONS.find(p => p.id === newPersona)
    if (personaData) {
      // Find pain point and tone profile context items that match this persona
      const relevantContextItems = allContextItems.filter(item => {
        // Check if this context item is relevant to the persona
        if (item.persona && item.persona.includes(newPersona)) {
          return true
        }
        
        // Check if this is a pain point or tone profile context item
        if (item.category === 'pain_points' || item.category === 'language_style') {
          return true
        }
        
        return false
      })
      
      // Add these items to selected context items (without duplicates)
      setSelectedContextItems(prev => {
        const existingIds = new Set(prev.map(item => item.id))
        const newItems = relevantContextItems.filter(item => !existingIds.has(item.id))
        return [...prev, ...newItems]
      })
    }
  }
  const [emailCount, setEmailCount] = useState(8)
  const [linkedInCount, setLinkedInCount] = useState(0)
  const [isIncentivized, setIsIncentivized] = useState(true)
  const [incentiveAmount, setIncentiveAmount] = useState(500)
  const [sequencePlan, setSequencePlan] = useState<SequencePlan | null>(null)
  const [contextItems, setContextItems] = useState<any[]>([])
  const [generatedMessages, setGeneratedMessages] = useState<GeneratedMessage[]>([])
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false)
  const [isGeneratingMessages, setIsGeneratingMessages] = useState(false)
  const [isContextBrowserOpen, setIsContextBrowserOpen] = useState(false)
  const [contextSearchTerm, setContextSearchTerm] = useState("")
  
  // Campaign step state
  const [campaignFeedback, setCampaignFeedback] = useState("")
  const [isAnalyzingCampaign, setIsAnalyzingCampaign] = useState(false)
  const [isFinalizingCampaign, setIsFinalizingCampaign] = useState(false)
  const [campaignPlan, setCampaignPlan] = useState(null)
  const [finalizedMessages, setFinalizedMessages] = useState<GeneratedMessage[]>([])
  
  const { toast } = useToast()

  const steps = [
    { id: 1, title: "Signal", description: "Define your outreach signal and target persona" },
    { id: 2, title: "Sequence Plan", description: "Review context and generate sequence plan" },
    { id: 3, title: "Generate", description: "Generate and optimize your sequence" },
    { id: 4, title: "Campaign", description: "Finalize campaign with feedback and coherence" }
  ]

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1 && currentStep < 4) { // Can't go back from Campaign step
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
      case 4:
        return false // Campaign step is final
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

  const handleContextItemChange = (contextItem: ContextItem, checked: boolean) => {
    if (checked) {
      setSelectedContextItems([...selectedContextItems, contextItem])
    } else {
      setSelectedContextItems(selectedContextItems.filter((item) => item.id !== contextItem.id))
    }
  }

  const selectAllContextItems = () => {
    setSelectedContextItems([...allContextItems])
  }

  // Auto-detect relevant context items based on signal text and selected persona
  const autoDetectContextItems = (signalText: string, selectedPersona: string) => {
    if (!signalText) return []
    
    const signalLower = signalText.toLowerCase()
    const relevantItems: ContextItem[] = []
    
    // Extract keywords from signal
    const keywords = signalLower.split(/\s+/).filter(word => word.length > 3)
    
    // Industry keywords
    const industryKeywords = ['retail', 'food', 'beverage', 'automotive', 'logistics', 'manufacturing', 'ecommerce', 'grocery']
    
    // Company name keywords
    const companyKeywords = ['dollar tree', 'golden state foods', 'pepsi', 'molson coors', 'frito lay', 'honda', 'bridgestone']
    
    // Find matching context items
    CONTEXT_REPOSITORY.forEach(item => {
      // For persona-specific items, only include if they match the selected persona
      if (item.category === 'pain_points' || item.category === 'language_style') {
        if (item.persona?.includes(selectedPersona)) {
          relevantItems.push(item)
        }
        return // Skip keyword matching for persona-specific items
      }
      
      // Check if signal contains industry keywords
      const hasIndustryMatch = industryKeywords.some(keyword => 
        signalLower.includes(keyword) && 
        (item.industry?.some(industry => industry.includes(keyword) || industry.includes(keyword.replace(' ', '_'))) || 
         item.keywords?.some(itemKeyword => itemKeyword.toLowerCase().includes(keyword)))
      )
      
      // Check if signal contains company keywords
      const hasCompanyMatch = companyKeywords.some(company => 
        signalLower.includes(company) && 
        (item.content.toLowerCase().includes(company) || 
         item.title.toLowerCase().includes(company))
      )
      
      // Check if signal contains general keywords
      const hasKeywordMatch = keywords.some(keyword => 
        item.keywords?.some(itemKeyword => itemKeyword.toLowerCase().includes(keyword)) ||
        item.content.toLowerCase().includes(keyword) ||
        item.title.toLowerCase().includes(keyword)
      )
      
      if (hasIndustryMatch || hasCompanyMatch || hasKeywordMatch) {
        relevantItems.push(item)
      }
    })
    
    // Remove duplicates and return all matching items
    const uniqueItems = relevantItems.filter((item, index, self) => 
      index === self.findIndex(t => t.id === item.id)
    )
    
    return uniqueItems
  }

  // Get the selected persona data
  const selectedPersona = PERSONA_DEFINITIONS.find(p => p.id === persona)

  // Get color for context item categories
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'customer':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700'
      case 'resource':
        return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700'
      case 'statistic':
        return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700'
      case 'quote':
        return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-200 dark:border-orange-700'
      case 'value_prop':
        return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900 dark:text-pink-200 dark:border-pink-700'
      case 'language_style':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900 dark:text-cyan-200 dark:border-cyan-700'
      case 'pain_points':
        return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700'
    }
  }

  // Get context items by category
  const getContextItemsByCategory = (category: string) => {
    return CONTEXT_REPOSITORY.filter(item => item.category === category)
  }

  // Get all unique categories
  const getAllCategories = () => {
    const categories = [...new Set(CONTEXT_REPOSITORY.map(item => item.category))]
    return categories.sort()
  }

  // Auto-detect pain points based on signal text
  const autoDetectPainPoints = (signalText: string, personaData: any) => {
    if (!signalText || !personaData?.painPoints) return []
    
    const detectedPoints: string[] = []
    const signalLower = signalText.toLowerCase()
    
    personaData.painPoints.forEach((painPoint: string) => {
      const painPointLower = painPoint.toLowerCase()
      // Check if any key words from pain point appear in signal
      const keyWords = painPointLower.split(/[:\s,]+/).filter(word => word.length > 3)
      const hasMatch = keyWords.some(word => signalLower.includes(word))
      
      if (hasMatch) {
        detectedPoints.push(painPoint)
      }
    })
    
    return detectedPoints
  }

  // Random pain point selector
  const selectRandomPainPoints = () => {
    if (!selectedPersona?.painPoints) return
    
    const shuffled = [...selectedPersona.painPoints].sort(() => 0.5 - Math.random())
    const randomSelection = shuffled.slice(0, 5)
    setPainPoints(randomSelection)
  }

  // Auto-detect pain points when signal or persona changes
  useEffect(() => {
    if (signal && selectedPersona) {
      const detectedPoints = autoDetectPainPoints(signal, selectedPersona)
      if (detectedPoints.length > 0) {
        setPainPoints(detectedPoints)
      }
    }
  }, [signal, selectedPersona])

  // Populate all context items on component mount
  useEffect(() => {
    setAllContextItems(CONTEXT_REPOSITORY)
  }, [])

  // Auto-detect relevant context items when signal or persona changes
  useEffect(() => {
    if (signal && persona) {
      const detectedContextItems = autoDetectContextItems(signal, persona)
      if (detectedContextItems.length > 0) {
        setSelectedContextItems(detectedContextItems)
      }
    }
  }, [signal, persona])

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
              <HelpModal />
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 space-y-8">

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
                      <SelectItem value="president">President</SelectItem>
                      <SelectItem value="coo">COO</SelectItem>
                      <SelectItem value="cfo">CFO</SelectItem>
                      <SelectItem value="csco">CSCO (Chief Supply Chain Officer)</SelectItem>
                      
                      {/* Operations Department */}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">
                        Operations
                      </div>
                      <SelectItem value="operations_management">Operations Management</SelectItem>
                      <SelectItem value="operations_entry_level">Operations Entry Level</SelectItem>
                      <SelectItem value="operations_intern">Operations Intern</SelectItem>
                      
                      {/* Finance Department */}
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-2">
                        Finance
                      </div>
                      <SelectItem value="finance_management">Finance Management</SelectItem>
                      <SelectItem value="finance_entry_level">Finance Entry Level</SelectItem>
                      <SelectItem value="finance_intern">Finance Intern</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {persona && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Pain Points (Optional)</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={selectRandomPainPoints}
                          className="text-xs"
                          disabled={!selectedPersona}
                        >
                          Random 5
                        </Button>
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
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto border rounded-md p-4">
                      {(() => {
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

                {/* Context Items Selection */}
                {persona && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Context Items (Optional)</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={selectAllContextItems}
                          className="text-xs"
                          disabled={!allContextItems.length}
                        >
                          Select All
                        </Button>
                        {selectedContextItems.length > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedContextItems([])}
                            className="text-xs"
                          >
                            Clear All
                          </Button>
                        )}
                        <Sheet open={isContextBrowserOpen} onOpenChange={setIsContextBrowserOpen}>
                          <SheetTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Browse All
                            </Button>
                          </SheetTrigger>
                          <SheetContent className="w-[800px] sm:max-w-[800px] p-6">
                            <SheetHeader className="pb-8">
                              <SheetTitle className="text-xl">Context Repository</SheetTitle>
                            </SheetHeader>
                            <div className="mt-4">
                              <Tabs defaultValue="customer" className="w-full">
                                <TabsList className="grid w-full grid-cols-7 mb-8 h-10">
                                  {getAllCategories().map((category) => (
                                    <TabsTrigger 
                                      key={category} 
                                      value={category}
                                      className="text-sm px-4 py-2"
                                    >
                                      {category === 'language_style' ? 'Style' : category.replace('_', ' ')}
                                    </TabsTrigger>
                                  ))}
                                </TabsList>
                                {getAllCategories().map((category) => (
                                  <TabsContent key={category} value={category} className="mt-0">
                                    <div className="space-y-6 max-h-[65vh] overflow-y-auto pr-4">
                                      {getContextItemsByCategory(category).map((item, index) => {
                                        const isSelected = selectedContextItems.some(selectedItem => selectedItem.id === item.id)
                                        
                                        return (
                                          <div 
                                            key={index} 
                                            className={`p-6 rounded-xl border ${getCategoryColor(category)} shadow-sm`}
                                          >
                                            <div className="flex items-start justify-between mb-4">
                                              <h4 className="font-semibold text-base leading-tight pr-4">{item.title}</h4>
                                              <span className="text-xs opacity-75 ml-2 flex-shrink-0 bg-white/20 dark:bg-black/20 px-2 py-1 rounded-full">
                                                {item.category === 'language_style' ? 'style' : item.category}
                                              </span>
                                            </div>
                                            <p className="text-sm mb-4 leading-relaxed">{item.content}</p>
                                            {item.industry && item.industry.length > 0 && (
                                              <div className="mb-4">
                                                <p className="text-xs opacity-75 mb-2 font-medium">
                                                  Industries:
                                                </p>
                                                <p className="text-xs opacity-75">
                                                  {item.industry.join(', ')}
                                                </p>
                                              </div>
                                            )}
                                            {item.keywords && item.keywords.length > 0 && (
                                              <div className="mb-4">
                                                <p className="text-xs opacity-75 mb-3 font-medium">
                                                  Keywords:
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                  {item.keywords.slice(0, 5).map((keyword, idx) => (
                                                    <span 
                                                      key={idx} 
                                                      className="text-xs px-3 py-1.5 rounded-full bg-white/30 dark:bg-black/30 font-medium"
                                                    >
                                                      {keyword}
                                                    </span>
                                                  ))}
                                                  {item.keywords.length > 5 && (
                                                    <span className="text-xs px-3 py-1.5 rounded-full bg-white/30 dark:bg-black/30 font-medium">
                                                      +{item.keywords.length - 5} more
                                                    </span>
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                            
                                            {/* Action Buttons */}
                                            <div className="flex items-center justify-between pt-4 border-t border-white/20 dark:border-black/20">
                                              <div className="flex items-center gap-2">
                                                {isSelected ? (
                                                  <span className="text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    Selected
                                                  </span>
                                                ) : (
                                                  <span className="text-xs text-muted-foreground">
                                                    Not selected
                                                  </span>
                                                )}
                                              </div>
                                              <div className="flex gap-2">
                                                {isSelected ? (
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                      setSelectedContextItems(prev => prev.filter(selectedItem => selectedItem.id !== item.id))
                                                      toast({
                                                        title: "Removed from Selection",
                                                        description: `${item.title} has been removed from your selection.`,
                                                      })
                                                    }}
                                                    className="text-xs h-8 px-3"
                                                  >
                                                    <X className="h-3 w-3 mr-1" />
                                                    Remove
                                                  </Button>
                                                ) : (
                                                  <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => {
                                                      setSelectedContextItems(prev => [...prev, item])
                                                      toast({
                                                        title: "Added to Selection",
                                                        description: `${item.title} has been added to your selection.`,
                                                      })
                                                    }}
                                                    className="text-xs h-8 px-3"
                                                  >
                                                    <Plus className="h-3 w-3 mr-1" />
                                                    Add to Selection
                                                  </Button>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </TabsContent>
                                ))}
                              </Tabs>
                            </div>
                          </SheetContent>
                        </Sheet>
                      </div>
                    </div>
                    
                    {/* Search Box */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search context items..."
                        value={contextSearchTerm}
                        onChange={(e) => setContextSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <div className="space-y-3 max-h-60 overflow-y-auto border rounded-md p-4">
                      {allContextItems.length === 0 && (
                        <p className="text-sm text-muted-foreground">Loading context items...</p>
                      )}
                      {allContextItems.length > 0 && allContextItems.filter(item => 
                        contextSearchTerm === "" || 
                        item.title.toLowerCase().includes(contextSearchTerm.toLowerCase()) ||
                        item.content.toLowerCase().includes(contextSearchTerm.toLowerCase())
                      ).length === 0 && (
                        <p className="text-sm text-muted-foreground">No context items found matching "{contextSearchTerm}"</p>
                      )}
                      {allContextItems
                        .filter(item => 
                          contextSearchTerm === "" || 
                          item.title.toLowerCase().includes(contextSearchTerm.toLowerCase()) ||
                          item.content.toLowerCase().includes(contextSearchTerm.toLowerCase())
                        )
                        .map((item) => (
                        <div key={item.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={`context-${item.id}`}
                            checked={selectedContextItems.some(selected => selected.id === item.id)}
                            onCheckedChange={(checked) => handleContextItemChange(item, checked as boolean)}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <Label
                              htmlFor={`context-${item.id}`}
                              className="text-sm font-medium leading-relaxed peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {item.title}
                            </Label>
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.content.length > 100 ? `${item.content.substring(0, 100)}...` : item.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {selectedContextItems.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground">
                          {selectedContextItems.length} context item{selectedContextItems.length !== 1 ? 's' : ''} selected
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedContextItems.map((item, index) => (
                            <div
                              key={index}
                              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm ${getCategoryColor(item.category)}`}
                            >
                              <span className="font-medium truncate max-w-[200px]" title={item.title}>
                                {item.title}
                              </span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedContextItems(prev => prev.filter((_, i) => i !== index))
                                  toast({
                                    title: "Context Item Removed",
                                    description: `${item.title} has been removed from your selection.`,
                                  })
                                }}
                                className="h-4 w-4 p-0 hover:bg-red-200 dark:hover:bg-red-800 rounded-full"
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
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

              {/* Incentivized Campaign Toggle */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="incentivized"
                    checked={isIncentivized}
                    onCheckedChange={(checked) => setIsIncentivized(checked as boolean)}
                  />
                <Label htmlFor="incentivized" className="text-sm font-medium">
                  Compensation Campaign
                </Label>
                </div>
                {isIncentivized && (
                  <div className="space-y-2">
                    <Label htmlFor="incentiveAmount" className="text-sm">
                      Compensation Amount ($)
                    </Label>
                    <Input
                      id="incentiveAmount"
                      type="number"
                      min="50"
                      max="1000"
                      step="50"
                      value={incentiveAmount}
                      onChange={(e) => setIncentiveAmount(parseInt(e.target.value) || 500)}
                      className="w-32"
                    />
                    <p className="text-xs text-muted-foreground">
                      50% of messages will mention the gift card incentive for demo bookings
                    </p>
                  </div>
                )}
              </div>

              {!sequencePlan ? (
                <div className="text-center py-8">
                  <Button 
                    onClick={async () => {
                      setIsGeneratingPlan(true)
                      
                      // Log API call details to browser console
                      const requestPayload = {
                        signal,
                        persona,
                        painPoints,
                        emailCount,
                        linkedInCount,
                        contextItems: selectedContextItems,
                        isIncentivized,
                        incentiveAmount
                      }
                      console.log('🚀 CLIENT: Making API call to generate-sequence-plan')
                      console.log('📧 MODEL: gpt-5-mini')
                      console.log('📝 REQUEST PAYLOAD:', requestPayload)
                      console.log('⏰ TIMESTAMP:', new Date().toISOString())
                      
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
                            linkedInCount,
                            contextItems: selectedContextItems,
                            isIncentivized,
                            incentiveAmount
                          }),
                        })

                        if (!response.ok) {
                          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                          throw new Error(errorData.error || `HTTP ${response.status}: Failed to generate sequence plan`)
                        }

                        const data = await response.json()
                        
                        // Log response details to browser console
                        console.log('✅ CLIENT: Received response from generate-sequence-plan')
                        console.log('📧 MODEL: gpt-5-mini')
                        console.log('📊 RESPONSE DATA:', data)
                        console.log('📏 SEQUENCE PLAN:', data.sequencePlan)
                        console.log('🎯 CONTEXT ITEMS:', data.contextItems)
                        console.log('⏰ RESPONSE TIMESTAMP:', new Date().toISOString())
                        
                        setSequencePlan(data.sequencePlan)
                        setContextItems(data.contextItems || [])
                        
                        toast({
                          title: "Sequence Plan Generated!",
                          description: `Created 1 LinkedIn connection request, ${data.sequencePlan.emails.length} emails, and ${data.sequencePlan.linkedInMessages.length} LinkedIn messages.`,
                        })

                        // Automatically advance to step 3 and start generating messages
                        setCurrentStep(3)
                        
                        // Start generating messages immediately
                        setIsGeneratingMessages(true)
                        try {
                          const messagesResponse = await fetch('/api/generate-messages', {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                              sequencePlan: data.sequencePlan,
                              signal,
                              persona,
                              painPoints,
                              contextItems: data.contextItems || [],
                              isIncentivized,
                              incentiveAmount
                            }),
                          })

                          if (!messagesResponse.ok) {
                            throw new Error('Failed to generate messages')
                          }

                          const messagesData = await messagesResponse.json()
                          setGeneratedMessages(messagesData.messages)
                          
                          toast({
                            title: "Sequence Generated!",
                            description: `Generated ${messagesData.messages.length} messages. Auto-optimizing...`,
                          })

                          // Automatically optimize all messages
                          await autoOptimizeAllMessages(messagesData.messages, signal, persona, painPoints, contextItems)
                        } catch (messagesError) {
                          console.error('Error generating messages:', messagesError)
                          toast({
                            title: "Message Generation Failed",
                            description: "Failed to generate messages. Please try again.",
                            variant: "destructive",
                          })
                        } finally {
                          setIsGeneratingMessages(false)
                        }
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

              
                  {sequencePlan.linkedInConnectionRequest && (
                    <div className="space-y-4">
                      <h3 className="font-semibold">LinkedIn Connection Request</h3>
                      <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Same Day</span>
                          <span className="text-xs text-muted-foreground">Connection Request</span>
                        </div>
                        <h4 className="font-medium">Send Connection Request on LinkedIn</h4>
                        <p className="text-sm text-muted-foreground mt-1">{sequencePlan.linkedInConnectionRequest.purpose}</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="font-semibold">Email Sequence</h3>
                    {sequencePlan.emails.map((email, index) => (
                      <div key={index} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Email {index + 1}</span>
                          <span className="text-xs text-muted-foreground">{email.daysLater === 0 ? 'Same Day' : `${email.daysLater} Days Later`}</span>
                </div>
                        <h4 className="font-medium">{email.subject}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{email.purpose}</p>
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                          <strong>Signal Integration:</strong> {email.signalIntegration}
                        </p>
                        {email.messageOutline?.assignedContext && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            <strong>Assigned Context:</strong> {email.messageOutline.assignedContext}
                          </p>
                        )}
                </div>
                    ))}
              </div>
              
                  {sequencePlan.linkedInMessages.length > 0 && (
                    <div className="space-y-4">
                      <h3 className="font-semibold">LinkedIn Messages</h3>
                      {sequencePlan.linkedInMessages.map((message, index) => {
                        // Calculate gap from previous step
                        const previousStepDay = index === 0 ? 0 : sequencePlan.linkedInMessages[index - 1].daysLater
                        const gap = message.daysLater - previousStepDay
                        const timingText = gap === 0 ? 'Same Day' : `${gap} Days Later`
                        
                        return (
                        <div key={index} className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">LinkedIn {index + 1}</span>
                            <span className="text-xs text-muted-foreground">{timingText}</span>
                </div>
                          <p className="text-sm text-muted-foreground">{message.purpose}</p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                            <strong>Signal Integration:</strong> {message.signalIntegration}
                          </p>
                          {message.messageOutline?.assignedContext && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                              <strong>Assigned Context:</strong> {message.messageOutline.assignedContext}
                            </p>
                          )}
                        </div>
                        )
                      })}
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
                          
                          // Log retry API call details to browser console
                          const requestPayload = {
                            signal,
                            persona,
                            painPoints,
                            emailCount,
                            linkedInCount,
                            contextItems: selectedContextItems,
                            isIncentivized,
                            incentiveAmount
                          }
                          console.log('🔄 CLIENT: Retrying API call to generate-sequence-plan')
                          console.log('📧 MODEL: gpt-5-mini')
                          console.log('📝 REQUEST PAYLOAD:', requestPayload)
                          console.log('⏰ TIMESTAMP:', new Date().toISOString())
                          
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
                                linkedInCount,
                                contextItems: selectedContextItems,
                                isIncentivized,
                                incentiveAmount
                              }),
                            })

                            if (!response.ok) {
                              const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                              throw new Error(errorData.error || `HTTP ${response.status}: Failed to generate sequence plan`)
                            }

                            const data = await response.json()
                            setSequencePlan(data.sequencePlan)
                            setContextItems(data.contextItems || [])
                            
                            toast({
                              title: "Sequence Plan Regenerated!",
                              description: `Created new 1 LinkedIn connection request, ${data.sequencePlan.emails.length} emails, and ${data.sequencePlan.linkedInMessages.length} LinkedIn messages.`,
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
                      
                      // Log message generation API call details to browser console
                      const requestPayload = {
                        signal,
                        persona,
                        painPoints,
                        sequencePlan,
                        contextItems: selectedContextItems
                      }
                      console.log('🚀 CLIENT: Making API call to generate-messages')
                      console.log('📧 MODEL: gpt-4o-mini')
                      console.log('📝 REQUEST PAYLOAD:', requestPayload)
                      console.log('📏 SEQUENCE PLAN:', sequencePlan)
                      console.log('⏰ TIMESTAMP:', new Date().toISOString())
                      
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
                            sequencePlan,
                            contextItems: selectedContextItems
                          }),
                        })

                        if (!response.ok) {
                          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                          throw new Error(errorData.error || `HTTP ${response.status}: Failed to generate messages`)
                        }

                        const data = await response.json()
                        
                        // Log response details to browser console
                        console.log('✅ CLIENT: Received response from generate-messages')
                        console.log('📧 MODEL: gpt-4o-mini')
                        console.log('📊 RESPONSE DATA:', data)
                        console.log('📧 GENERATED MESSAGES:', data.messages)
                        console.log('📊 STATS:', {
                          emailsGenerated: data.emailsGenerated,
                          linkedInGenerated: data.linkedInGenerated
                        })
                        console.log('⏰ RESPONSE TIMESTAMP:', new Date().toISOString())
                        
                        setGeneratedMessages(data.messages)
                        
                        toast({
                          title: "Messages Generated!",
                          description: `Created ${data.emailsGenerated} emails and ${data.linkedInGenerated} LinkedIn messages. Auto-optimizing...`,
                        })

                        // Automatically optimize all messages
                        await autoOptimizeAllMessages(data.messages, signal, persona, painPoints, selectedContextItems)
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
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold">Generated Messages</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handlePrevious}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button 
                        variant="outline" 
                        size="sm"
                        onClick={async () => {
                          setIsGeneratingMessages(true)
                          setGeneratedMessages([])
                          
                          // Log regenerate API call details to browser console
                          const requestPayload = {
                            signal,
                            persona,
                            painPoints,
                            sequencePlan,
                            contextItems: selectedContextItems
                          }
                          console.log('🔄 CLIENT: Regenerating messages via API call to generate-messages')
                          console.log('📧 MODEL: gpt-4o-mini')
                          console.log('📝 REQUEST PAYLOAD:', requestPayload)
                          console.log('📏 SEQUENCE PLAN:', sequencePlan)
                          console.log('⏰ TIMESTAMP:', new Date().toISOString())
                          
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
                                sequencePlan,
                                contextItems: selectedContextItems
                              }),
                            })

                            if (!response.ok) {
                              const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                              throw new Error(errorData.error || `HTTP ${response.status}: Failed to generate messages`)
                            }

                            const data = await response.json()
                            
                            // Log regenerate response details to browser console
                            console.log('✅ CLIENT: Received regenerate response from generate-messages')
                            console.log('📧 MODEL: gpt-4o-mini')
                            console.log('📊 RESPONSE DATA:', data)
                            console.log('📧 REGENERATED MESSAGES:', data.messages)
                            console.log('📊 STATS:', {
                              emailsGenerated: data.emailsGenerated,
                              linkedInGenerated: data.linkedInGenerated
                            })
                            console.log('⏰ RESPONSE TIMESTAMP:', new Date().toISOString())
                            
                            setGeneratedMessages(data.messages)
                            
                            toast({
                              title: "Messages Regenerated!",
                              description: `Created new ${data.emailsGenerated} emails and ${data.linkedInGenerated} LinkedIn messages. Auto-optimizing...`,
                            })

                            // Automatically optimize all messages
                            await autoOptimizeAllMessages(data.messages, signal, persona, painPoints, selectedContextItems)
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
                      {generatedMessages.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            const unoptimizedMessages = generatedMessages.filter(m => !m.isOptimized && !m.isOptimizing)
                            
                            if (unoptimizedMessages.length === 0) {
                              toast({
                                title: "All messages already optimized",
                                description: "There are no messages left to optimize.",
                              })
                              return
                            }

                            toast({
                              title: "Optimizing all messages...",
                              description: `Starting optimization of ${unoptimizedMessages.length} messages.`,
                            })

                            // Set all unoptimized messages to optimizing state
                            setGeneratedMessages(prev => prev.map(m => 
                              !m.isOptimized && !m.isOptimizing ? { ...m, isOptimizing: true } : m
                            ))

                            let successCount = 0
                            let failureCount = 0

                            // Optimize each message individually with delays to prevent rate limiting
                            const optimizationPromises = unoptimizedMessages.map(async (message, index) => {
                              // Add a small delay between requests to prevent overwhelming the server
                              if (index > 0) {
                                await new Promise(resolve => setTimeout(resolve, 1000 * index))
                              }
                              try {
                                const response = await fetch('/api/optimize-message', {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                  },
                                  body: JSON.stringify({
                                    messageId: message.id,
                                    originalContent: message.content,
                                    type: message.type,
                                    signal,
                                    persona,
                                    painPoints,
                                    contextItems
                                  }),
                                })

                                if (!response.ok) {
                                  throw new Error(`HTTP ${response.status}: Failed to optimize message`)
                                }

                                const data = await response.json()
                                
                                // Update the message with optimized content
                                setGeneratedMessages(prev => prev.map(m => 
                                  m.id === message.id ? {
                                    ...m,
                                    content: data.optimizedContent,
                                    originalContent: message.content,
                                    isOptimized: true,
                                    isOptimizing: false
                                  } : m
                                ))

                                successCount++
                              } catch (error) {
                                console.error(`Error optimizing message ${message.id}:`, error)
                                failureCount++
                                
                                // Reset optimizing state on failure
                                setGeneratedMessages(prev => prev.map(m => 
                                  m.id === message.id ? { ...m, isOptimizing: false } : m
                                ))
                              }
                            })

                            // Wait for all optimizations to complete
                            await Promise.all(optimizationPromises)

                            // Show final toast
                            if (failureCount === 0) {
                              toast({
                                title: "All messages optimized!",
                                description: `Successfully optimized ${successCount} messages.`,
                              })
                            } else if (successCount > 0) {
                              toast({
                                title: "Optimization completed with some issues",
                                description: `Optimized ${successCount} messages successfully, ${failureCount} failed.`,
                                variant: "destructive",
                              })
                            } else {
                              toast({
                                title: "Optimization failed",
                                description: "Failed to optimize any messages. Please try again.",
                                variant: "destructive",
                              })
                            }
                          }}
                          disabled={generatedMessages.some(m => m.isOptimizing)}
                        >
                          {generatedMessages.some(m => m.isOptimizing) ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Optimizing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-4 w-4" />
                              Optimize All
                            </>
                          )}
                        </Button>
                      )}
                </div>
              </div>

              
                  {sequencePlan.linkedInConnectionRequest && (
                    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-900">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Step 1: Same Day</span>
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                            Connection Request
                          </span>
                        </div>
                      </div>
                      <h4 className="font-medium mb-2">Send Connection Request on LinkedIn</h4>
                      <p className="text-sm text-muted-foreground">{sequencePlan.linkedInConnectionRequest.purpose}</p>
                    </div>
                  )}

                  {generatedMessages.map((message, index) => {
                    // Calculate step number: Step 1 is connection request only if LinkedIn count > 0
                    const stepNumber = linkedInCount > 0 ? index + 2 : index + 1
                    
                    // Calculate timing text based on absolute daysLater value
                    const timingText = message.daysLater === 0 ? 'Same Day' : `${message.daysLater} Days Later`
                    
                    return (
                    <div key={message.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Step {stepNumber}: {timingText}</span>
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
                                
                                // Log optimization API call details to browser console
                                const requestPayload = {
                                  messageId: message.id,
                                  originalContent: message.originalContent,
                                  type: message.type,
                                  signal,
                                  persona,
                                  painPoints,
                                  contextItems: selectedContextItems
                                }
                                console.log('🚀 CLIENT: Making API call to optimize-message')
                                console.log('📧 MODEL: gpt-5-nano (with gpt-4o-mini fallback)')
                                console.log('📝 MESSAGE ID:', message.id)
                                console.log('📝 MESSAGE TYPE:', message.type)
                                console.log('📝 REQUEST PAYLOAD:', requestPayload)
                                console.log('⏰ TIMESTAMP:', new Date().toISOString())
                                
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
                                      painPoints,
                                      contextItems: selectedContextItems
                                    }),
                                  })

                                  if (!response.ok) {
                                    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
                                    throw new Error(errorData.error || `HTTP ${response.status}: Failed to optimize message`)
                                  }

                                  const data = await response.json()
                                  
                                  // Log optimization response details to browser console
                                  console.log('✅ CLIENT: Received response from optimize-message')
                                  console.log('📧 MODEL: gpt-5-nano (or gpt-4o-mini fallback)')
                                  console.log('📝 MESSAGE ID:', message.id)
                                  console.log('📝 MESSAGE TYPE:', message.type)
                                  console.log('📊 RESPONSE DATA:', data)
                                  console.log('📝 ORIGINAL CONTENT:', message.originalContent)
                                  console.log('📝 OPTIMIZED CONTENT:', data.optimizedContent)
                                  console.log('⏰ RESPONSE TIMESTAMP:', new Date().toISOString())
                                  
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
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      try {
                        // Convert markdown-style formatting to clean HTML for rich text copying
                        let processed = message.content
                          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
                          .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
                          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>') // Links - clean format
                        
                        // Convert to clean div structure like the example
                        const htmlContent = processed
                          .split('\n')
                          .map(line => {
                            const trimmed = line.trim()
                            if (trimmed === '') {
                              return '<div><br></div>'
                            } else {
                              return `<div>${trimmed}</div>`
                            }
                          })
                          .join('')
                        
                        // Create a plain text version for fallback
                        const plainText = message.content
                          .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
                          .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
                          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)') // Convert links to text
                        
                        // Copy as rich text (HTML) with plain text fallback
                        await navigator.clipboard.write([
                          new ClipboardItem({
                            'text/html': new Blob([htmlContent], { type: 'text/html' }),
                            'text/plain': new Blob([plainText], { type: 'text/plain' })
                          })
                        ])
                        
                        toast({
                          title: "Copied to clipboard!",
                          description: "Message content copied with formatting - ready to paste into your CRM.",
                        })
                      } catch (error) {
                        // Fallback to plain text if rich text copying fails
                        navigator.clipboard.writeText(message.content)
                        toast({
                          title: "Copied to clipboard!",
                          description: "Message content copied as plain text.",
                        })
                      }
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
              
              <div className="bg-muted/50 rounded-md p-3">
                <div 
                  className="text-sm whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: (() => {
                      // First, convert markdown bold formatting to HTML
                      let processed = message.content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                      
                      // Then, convert markdown links to clean HTML (no extra styling)
                      processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>');
                      
                      // Then, replace merge fields that are NOT inside href attributes
                      processed = processed.replace(/{{([^}]+)}}/g, (match, field) => {
                        // Check if this merge field is inside an href attribute
                        const beforeMatch = processed.substring(0, processed.indexOf(match));
                        const lastHref = beforeMatch.lastIndexOf('href=');
                        const lastQuote = beforeMatch.lastIndexOf('"', lastHref);
                        const nextQuote = processed.indexOf('"', lastHref);
                        
                        // If we're inside an href attribute, don't replace
                        if (lastHref > lastQuote && lastHref < nextQuote) {
                          return match; // Keep original merge field
                        }
                        
                        // Otherwise, keep as plain text (no styling)
                        return match;
                      });
                      
                      // Finally, replace newlines
                      return processed.replace(/\n/g, '<br>');
                    })()
                  }}
                />
              </div>
                    </div>
                    )
                  })}
                </div>
              )}

              {/* Next Button for Step 3 */}
              {currentStep === 3 && generatedMessages.length > 0 && (
                <div className="flex justify-end">
                  <Button 
                    onClick={handleNext} 
                    disabled={!canProceedToNext()}
                    className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/25"
                  >
                    Next: Campaign
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Campaign */}
        {currentStep >= 4 && (
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="w-10 h-10 bg-orange-600 text-white rounded-xl flex items-center justify-center text-sm font-bold shadow-lg shadow-orange-600/25">4</div>
                <Sparkles className="h-5 w-5 text-orange-600" />
                <span>Finalize Campaign</span>
              </CardTitle>
              <CardDescription>
                Review your sequence and provide feedback for final campaign optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Feedback Input */}
              <div className="space-y-2">
                <Label htmlFor="campaign-feedback">Campaign Feedback (Optional)</Label>
                <Textarea
                  id="campaign-feedback"
                  placeholder="Any specific feedback or requirements for the campaign? (e.g., 'Make the tone more urgent', 'Focus more on cost savings', 'Add more customer examples')"
                  value={campaignFeedback}
                  onChange={(e) => setCampaignFeedback(e.target.value)}
                  rows={3}
                />
              </div>

              {/* Finalize Campaign Button */}
              <div className="flex justify-center">
                <Button
                  onClick={async () => {
                    setIsAnalyzingCampaign(true)
                    
                    try {
                      // Phase 1: Analyze campaign
                      const analysisResponse = await fetch('/api/analyze-campaign', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          messages: generatedMessages,
                          signal,
                          persona,
                          painPoints,
                          contextItems: selectedContextItems,
                          userFeedback: campaignFeedback
                        })
                      })
                      
                      if (!analysisResponse.ok) {
                        throw new Error('Campaign analysis failed')
                      }
                      
                      const { campaignPlan } = await analysisResponse.json()
                      setCampaignPlan(campaignPlan)
                      setIsAnalyzingCampaign(false)
                      setIsFinalizingCampaign(true)
                      
                      // Phase 2: Apply feedback
                      const finalizeResponse = await fetch('/api/apply-campaign-feedback', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          messages: generatedMessages,
                          feedbackPlan: campaignPlan.feedbackPlan,
                          signal,
                          persona,
                          painPoints,
                          contextItems: selectedContextItems,
                          userFeedback: campaignFeedback
                        })
                      })
                      
                      if (!finalizeResponse.ok) {
                        throw new Error('Campaign finalization failed')
                      }
                      
                      const { finalizedMessages, stats } = await finalizeResponse.json()
                      setFinalizedMessages(finalizedMessages)
                      setIsFinalizingCampaign(false)
                      
                      // Show results with partial success handling
                      if (stats.failed > 0) {
                        toast({
                          title: "Campaign Finalized with Issues",
                          description: `Successfully finalized ${stats.successful} messages, ${stats.failed} failed.`,
                          variant: "destructive",
                        })
                      } else {
                        toast({
                          title: "Campaign Finalized!",
                          description: `Successfully finalized all ${stats.total} messages.`,
                        })
                      }
                      
                    } catch (error) {
                      console.error('Campaign finalization failed:', error)
                      setIsAnalyzingCampaign(false)
                      setIsFinalizingCampaign(false)
                      toast({
                        title: "Campaign Finalization Failed",
                        description: "Please try again.",
                        variant: "destructive",
                      })
                    }
                  }}
                  disabled={isAnalyzingCampaign || isFinalizingCampaign}
                  size="lg"
                >
                  {isAnalyzingCampaign ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Campaign...
                    </>
                  ) : isFinalizingCampaign ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Finalizing Campaign...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Finalize Campaign
                    </>
                  )}
                </Button>
              </div>

              {/* Display Finalized Messages */}
              {finalizedMessages.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Finalized Campaign</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          try {
                            // Convert all messages to rich HTML format
                            const htmlMessages = finalizedMessages.map((m, i) => {
                              // Convert markdown-style formatting to clean HTML
                              let processed = m.content
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
                                .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
                                .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>') // Links
                              
                              // Convert to clean div structure
                              const htmlContent = processed
                                .split('\n')
                                .map(line => {
                                  const trimmed = line.trim()
                                  if (trimmed === '') {
                                    return '<div><br></div>'
                                  } else {
                                    return `<div>${trimmed}</div>`
                                  }
                                })
                                .join('')
                              
                              return `<div style="margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; border-radius: 5px;">
                                <h4>Message ${i+1} (${m.type}, Day ${m.daysLater})</h4>
                                ${htmlContent}
                              </div>`
                            }).join('')
                            
                            const fullHtmlContent = `<div>${htmlMessages}</div>`
                            
                            // Create plain text version for fallback
                            const plainText = finalizedMessages.map((m, i) => 
                              `Message ${i+1} (${m.type}, Day ${m.daysLater}):\n${m.content}\n`
                            ).join('\n---\n')
                            
                            // Copy as rich text (HTML) with plain text fallback
                            await navigator.clipboard.write([
                              new ClipboardItem({
                                'text/html': new Blob([fullHtmlContent], { type: 'text/html' }),
                                'text/plain': new Blob([plainText], { type: 'text/plain' })
                              })
                            ])
                            
                            toast({
                              title: "Campaign Copied!",
                              description: "All finalized messages copied with formatting - ready to paste into your CRM.",
                            })
                          } catch (error) {
                            // Fallback to plain text if rich text copying fails
                            const allContent = finalizedMessages.map((m, i) => 
                              `Message ${i+1} (${m.type}, Day ${m.daysLater}):\n${m.content}\n`
                            ).join('\n---\n')
                            navigator.clipboard.writeText(allContent)
                            toast({
                              title: "Campaign Copied!",
                              description: "All finalized messages copied as plain text.",
                            })
                          }
                        }}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy All
                      </Button>
                    </div>
                  </div>
                  
                  {finalizedMessages.map((message, index) => {
                    const stepNumber = linkedInCount > 0 ? index + 2 : index + 1
                    const timingText = message.daysLater === 0 ? 'Same Day' : `${message.daysLater} Days Later`
                    
                    return (
                      <div key={message.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Step {stepNumber}: {timingText}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              message.type === 'email' 
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                                : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            }`}>
                              {message.type === 'email' ? 'Email' : 'LinkedIn'}
                            </span>
                            <span className="px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                              Finalized
                            </span>
                            {message.feedbackError && (
                              <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                Feedback Failed
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  // Set refinalizing state
                                  setFinalizedMessages(prev => 
                                    prev.map(msg => 
                                      msg.id === message.id 
                                        ? { ...msg, isRefinalizing: true }
                                        : msg
                                    )
                                  )

                                  // Show loading state
                                  toast({
                                    title: "Re-finalizing message...",
                                    description: "Applying campaign context to avoid repetitive phrases.",
                                  })

                                  const response = await fetch('/api/refinalize-message', {
                                    method: 'POST',
                                    headers: {
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({
                                      messageId: message.id,
                                      messageContent: message.content,
                                      messageType: message.type,
                                      signal: signal,
                                      persona: selectedPersona?.id,
                                      painPoints: painPoints,
                                      contextItems: selectedContextItems,
                                      allFinalizedMessages: finalizedMessages
                                    }),
                                  })

                                  if (!response.ok) {
                                    throw new Error('Re-finalization failed')
                                  }

                                  const { refinalizedContent } = await response.json()

                                  // Update the specific message in the finalized messages array
                                  setFinalizedMessages(prev => 
                                    prev.map(msg => 
                                      msg.id === message.id 
                                        ? { ...msg, content: refinalizedContent, isRefinalizing: false }
                                        : msg
                                    )
                                  )

                                  toast({
                                    title: "Message re-finalized!",
                                    description: "Message updated with improved variety and reduced repetition.",
                                  })
                                } catch (error) {
                                  console.error('Re-finalization failed:', error)
                                  
                                  // Reset refinalizing state on failure
                                  setFinalizedMessages(prev => 
                                    prev.map(msg => 
                                      msg.id === message.id 
                                        ? { ...msg, isRefinalizing: false }
                                        : msg
                                    )
                                  )
                                  
                                  toast({
                                    title: "Re-finalization failed",
                                    description: "Please try again.",
                                    variant: "destructive",
                                  })
                                }
                              }}
                              disabled={message.isRefinalizing}
                            >
                              {message.isRefinalizing ? (
                                <>
                                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                  Re-finalizing...
                                </>
                              ) : (
                                <>
                                  <RefreshCw className="mr-2 h-3 w-3" />
                                  Re-finalize
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                try {
                                  // Convert markdown-style formatting to clean HTML for rich text copying
                                  let processed = message.content
                                    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
                                    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
                                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>') // Links - clean format
                                  
                                  // Convert to clean div structure like the example
                                  const htmlContent = processed
                                    .split('\n')
                                    .map(line => {
                                      const trimmed = line.trim()
                                      if (trimmed === '') {
                                        return '<div><br></div>'
                                      } else {
                                        return `<div>${trimmed}</div>`
                                      }
                                    })
                                    .join('')
                                  
                                  // Create a plain text version for fallback
                                  const plainText = message.content
                                    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
                                    .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
                                    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)') // Convert links to text
                                  
                                  // Copy as rich text (HTML) with plain text fallback
                                  await navigator.clipboard.write([
                                    new ClipboardItem({
                                      'text/html': new Blob([htmlContent], { type: 'text/html' }),
                                      'text/plain': new Blob([plainText], { type: 'text/plain' })
                                    })
                                  ])
                                  
                                  toast({
                                    title: "Copied to clipboard!",
                                    description: "Message content copied with formatting - ready to paste into your CRM.",
                                  })
                                } catch (error) {
                                  // Fallback to plain text if rich text copying fails
                                  navigator.clipboard.writeText(message.content)
                                  toast({
                                    title: "Copied to clipboard!",
                                    description: "Message content copied as plain text.",
                                  })
                                }
                              }}
                            >
                              <Copy className="mr-2 h-3 w-3" />
                              Copy
                            </Button>
                          </div>
                        </div>
                        
                        <div className="bg-muted/50 rounded-md p-3">
                          <div 
                            className="text-sm whitespace-pre-wrap"
                            dangerouslySetInnerHTML={{
                              __html: (() => {
                                // First, convert markdown bold formatting to HTML
                                let processed = message.content.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                                
                                // Then, convert markdown links to clean HTML (no extra styling)
                                processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>');
                                
                                // Then, replace merge fields that are NOT inside href attributes
                                processed = processed.replace(/{{([^}]+)}}/g, (match, field) => {
                                  // Check if this merge field is inside an href attribute
                                  const beforeMatch = processed.substring(0, processed.indexOf(match));
                                  const lastHref = beforeMatch.lastIndexOf('href=');
                                  const lastQuote = beforeMatch.lastIndexOf('"', lastHref);
                                  const nextQuote = processed.indexOf('"', lastHref);
                                  
                                  // If we're inside an href attribute, don't replace
                                  if (lastHref > lastQuote && lastHref < nextQuote) {
                                    return match; // Keep original merge field
                                  }
                                  
                                  // Otherwise, keep as plain text (no styling)
                                  return match;
                                });
                                
                                // Finally, replace newlines
                                return processed.replace(/\n/g, '<br>');
                              })()
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
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
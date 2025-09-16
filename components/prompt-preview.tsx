"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Copy, Eye, EyeOff, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ContextItem } from "@/lib/context-repository"
import { getPreamble } from "@/lib/preamble"

interface PromptPreviewProps {
  signal: string
  persona: string
  painPoints: string[]
  selectedContextItems: ContextItem[]
  onClose: () => void
}

export function PromptPreview({ signal, persona, painPoints, selectedContextItems, onClose }: PromptPreviewProps) {
  const [fullPrompt, setFullPrompt] = useState("")
  const [promptOverview, setPromptOverview] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingOverview, setIsGeneratingOverview] = useState(false)
  const [showRaw, setShowRaw] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    generatePrompt()
  }, [signal, persona, painPoints, selectedContextItems])

  const generatePrompt = async () => {
    if (!signal || !persona) return

    setIsLoading(true)
    try {
      const preamble = await getPreamble()
      const dynamicContext = buildDynamicContext(selectedContextItems || [])
      
      const prompt = `${preamble}

${dynamicContext}

GENERATION REQUEST:
- Persona/Role: ${persona}
- Signal: ${signal}
- Pain Points: ${painPoints.join(", ")}

Please generate an email sequence following all the rules and guidelines provided in the preamble above. Use the specific context provided to create highly relevant and personalized content. Focus on the specified persona, incorporate the signal, and address the selected pain points.`

      setFullPrompt(prompt)
      generateOverview(prompt)
    } catch (error) {
      console.error("Error generating prompt:", error)
      toast({
        title: "Error",
        description: "Failed to generate prompt preview.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const generateOverview = async (prompt: string) => {
    setIsGeneratingOverview(true)
    try {
      const response = await fetch("/api/generate-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          persona: "AI Assistant",
          signal: `Please analyze this ChatGPT prompt and provide a concise overview of what it contains. Focus on the key sections, context items, and generation requirements. Keep it under 200 words and make it easy to understand.

PROMPT TO ANALYZE:
${prompt}`,
          painPoints: [],
          contextItems: [],
          generateOverview: true
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setPromptOverview(data.email)
      } else {
        // Fallback to a simple summary
        setPromptOverview(createFallbackOverview(prompt))
      }
    } catch (error) {
      console.error("Error generating overview:", error)
      setPromptOverview(createFallbackOverview(prompt))
    } finally {
      setIsGeneratingOverview(false)
    }
  }

  const createFallbackOverview = (prompt: string): string => {
    const contextCount = selectedContextItems.length
    const categories = selectedContextItems.reduce((acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const categorySummary = Object.entries(categories)
      .map(([category, count]) => `${count} ${category.replace('_', ' ')}${count > 1 ? 's' : ''}`)
      .join(', ')

    return `This prompt contains comprehensive instructions for generating a personalized email campaign.

**Key Components:**
• **Target Persona:** ${persona}
• **Campaign Signal:** ${signal.substring(0, 100)}${signal.length > 100 ? '...' : ''}
• **Pain Points:** ${painPoints.join(', ') || 'None specified'}
• **Context Items:** ${contextCount} total (${categorySummary})

**Prompt Structure:**
• Goals and objectives for the email sequence
• Return format specifications
• Warnings and guidelines
• Relevant context for personalization
• Specific generation request with your parameters

The prompt is designed to create highly targeted, personalized email content that addresses your specific business needs and audience.`
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullPrompt)
      toast({
        title: "Copied!",
        description: "Full prompt copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  const buildDynamicContext = (contextItems: ContextItem[]): string => {
    if (!contextItems || contextItems.length === 0) {
      return "## RELEVANT CONTEXT FOR THIS EMAIL:\n\n*No specific context items selected - using general guidelines only*"
    }

    const contextByCategory = contextItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = []
      }
      acc[item.category].push(item)
      return acc
    }, {} as Record<string, ContextItem[]>)

    let context = "## RELEVANT CONTEXT FOR THIS EMAIL:\n\n"

    // Add customers
    if (contextByCategory.customer) {
      context += "### Relevant Customers:\n"
      contextByCategory.customer.forEach(item => {
        context += `- ${item.content}\n`
      })
      context += "\n"
    }

    // Add case studies
    if (contextByCategory.case_study) {
      context += "### Relevant Case Studies:\n"
      contextByCategory.case_study.forEach(item => {
        context += `- ${item.title}: ${item.content}`
        if (item.url) {
          context += ` (URL: ${item.url})`
        }
        context += `\n`
      })
      context += "\n"
    }

    // Add value propositions
    if (contextByCategory.value_prop) {
      context += "### Relevant Value Propositions:\n"
      contextByCategory.value_prop.forEach(item => {
        context += `- ${item.content}\n`
      })
      context += "\n"
    }

    // Add statistics
    if (contextByCategory.statistic) {
      context += "### Relevant Statistics:\n"
      contextByCategory.statistic.forEach(item => {
        context += `- ${item.content}\n`
      })
      context += "\n"
    }

    // Add customer quotes
    if (contextByCategory.quote) {
      context += "### Relevant Customer Quotes:\n"
      contextByCategory.quote.forEach(item => {
        context += `- ${item.content}\n`
      })
      context += "\n"
    }

    // Add language styles
    if (contextByCategory.language_style) {
      context += "### Relevant Language Guidelines:\n"
      contextByCategory.language_style.forEach(item => {
        context += `- ${item.content}\n`
      })
      context += "\n"
    }

    return context
  }

  const formatPromptForDisplay = (prompt: string) => {
    if (showRaw) return prompt

    // Split into sections for better readability
    const sections = prompt.split(/(?=## )/g)
    
    return sections.map((section, index) => {
      if (section.includes("## RELEVANT CONTEXT FOR THIS EMAIL:")) {
        return (
          <div key={index} className="mb-6">
            <div className="bg-blue-500/10 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <h3 className="font-semibold text-blue-400 mb-2">🎯 RELEVANT CONTEXT FOR THIS EMAIL</h3>
              <div className="text-sm text-blue-300 whitespace-pre-wrap">{section.replace("## RELEVANT CONTEXT FOR THIS EMAIL:", "").trim()}</div>
            </div>
          </div>
        )
      } else if (section.includes("## Goals")) {
        return (
          <div key={index} className="mb-6">
            <div className="bg-green-500/10 border-l-4 border-green-500 p-4 rounded-r-lg">
              <h3 className="font-semibold text-green-400 mb-2">🎯 Goals</h3>
              <div className="text-sm text-green-300 whitespace-pre-wrap">{section.replace("## Goals", "").trim()}</div>
            </div>
          </div>
        )
      } else if (section.includes("## Return Format")) {
        return (
          <div key={index} className="mb-6">
            <div className="bg-purple-500/10 border-l-4 border-purple-500 p-4 rounded-r-lg">
              <h3 className="font-semibold text-purple-400 mb-2">📝 Return Format</h3>
              <div className="text-sm text-purple-300 whitespace-pre-wrap">{section.replace("## Return Format", "").trim()}</div>
            </div>
          </div>
        )
      } else if (section.includes("## Warnings")) {
        return (
          <div key={index} className="mb-6">
            <div className="bg-yellow-500/10 border-l-4 border-yellow-500 p-4 rounded-r-lg">
              <h3 className="font-semibold text-yellow-400 mb-2">⚠️ Warnings</h3>
              <div className="text-sm text-yellow-300 whitespace-pre-wrap">{section.replace("## Warnings", "").trim()}</div>
            </div>
          </div>
        )
      } else if (section.includes("## Context Dump")) {
        return (
          <div key={index} className="mb-6">
            <div className="bg-orange-500/10 border-l-4 border-orange-500 p-4 rounded-r-lg">
              <h3 className="font-semibold text-orange-400 mb-2">📚 Context Dump</h3>
              <div className="text-sm text-orange-300 whitespace-pre-wrap">{section.replace("## Context Dump", "").trim()}</div>
            </div>
          </div>
        )
      } else if (section.includes("GENERATION REQUEST:")) {
        return (
          <div key={index} className="mb-6">
            <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-lg">
              <h3 className="font-semibold text-red-400 mb-2">🚀 GENERATION REQUEST</h3>
              <div className="text-sm text-red-300 whitespace-pre-wrap">{section}</div>
            </div>
          </div>
        )
      } else {
        return (
          <div key={index} className="mb-4">
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">{section}</div>
          </div>
        )
      }
    })
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm max-w-6xl mx-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-lg bg-primary/10">
                <Eye className="h-5 w-5 text-primary" />
              </div>
              ChatGPT Prompt Preview
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              This is exactly what will be sent to ChatGPT to generate your email
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRaw(!showRaw)}
              className="border-border/50"
            >
              {showRaw ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
              {showRaw ? "Overview" : "Raw"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopy} className="border-border/50">
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Context Summary */}
        <div className="mb-4 p-4 bg-muted/30 rounded-lg border border-border/50">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span><strong className="text-foreground">Context Items:</strong> {selectedContextItems.length}</span>
            <span><strong className="text-foreground">Persona:</strong> {persona}</span>
            <span><strong className="text-foreground">Pain Points:</strong> {painPoints.join(", ") || "None"}</span>
          </div>
          {selectedContextItems.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedContextItems.map(item => (
                <Badge key={item.id} variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20">
                  {item.title}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Prompt Content */}
        <ScrollArea className="h-96 w-full">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Generating prompt preview...</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {showRaw ? (
                <div className="space-y-4">
                  <pre className="text-xs font-mono whitespace-pre-wrap bg-muted/30 p-4 rounded-lg border border-border/50 text-foreground">
                    {fullPrompt}
                  </pre>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* AI Overview */}
                  <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <h3 className="font-semibold text-blue-400">AI Overview</h3>
                      {isGeneratingOverview && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      )}
                    </div>
                    <div className="text-sm text-blue-300 whitespace-pre-wrap">
                      {isGeneratingOverview ? "Generating overview..." : promptOverview}
                    </div>
                  </div>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-foreground">{selectedContextItems.length}</div>
                      <div className="text-xs text-muted-foreground">Context Items</div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-foreground">{fullPrompt.length.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Characters</div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-foreground">{fullPrompt.split(/\s+/).length.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">Words</div>
                    </div>
                    <div className="bg-muted/30 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-foreground">{persona}</div>
                      <div className="text-xs text-muted-foreground">Persona</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

      </CardContent>
    </Card>
  )
}

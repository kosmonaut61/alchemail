"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Save, Loader2, RotateCcw, Building2, Mail, Users, Code, Target, MessageSquare, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PREAMBLE_SECTIONS, getAllPreambleSections, generateFullPreamble, updatePreambleSection } from "@/lib/preamble"

interface PreambleEditorProps {
  onClose: () => void
}

export function PreambleEditor({ onClose }: PreambleEditorProps) {
  const [sections, setSections] = useState(getAllPreambleSections())
  const [activeTab, setActiveTab] = useState("companyOverview")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchPreamble()
  }, [])

  const fetchPreamble = async () => {
    try {
      const response = await fetch("/api/preamble")
      if (response.ok) {
        const data = await response.json()
        // For now, we'll use the default sections
        // In the future, we could parse the preamble back into sections
        setSections(getAllPreambleSections())
      }
    } catch (error) {
      console.error("Error fetching preamble:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Generate full preamble from sections
      const fullPreamble = generateFullPreamble(sections)
      
      const response = await fetch("/api/preamble", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preamble: fullPreamble }),
      })

      if (response.ok) {
        toast({
          title: "Saved!",
          description: "Preamble sections updated successfully.",
        })
        onClose()
      } else {
        throw new Error("Failed to save preamble")
      }
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Failed to save preamble. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetToDefault = async () => {
    try {
      // Clear localStorage and reset to default sections
      localStorage.removeItem('email-preamble')
      setSections(getAllPreambleSections())
      toast({
        title: "Reset!",
        description: "Preamble sections reset to default values.",
      })
    } catch (error) {
      toast({
        title: "Reset Failed",
        description: "Failed to reset preamble. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSectionUpdate = (sectionKey: keyof typeof PREAMBLE_SECTIONS, newContent: string) => {
    setSections(prev => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        content: newContent
      }
    }))
  }

  const sectionIcons = {
    companyOverview: Building2,
    emailRules: Mail,
    customerReferences: Users,
    dynamicVariables: Code,
    painPointsValueProps: Target,
    toneLanguage: MessageSquare,
    campaignRules: Settings,
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Preamble Editor</CardTitle>
            <CardDescription>Edit the AI prompt preamble used for email generation</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7">
                {Object.entries(sections).map(([key, section]) => {
                  const Icon = sectionIcons[key as keyof typeof sectionIcons]
                  return (
                    <TabsTrigger key={key} value={key} className="flex items-center gap-1 text-xs">
                      <Icon className="h-3 w-3" />
                      <span className="hidden sm:inline">{section.title.split(' ')[0]}</span>
                    </TabsTrigger>
                  )
                })}
              </TabsList>
              
              {Object.entries(sections).map(([key, section]) => (
                <TabsContent key={key} value={key} className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">{section.title}</h3>
                    <Textarea
                      value={section.content}
                      onChange={(e) => handleSectionUpdate(key as keyof typeof PREAMBLE_SECTIONS, e.target.value)}
                      rows={20}
                      className="font-mono text-sm"
                      placeholder={`Enter your ${section.title.toLowerCase()} content here...`}
                    />
                  </div>
                </TabsContent>
              ))}
            </Tabs>
            
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Preamble
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleResetToDefault} disabled={isSaving}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset to Default
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

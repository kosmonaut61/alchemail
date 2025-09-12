"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { X, Save, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PreambleEditorProps {
  onClose: () => void
}

export function PreambleEditor({ onClose }: PreambleEditorProps) {
  const [preamble, setPreamble] = useState("")
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
        setPreamble(data.preamble)
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
      const response = await fetch("/api/preamble", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preamble }),
      })

      if (response.ok) {
        toast({
          title: "Saved!",
          description: "Preamble updated successfully.",
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
            <Textarea
              value={preamble}
              onChange={(e) => setPreamble(e.target.value)}
              rows={20}
              className="font-mono text-sm"
              placeholder="Enter your preamble here..."
            />
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

"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Mail, ArrowLeft, Loader2, Copy, Sparkles } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

export default function Alchemail30() {
  const [query, setQuery] = useState("")
  const [emailContent, setEmailContent] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!query.trim()) {
      toast({
        title: "Query required",
        description: "Please enter a query to generate an email.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setEmailContent("")

    try {
      const response = await fetch('/api/generate-email-3-0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate email')
      }

      const data = await response.json()
      
      if (data.success && data.content) {
        setEmailContent(data.content)
        toast({
          title: "Email generated! ✨",
          description: "Your email is ready to copy.",
        })
      } else {
        throw new Error('No content received from workflow')
      }
    } catch (error) {
      console.error('Generation error:', error)
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "Failed to generate email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const extractSubject = (content: string): string => {
    const subjectMatch = content.match(/Subject:\s*(.+?)(?:\n|$)/i)
    return subjectMatch ? subjectMatch[1].trim() : ""
  }

  const extractBody = (content: string): string => {
    const subjectMatch = content.match(/Subject:\s*.+?(?:\n|$)/i)
    if (subjectMatch) {
      return content.substring(subjectMatch.index! + subjectMatch[0].length).trim()
    }
    return content.trim()
  }

  const handleCopySubject = async () => {
    const subject = extractSubject(emailContent)
    if (subject) {
      await navigator.clipboard.writeText(subject)
      toast({
        title: "Subject copied! 📧",
        description: "Subject line copied to clipboard.",
      })
    } else {
      toast({
        title: "Copy failed",
        description: "Could not find subject line in email.",
        variant: "destructive",
      })
    }
  }

  const handleCopyBody = async () => {
    const body = extractBody(emailContent)
    if (body) {
      try {
        // Convert markdown formatting to HTML for rich text
        let processed = body
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold text
          .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic text
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>') // Links
        
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
        
        const plainText = body
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)')
        
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([htmlContent], { type: 'text/html' }),
            'text/plain': new Blob([plainText], { type: 'text/plain' })
          })
        ])
        
        toast({
          title: "Body copied! 📝",
          description: "Email body copied with formatting.",
        })
      } catch (error) {
        // Fallback to plain text
        await navigator.clipboard.writeText(body)
        toast({
          title: "Body copied! 📝",
          description: "Email body copied as plain text.",
        })
      }
    } else {
      toast({
        title: "Copy failed",
        description: "Could not extract body from email.",
        variant: "destructive",
      })
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
        {/* Query Input */}
        <Card>
          <CardHeader>
            <CardTitle>Generate Email</CardTitle>
            <CardDescription>
              Enter your query and let the AI workflow generate your email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="query">Query</Label>
              <Textarea
                id="query"
                placeholder="Enter your email generation query here..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !query.trim()}
              size="lg"
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Email
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Results Display */}
        {emailContent && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Email</CardTitle>
                  <CardDescription>Copy the subject and body separately</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopySubject}
                  >
                    <Copy className="mr-2 h-3 w-3" />
                    Copy Subject
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyBody}
                  >
                    <Copy className="mr-2 h-3 w-3" />
                    Copy Body
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-md p-4">
                <div 
                  className="text-sm whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: (() => {
                      // Convert markdown bold formatting to HTML
                      let processed = emailContent.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
                      
                      // Convert markdown links to HTML
                      processed = processed.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" rel="noopener noreferrer" target="_blank">$1</a>');
                      
                      // Replace merge fields (keep them as plain text)
                      processed = processed.replace(/{{([^}]+)}}/g, (match, field) => {
                        // Check if this merge field is inside an href attribute
                        const beforeMatch = processed.substring(0, processed.indexOf(match));
                        const lastHref = beforeMatch.lastIndexOf('href=');
                        const lastQuote = beforeMatch.lastIndexOf('"', lastHref);
                        const nextQuote = processed.indexOf('"', lastHref);
                        
                        // If we're inside an href attribute, don't replace
                        if (lastHref > lastQuote && lastHref < nextQuote) {
                          return match;
                        }
                        
                        return match;
                      });
                      
                      // Replace newlines
                      return processed.replace(/\n/g, '<br>');
                    })()
                  }}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Toaster />
    </div>
  )
}

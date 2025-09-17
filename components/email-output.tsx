"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, FileText, Eye, Code } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { useState } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface EmailOutputProps {
  email: string
  originalEmail?: string
  qualityReport?: {
    score: number
    issues: Array<{
      type: string
      severity: 'high' | 'medium' | 'low'
      message: string
      suggestion?: string
    }>
    suggestions: string[]
    passed: boolean
  }
  optimized?: boolean
  fixesApplied?: string[]
}

export function EmailOutput({ email, originalEmail, qualityReport, optimized, fixesApplied }: EmailOutputProps) {
  const { toast } = useToast()
  const [viewMode, setViewMode] = useState<'rich' | 'markdown'>('rich')
  const [showOriginal, setShowOriginal] = useState(false) // Default to showing optimized version

  const handleCopy = async () => {
    try {
      // Convert markdown to clean rich text for CRM compatibility
      const cleanText = convertToCRMFriendlyText(email)
      await navigator.clipboard.writeText(cleanText)
      toast({
        title: "Copied!",
        description: "Email content copied to clipboard in CRM-friendly format.",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  const convertToCRMFriendlyText = (markdownText: string): string => {
    // Split by lines and process each line
    const lines = markdownText.split('\n')
    const processedLines: string[] = []
    
    lines.forEach(line => {
      // Preserve empty lines for paragraph breaks
      if (line.trim() === '') {
        processedLines.push('')
        return
      }
      
      // Process markdown links: [text](url) -> text (url)
      let processedLine = line.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        // If it's an Apollo link, include both text and URL for CRM compatibility
        if (url.includes('app.apollo.io')) {
          return `${text} (${url})`
        }
        // For other links, show as text (url)
        return `${text} (${url})`
      })
      
      // Remove markdown bold/italic markers
      processedLine = processedLine.replace(/\*\*([^*]+)\*\*/g, '$1')
      processedLine = processedLine.replace(/\*([^*]+)\*/g, '$1')
      
      // Clean up subject line markers
      if (processedLine.startsWith('**Subject:**')) {
        processedLine = processedLine.replace('**Subject:**', 'Subject:')
      }
      
      // Remove any remaining markdown formatting
      processedLine = processedLine.replace(/^#{1,6}\s*/, '') // Remove heading markers
      processedLine = processedLine.replace(/`([^`]+)`/g, '$1') // Remove code backticks
      
      // Remove campaign structure markers
      processedLine = processedLine.replace(/^(Campaign Name:|Email \d+ \(Day \d+\):|LinkedIn Message \d+ \(Day \d+\):)/, '')
      
      processedLines.push(processedLine.trim())
    })
    
    // Join with proper line breaks and clean up extra spaces
    return processedLines
      .join('\n')
      .replace(/\n{3,}/g, '\n\n') // Remove excessive line breaks
      .trim()
  }

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              Generated Email
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Your AI-generated email sequence
              {qualityReport && (
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                  qualityReport.passed 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                }`}>
                  Quality: {qualityReport.score}/100{optimized ? ' (optimized)' : ''}
                </span>
              )}
            </CardDescription>
          </div>
          {email && (
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <div className="flex items-center border border-border/50 rounded-lg overflow-hidden">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === 'rich' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('rich')}
                        className="rounded-r-none border-0"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Rich Text Preview</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === 'markdown' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('markdown')}
                        className="rounded-l-none border-0"
                      >
                        <Code className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Markdown Source</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
              {originalEmail && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={showOriginal ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => setShowOriginal(!showOriginal)}
                        className="border-border/50"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        {showOriginal ? 'Show Optimized' : 'Show Original'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{showOriginal ? 'View the optimized version' : 'View the original version before QA fixes'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={handleCopy} className="border-border/50">
                      <Copy className="h-4 w-4 mr-2" />
                      Copy for CRM
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copies clean text format for pasting into CRM tools</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {email ? (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-6 border border-border/50">
              {viewMode === 'rich' ? (
                <div className="email-rich-text">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      a: ({ href, children, ...props }) => (
                        <a 
                          href={href} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 underline hover:text-blue-800 transition-colors"
                          {...props}
                        >
                          {children}
                        </a>
                      ),
                      p: ({ children, ...props }) => (
                        <p className="mb-3 last:mb-0 text-sm leading-relaxed" {...props}>
                          {children}
                        </p>
                      ),
                      h1: ({ children, ...props }) => (
                        <h1 className="text-lg font-semibold mb-3 text-foreground" {...props}>
                          {children}
                        </h1>
                      ),
                      h2: ({ children, ...props }) => (
                        <h2 className="text-base font-semibold mb-2 text-foreground" {...props}>
                          {children}
                        </h2>
                      ),
                      h3: ({ children, ...props }) => (
                        <h3 className="text-sm font-semibold mb-2 text-foreground" {...props}>
                          {children}
                        </h3>
                      ),
                      ul: ({ children, ...props }) => (
                        <ul className="list-disc list-inside mb-3 space-y-1 text-sm" {...props}>
                          {children}
                        </ul>
                      ),
                      ol: ({ children, ...props }) => (
                        <ol className="list-decimal list-inside mb-3 space-y-1 text-sm" {...props}>
                          {children}
                        </ol>
                      ),
                      li: ({ children, ...props }) => (
                        <li className="text-sm leading-relaxed" {...props}>
                          {children}
                        </li>
                      ),
                      strong: ({ children, ...props }) => (
                        <strong className="font-semibold text-foreground" {...props}>
                          {children}
                        </strong>
                      ),
                      em: ({ children, ...props }) => (
                        <em className="italic text-foreground" {...props}>
                          {children}
                        </em>
                      ),
                      blockquote: ({ children, ...props }) => (
                        <blockquote className="border-l-4 border-muted-foreground pl-4 italic text-muted-foreground mb-3" {...props}>
                          {children}
                        </blockquote>
                      ),
                      code: ({ children, ...props }) => (
                        <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono" {...props}>
                          {children}
                        </code>
                      ),
                      pre: ({ children, ...props }) => (
                        <pre className="bg-muted p-3 rounded text-xs font-mono overflow-x-auto mb-3" {...props}>
                          {children}
                        </pre>
                      ),
                    }}
                  >
                    {showOriginal && originalEmail ? originalEmail : email}
                  </ReactMarkdown>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">{showOriginal && originalEmail ? originalEmail : email}</pre>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Generated email will appear here</p>
            <p className="text-sm">Fill out the form and click generate to get started</p>
          </div>
        )}
        
        {/* Quality Improvements Applied Section */}
        {optimized && fixesApplied && fixesApplied.length > 0 && (
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded bg-green-100 dark:bg-green-900">
                <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium text-sm">Quality Improvements Applied</h4>
            </div>
            
            <div className="space-y-2">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm">
                <div className="font-medium text-green-800 dark:text-green-200 mb-2">
                  ✅ All issues automatically resolved
                </div>
                <div className="text-green-700 dark:text-green-300 text-xs">
                  Your email has been optimized to meet all quality standards
                </div>
              </div>
              
              <div className="p-3 bg-muted/50 rounded text-sm">
                <div className="font-medium mb-2">Improvements Made:</div>
                <ul className="space-y-1 text-muted-foreground text-xs">
                  {fixesApplied.map((fix, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 dark:text-green-400 mt-0.5">•</span>
                      <span>{fix}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Quality Passed Section */}
        {qualityReport && qualityReport.passed && !optimized && (
          <div className="mt-6 pt-6 border-t border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded bg-green-100 dark:bg-green-900">
                <Eye className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <h4 className="font-medium text-sm">Quality Check Passed</h4>
            </div>
            
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm">
              <div className="font-medium text-green-800 dark:text-green-200 mb-1">
                ✅ Email meets all quality standards
              </div>
              <div className="text-green-700 dark:text-green-300 text-xs">
                No improvements needed - your email follows all best practices
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

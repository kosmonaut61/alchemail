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
}

export function EmailOutput({ email }: EmailOutputProps) {
  const { toast } = useToast()
  const [viewMode, setViewMode] = useState<'rich' | 'markdown'>('rich')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email)
      toast({
        title: "Copied!",
        description: "Email content copied to clipboard.",
      })
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generated Email
            </CardTitle>
            <CardDescription>Your AI-generated email sequence</CardDescription>
          </div>
          {email && (
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <div className="flex items-center border rounded-md">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === 'rich' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('rich')}
                        className="rounded-r-none"
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
                        className="rounded-l-none"
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
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {email ? (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 border">
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
                    {email}
                  </ReactMarkdown>
                </div>
              ) : (
                <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">{email}</pre>
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
      </CardContent>
    </Card>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface EmailOutputProps {
  email: string
}

export function EmailOutput({ email }: EmailOutputProps) {
  const { toast } = useToast()

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
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {email ? (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 border">
              <pre className="whitespace-pre-wrap text-sm font-mono leading-relaxed">{email}</pre>
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

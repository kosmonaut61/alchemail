"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HelpCircle } from "lucide-react"

export function HelpModal() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
          <HelpCircle className="h-4 w-4" />
          <span className="sr-only">Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Alchemail 2.0 - User Guide</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 text-sm">
          <div>
            <h3 className="text-lg font-semibold mb-3">Welcome to Alchemail 2.0</h3>
            <p className="text-muted-foreground leading-relaxed">
              Build powerful, personalized email and LinkedIn sequences that drive results. 
              Start with your signal and let AI craft the perfect outreach strategy.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">How It Works</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                <div>
                  <h4 className="font-medium">Signal & Persona</h4>
                  <p className="text-muted-foreground text-sm">
                    Define your outreach signal (the reason you're reaching out) and select your target persona. 
                    The AI will automatically detect relevant pain points based on your signal.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                <div>
                  <h4 className="font-medium">Sequence Plan</h4>
                  <p className="text-muted-foreground text-sm">
                    Configure your sequence length and let AI create a strategic plan with context items, 
                    signal integration strategies, and message outlines for each touchpoint.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                <div>
                  <h4 className="font-medium">Generate & Optimize</h4>
                  <p className="text-muted-foreground text-sm">
                    Generate your complete sequence with AI-powered optimization. Each message can be 
                    individually optimized for maximum engagement and response rates.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Key Features</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Smart Signal Integration:</strong> Every message references and builds on your signal naturally</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Persona-Specific Messaging:</strong> Tailored tone, keywords, and pain points for each role</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Context-Aware Content:</strong> Uses relevant case studies, statistics, and customer examples</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>AI Optimization:</strong> GPT-5 powered message optimization for better engagement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Dynamic Variables:</strong> Automatic merge field integration for personalization</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Best Practices</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">Signal Writing</h4>
                <p className="text-muted-foreground text-sm">
                  Be specific about why you're reaching out. Include context like recent company news, 
                  industry trends, or specific challenges you can help solve.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Persona Selection</h4>
                <p className="text-muted-foreground text-sm">
                  Choose the persona that best matches your target contact's role and seniority level. 
                  This ensures the messaging tone and content are appropriate.
                </p>
              </div>
              <div>
                <h4 className="font-medium">Sequence Length</h4>
                <p className="text-muted-foreground text-sm">
                  Start with 3-4 emails and 1-2 LinkedIn messages for most campaigns. 
                  Longer sequences work well for high-value prospects or complex sales cycles.
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Tips for Success</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Review and customize the generated sequence plan before generating messages</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Use the context browser to see all available customer examples and statistics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Optimize individual messages for maximum impact and engagement</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>Copy optimized messages directly into your CRM or email platform</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              Need more help? The AI is designed to create professional, engaging sequences that follow 
              best practices for B2B outreach. Each generated message is optimized for your specific 
              signal, persona, and context.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { EMAIL_SAMPLES, getEmailSamplesByPersona } from "./email-samples"

export interface EmailQualityReport {
  score: number // 0-100
  issues: QualityIssue[]
  suggestions: string[]
  passed: boolean
}

export interface QualityIssue {
  type: 'subject' | 'greeting' | 'structure' | 'tone' | 'cta' | 'formatting' | 'length' | 'content'
  severity: 'high' | 'medium' | 'low'
  message: string
  suggestion?: string
}

export interface GenerationProgress {
  step: 'analyzing' | 'generating' | 'quality-check' | 'optimizing' | 'complete'
  message: string
  progress: number // 0-100
}

// Main QA function that analyzes generated email against samples and rules
export async function analyzeEmailQuality(
  generatedEmail: string,
  persona: string,
  painPoints: string[]
): Promise<EmailQualityReport> {
  const issues: QualityIssue[] = []
  const suggestions: string[] = []
  
  // Get relevant samples for comparison
  const samples = getEmailSamplesByPersona(persona)
  
  // Basic structural analysis
  issues.push(...analyzeStructure(generatedEmail))
  
  // Compare against samples
  if (samples) {
    issues.push(...await compareAgainstSamples(generatedEmail, samples, persona))
  }
  
  // Analyze content quality
  issues.push(...await analyzeContentQuality(generatedEmail, persona, painPoints))
  
  // Calculate score (100 - penalty points)
  const score = calculateScore(issues)
  const passed = score >= 70 && issues.filter(i => i.severity === 'high').length === 0
  
  // Generate suggestions
  suggestions.push(...generateSuggestions(issues, samples))
  
  return {
    score,
    issues,
    suggestions,
    passed
  }
}

// Analyze basic email structure
function analyzeStructure(email: string): QualityIssue[] {
  const issues: QualityIssue[] = []
  const lines = email.split('\n').filter(line => line.trim())
  
  // Check for subject line
  if (lines.length === 0 || !lines[0].includes('Subject:')) {
    issues.push({
      type: 'structure',
      severity: 'high',
      message: 'Missing subject line',
      suggestion: 'Add a subject line at the beginning (e.g., "Subject: Your subject here")'
    })
  }
  
  // Check for greeting
  const hasGreeting = lines.some(line => 
    line.includes('Hey') || line.includes('Hi') || line.includes('Hello')
  )
  if (!hasGreeting) {
    issues.push({
      type: 'greeting',
      severity: 'high',
      message: 'Missing proper greeting',
      suggestion: 'Start with "Hey [name]," or "Hi [name],"'
    })
  }
  
  // Check for CTA question
  const hasCTA = lines.some(line => 
    line.includes('?') && (
      line.includes('Would it') || 
      line.includes('Interested') || 
      line.includes('Should I') ||
      line.includes('Would it help')
    )
  )
  if (!hasCTA) {
    issues.push({
      type: 'cta',
      severity: 'high',
      message: 'Missing question-based CTA',
      suggestion: 'End with a soft question like "Would it make sense to connect?"'
    })
  }
  
  return issues
}

// Compare against sample emails using AI
async function compareAgainstSamples(
  email: string,
  samples: any,
  persona: string
): Promise<QualityIssue[]> {
  const issues: QualityIssue[] = []
  
  try {
    const comparisonPrompt = `Compare this generated email against the provided samples for the same persona. Identify any style, tone, or structure issues.

PERSONA: ${persona}

GENERATED EMAIL:
${email}

SAMPLE EMAILS:
${samples.emails.map((sample: any, index: number) => 
  `Sample ${index + 1}:\nSubject: ${sample.subject}\nBody: ${sample.body}`
).join('\n\n---\n\n')}

ANALYSIS REQUIREMENTS:
1. Check if the tone matches the samples (casual vs professional)
2. Verify greeting style matches ("Hey" vs "Hi")
3. Ensure structure follows the 3-paragraph format
4. Check if CTA style matches (soft questions vs commands)
5. Verify sentence length and readability
6. Check for proper personalization

Return a JSON array of issues found:
[
  {
    "type": "tone|structure|greeting|cta|formatting",
    "severity": "high|medium|low", 
    "message": "Description of the issue",
    "suggestion": "How to fix it"
  }
]`

    const { text } = await generateText({
      model: openai("gpt-4"),
      prompt: comparisonPrompt,
    })

    const parsedIssues = JSON.parse(text)
    if (Array.isArray(parsedIssues)) {
      issues.push(...parsedIssues)
    }
  } catch (error) {
    console.error('Error comparing against samples:', error)
  }
  
  return issues
}

// Analyze content quality using AI
async function analyzeContentQuality(
  email: string,
  persona: string,
  painPoints: string[]
): Promise<QualityIssue[]> {
  const issues: QualityIssue[] = []
  
  try {
    const qualityPrompt = `Analyze this email for quality issues based on the following criteria:

EMAIL TO ANALYZE:
${email}

PERSONA: ${persona}
TARGET PAIN POINTS: ${painPoints.join(', ')}

ANALYSIS CRITERIA:
1. **Subject Line**: 3-6 words, sentence case, no excessive punctuation
2. **Greeting**: "Hey" for casual/interns, "Hi" for professionals, never "Dear"
3. **Structure**: 3 paragraphs (pain point → social proof → CTA)
4. **Sentence Length**: Max 15 words per sentence
5. **Word Count**: 80-120 words total
6. **Tone**: 5th grade reading level, respectful but energetic
7. **Adverbs**: Max 2 per email
8. **CTA**: Ends with soft question, not command
9. **Formatting**: Plain text, no bold/italics, proper line breaks
10. **Personalization**: Uses merge tags appropriately
11. **Content**: Addresses specific pain points, includes social proof

Return a JSON array of issues:
[
  {
    "type": "subject|greeting|structure|tone|cta|formatting|length|content",
    "severity": "high|medium|low",
    "message": "Specific issue description", 
    "suggestion": "How to fix it"
  }
]`

    const { text } = await generateText({
      model: openai("gpt-4"),
      prompt: qualityPrompt,
    })

    const parsedIssues = JSON.parse(text)
    if (Array.isArray(parsedIssues)) {
      issues.push(...parsedIssues)
    }
  } catch (error) {
    console.error('Error analyzing content quality:', error)
  }
  
  return issues
}

// Calculate quality score based on issues
function calculateScore(issues: QualityIssue[]): number {
  let score = 100
  
  issues.forEach(issue => {
    switch (issue.severity) {
      case 'high':
        score -= 15
        break
      case 'medium':
        score -= 8
        break
      case 'low':
        score -= 3
        break
    }
  })
  
  return Math.max(0, score)
}

// Generate improvement suggestions
function generateSuggestions(issues: QualityIssue[], samples: any): string[] {
  const suggestions: string[] = []
  
  const highPriorityIssues = issues.filter(i => i.severity === 'high')
  const mediumPriorityIssues = issues.filter(i => i.severity === 'medium')
  
  if (highPriorityIssues.length > 0) {
    suggestions.push('🔴 High Priority Fixes:')
    highPriorityIssues.forEach(issue => {
      suggestions.push(`• ${issue.message}: ${issue.suggestion || 'See guidelines'}`)
    })
  }
  
  if (mediumPriorityIssues.length > 0) {
    suggestions.push('\n🟡 Medium Priority Improvements:')
    mediumPriorityIssues.forEach(issue => {
      suggestions.push(`• ${issue.message}: ${issue.suggestion || 'See guidelines'}`)
    })
  }
  
  if (samples) {
    suggestions.push('\n💡 Reference the sample emails for this persona to match the expected tone and structure.')
  }
  
  return suggestions
}

// Generate progress updates for the UI
export function getGenerationProgress(step: GenerationProgress['step']): GenerationProgress {
  const progressMap: Record<GenerationProgress['step'], GenerationProgress> = {
    'analyzing': {
      step: 'analyzing',
      message: 'Analyzing context and persona requirements...',
      progress: 20
    },
    'generating': {
      step: 'generating', 
      message: 'Generating email content...',
      progress: 50
    },
    'quality-check': {
      step: 'quality-check',
      message: 'Running quality assurance checks...',
      progress: 75
    },
    'optimizing': {
      step: 'optimizing',
      message: 'Optimizing email for best results...',
      progress: 90
    },
    'complete': {
      step: 'complete',
      message: 'Email generation complete!',
      progress: 100
    }
  }
  
  return progressMap[step]
}

// Optimize email based on QA results
export async function optimizeEmail(
  originalEmail: string,
  qualityReport: EmailQualityReport,
  persona: string,
  painPoints: string[]
): Promise<string> {
  if (qualityReport.passed) {
    return originalEmail
  }
  
  try {
    const optimizationPrompt = `Optimize this email based on the quality issues found. Fix all high and medium priority issues while maintaining the core message.

ORIGINAL EMAIL:
${originalEmail}

QUALITY ISSUES FOUND:
${qualityReport.issues.map(issue => 
  `- ${issue.type} (${issue.severity}): ${issue.message}`
).join('\n')}

PERSONA: ${persona}
PAIN POINTS: ${painPoints.join(', ')}

OPTIMIZATION REQUIREMENTS:
1. Fix all high priority issues
2. Address medium priority issues where possible
3. Maintain the 3-paragraph structure
4. Keep tone appropriate for persona
5. Ensure proper greeting and CTA format
6. Maintain 80-120 word count
7. Use 5th grade reading level

Return the optimized email:`

    const { text } = await generateText({
      model: openai("gpt-4"),
      prompt: optimizationPrompt,
    })

    return text.trim()
  } catch (error) {
    console.error('Error optimizing email:', error)
    return originalEmail
  }
}

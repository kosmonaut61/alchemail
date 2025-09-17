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
1. Check if the tone matches the samples (casual vs professional) - be lenient, minor differences are OK
2. Verify greeting style matches ("Hey" vs "Hi") - only flag if completely wrong
3. Ensure structure follows 3-4 paragraph format - both are acceptable
4. Check if CTA style matches (soft questions vs commands) - Apollo link format is key
5. Verify sentence length and readability - flag only if very long sentences
6. Check for proper personalization - merge tags should be present

IMPORTANT: Only flag significant issues. Minor variations from samples are acceptable. Focus on major structural or tone problems.

Return a JSON array of issues found (be conservative - only flag real problems):
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
**ONLY FLAG CRITICAL ISSUES - Be very conservative and lenient**

1. **Subject Line**: 3-6 words, sentence case (only flag if way off)
2. **Greeting**: "Hey" for casual/interns, "Hi" for professionals (only flag if using "Dear")
3. **Structure**: Basic email structure with line breaks (only flag if completely broken)
4. **Word Count**: 100-150 words total (aim for 120-140 words - flag if under 100 or over 150)
5. **Tone**: Conversational tone (only flag if very formal or salesy)
6. **CTA**: Has some form of call-to-action (only flag if completely missing)
7. **Apollo Links**: CTA should be formatted as [text](https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min) (CRITICAL - always flag missing Apollo links)

**IMPORTANT: Only flag major problems. Minor variations are acceptable.**

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
        score -= 5  // Further reduced - only flag critical issues
        break
      case 'medium':
        score -= 2  // Much more lenient
        break
      case 'low':
        score -= 0  // No penalty for minor issues
        break
    }
  })
  
  // Bonus points for good emails (no high-priority issues)
  const highPriorityIssues = issues.filter(i => i.severity === 'high')
  if (highPriorityIssues.length === 0) {
    score += 10  // Bigger bonus for good emails
  }
  
  return Math.max(0, Math.min(100, score))
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

// Automatically fix and optimize email based on QA results
export async function autoFixEmail(
  originalEmail: string,
  qualityReport: EmailQualityReport,
  persona: string,
  painPoints: string[],
  contextItems: any[] = []
): Promise<{ fixedEmail: string; fixesApplied: string[] }> {
  const fixesApplied: string[] = []
  
  // If it already passes, return as-is
  if (qualityReport.passed) {
    return { fixedEmail: originalEmail, fixesApplied: ['No fixes needed - email meets quality standards'] }
  }
  
  try {
    // Get relevant samples for reference
    const samples = getEmailSamplesByPersona(persona)
    const samplesContext = samples ? `
REFERENCE SAMPLES FOR ${persona}:
${samples.emails.map((sample, index) => 
  `Sample ${index + 1}:
Subject: ${sample.subject}
Body: ${sample.body}`
).join('\n\n---\n\n')}` : ''

    const optimizationPrompt = `You are an expert email copywriter. Fix ALL issues in this email automatically and return a perfect version that follows all the rules.

ORIGINAL EMAIL TO FIX:
${originalEmail}

ISSUES TO FIX:
${qualityReport.issues.map(issue => 
  `- ${issue.type} (${issue.severity}): ${issue.message}${issue.suggestion ? ` → Fix: ${issue.suggestion}` : ''}`
).join('\n')}

PERSONA: ${persona}
PAIN POINTS: ${painPoints.join(', ')}

${samplesContext}

CRITICAL FIXING REQUIREMENTS:
1. Fix ALL high priority issues immediately
2. Fix ALL medium priority issues
3. Ensure subject line is 3-6 words, sentence case
4. Use proper greeting: "Hey [name]," for casual/interns, "Hi [name]," for professionals
5. Structure as 3 paragraphs: pain point → social proof → CTA question
6. Keep 80-120 words total, max 15 words per sentence
7. End with soft question CTA (not command)
8. Use 5th grade reading level
9. Match the tone and style of reference samples exactly
10. Include proper merge tags like {{contact.first_name}}, {{account.name}}, {{sender.meeting_alias}}
11. No signature, no excessive formatting
12. Include social proof with specific companies and results

Return ONLY the corrected email, no explanations:`

    const { text: fixedEmail } = await generateText({
      model: openai("gpt-4"),
      prompt: optimizationPrompt,
    })

    // Track what was fixed
    qualityReport.issues.forEach(issue => {
      fixesApplied.push(`Fixed ${issue.type} issue: ${issue.message}`)
    })

    return { 
      fixedEmail: fixedEmail.trim(), 
      fixesApplied: [...fixesApplied, 'Applied all quality improvements automatically']
    }
  } catch (error) {
    console.error('Error auto-fixing email:', error)
    return { fixedEmail: originalEmail, fixesApplied: ['Auto-fix failed, using original'] }
  }
}

// Double-check final email to ensure it meets all standards
export async function doubleCheckFinalEmail(
  email: string,
  persona: string,
  painPoints: string[]
): Promise<{ passed: boolean; finalEmail: string; additionalFixes: string[] }> {
  try {
    // Run final QA check
    const finalReport = await analyzeEmailQuality(email, persona, painPoints)
    
    if (finalReport.passed) {
      return { passed: true, finalEmail: email, additionalFixes: [] }
    }

    // If still not passing, do one final optimization pass
    const { fixedEmail, fixesApplied } = await autoFixEmail(email, finalReport, persona, painPoints)
    
    // One more quick check
    const finalCheck = await analyzeEmailQuality(fixedEmail, persona, painPoints)
    
    return {
      passed: finalCheck.passed,
      finalEmail: fixedEmail,
      additionalFixes: fixesApplied
    }
  } catch (error) {
    console.error('Error in double-check:', error)
    return { passed: false, finalEmail: email, additionalFixes: ['Double-check failed'] }
  }
}

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"
import { getPreamble } from "@/lib/preamble"
import { ContextItem } from "@/lib/context-repository"
import { getPersonaById } from "@/lib/personas"
import { EMAIL_SAMPLES, getEmailSamplesByPersona } from "@/lib/email-samples"
import { 
  analyzeEmailQuality, 
  autoFixEmail, 
  doubleCheckFinalEmail,
  getGenerationProgress,
  type EmailQualityReport 
} from "@/lib/email-qa"

export async function POST(request: NextRequest) {
  try {
    const { persona, signal, painPoints, contextItems, enableQA = true } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const preamble = await getPreamble()

    // Build dynamic context from selected items
    const dynamicContext = buildDynamicContext(contextItems || [])
    
    // Get detailed persona information
    const selectedPersona = getPersonaById(persona)
    const personaContext = selectedPersona ? `
## PERSONA-SPECIFIC CONTEXT:
- Role: ${selectedPersona.label}
- Department: ${selectedPersona.department}
- Seniority: ${selectedPersona.seniority}
- All Pain Points: ${selectedPersona.painPoints.join(', ')}
- Selected Pain Points: ${painPoints.join(', ')}
- Tone Profile: ${selectedPersona.toneProfile}
- Keywords: ${selectedPersona.keywords.join(', ')}
` : ''

    // Get relevant email samples for this persona
    const samples = getEmailSamplesByPersona(persona)
    const samplesContext = samples ? `

## EMAIL SAMPLES TO FOLLOW:
${samples.emails.map((sample, index) => 
  `Sample ${index + 1}:
Subject: ${sample.subject}
Body: ${sample.body}`
).join('\n\n---\n\n')}

**IMPORTANT**: Match the tone, structure, and style of these samples exactly.` : ''

    const prompt = `${preamble}

${dynamicContext}

${personaContext}

${samplesContext}

GENERATION REQUEST:
- Persona/Role: ${persona}
- Signal: ${signal}
- Selected Pain Points: ${painPoints.join(", ")}

CRITICAL INSTRUCTIONS - FOLLOW IN THIS EXACT ORDER:
1. ${samples ? 'COPY THE EXACT TONE AND STYLE OF THE PROVIDED SAMPLE EMAILS - use the same casual, conversational language, same sentence structure, same approach to statistics' : 'Use conversational, friendly tone - not formal or salesy'}
2. Address the SPECIFIC selected pain points: ${painPoints.join(", ")}
3. Match the seniority level and department context: ${selectedPersona?.seniority} in ${selectedPersona?.department}
4. Incorporate the signal content naturally into the email
5. Keep language simple and direct - avoid buzzwords like "impressive", "significant", "considerable", "enticing", "fancy"
6. Use ONE clear statistic per email, not multiple percentages
7. Make it sound like a real person wrote it, not a marketing department
8. EVERY EMAIL MUST END WITH AN APOLLO LINK CTA - format as [CTA text](https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min)
9. Write 70-100 words per email - expand on pain points and benefits to reach target length

${samples ? 'MOST IMPORTANT: Match the sample emails exactly in tone, style, and approach. Copy their natural, conversational feel.' : ''}

Generate a campaign with 3-5 emails + 2-3 LinkedIn messages. Format as:
Campaign Name: [Name]

Email 1 (Day 0):
Subject: [subject]

[email body with proper line breaks between paragraphs]

Email 2 (Day 3):
Subject: [subject]

[email body with proper line breaks between paragraphs]

LinkedIn Message 1 (Day 1):
[message]

LinkedIn Message 2 (Day 5):
[message]

Continue pattern...

CRITICAL FORMATTING REQUIREMENTS:
- EVERY EMAIL MUST BE 70-100 WORDS (aim for 70-80 words minimum)
- Include proper line breaks between EVERY paragraph in emails
- EVERY EMAIL MUST END WITH AN APOLLO LINK CTA - NO EXCEPTIONS
- Apollo link format: [CTA text](https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min)
- Example CTAs: "Put some time on my calendar?", "Set up a quick chat?", "How about we hop on a call?"
- NEVER use generic CTAs like "Let's chat", "Let's discuss", "Let's connect"
- Make output ready to paste directly into CRM/marketing tools
- Each email should have clean paragraph breaks, not run-on text
- NO EMAIL IS COMPLETE WITHOUT AN APOLLO LINK CTA`

    // Generate initial email
    const { text: initialEmail } = await generateText({
      model: openai("gpt-4"),
      prompt,
    })

    let finalEmail = initialEmail
    let qualityReport: EmailQualityReport | null = null
    let fixesApplied: string[] = []

    // Run QA and auto-fix if enabled
    if (enableQA) {
      qualityReport = await analyzeEmailQuality(initialEmail, persona, painPoints)
      
      // Auto-fix issues if quality is below threshold
      if (!qualityReport.passed) {
        const { fixedEmail, fixesApplied: appliedFixes } = await autoFixEmail(
          initialEmail, 
          qualityReport, 
          persona, 
          painPoints, 
          contextItems
        )
        finalEmail = fixedEmail
        fixesApplied = appliedFixes
        
        // Double-check the final result
        const doubleCheck = await doubleCheckFinalEmail(finalEmail, persona, painPoints)
        finalEmail = doubleCheck.finalEmail
        fixesApplied = [...fixesApplied, ...doubleCheck.additionalFixes]
        
        // Get final quality report
        qualityReport = await analyzeEmailQuality(finalEmail, persona, painPoints)
      }
    }

    return NextResponse.json({ 
      email: finalEmail,
      qualityReport,
      originalEmail: enableQA ? initialEmail : undefined,
      optimized: enableQA && fixesApplied.length > 0,
      fixesApplied: fixesApplied
    })
  } catch (error) {
    console.error("Error generating email:", error)
    return NextResponse.json({ error: "Failed to generate email" }, { status: 500 })
  }
}

function buildDynamicContext(contextItems: ContextItem[]): string {
  if (!contextItems || contextItems.length === 0) {
    return ""
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

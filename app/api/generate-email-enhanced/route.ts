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
    const { persona, signal, painPoints, contextItems, enableQA = true, model = "gpt-4o" } = await request.json()

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

PRIMARY INSTRUCTION: The campaign signal is your main guide - use it as the foundation for everything you write.

CAMPAIGN SIGNAL FOCUS:
"${signal}"

Use this signal to:
- Determine the campaign theme and messaging
- Guide the tone and approach
- Shape the pain points you address
- Influence the customer examples you use
- Drive the overall narrative across ALL emails and messages

CRITICAL: EVERY email and LinkedIn message must reference and build on this signal. Create a cohesive story arc where the signal is the connecting thread throughout the entire campaign. Don't let the signal fade after the first email - it should be the reason you're reaching out in every communication.

SUPPORTING GUIDELINES:
1. ${samples ? 'Match the tone and style of sample emails when relevant to the signal' : 'Use conversational, friendly tone that fits the signal context'}
2. Address pain points that align with the signal: ${painPoints.join(", ")}
3. Match the persona context: ${selectedPersona?.seniority} in ${selectedPersona?.department}
4. Make it sound like a real person wrote it, not marketing copy
5. EVERY EMAIL MUST HAVE AN APOLLO LINK CTA that flows naturally in the sentence - can be anywhere in the email, format as [CTA text](https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min)
6. Be creative and compelling - focus on the signal story first, word count will be optimized later

${samples ? 'MOST IMPORTANT: Match the sample emails exactly in tone, style, and approach. Copy their natural, conversational feel.' : ''}

Generate a campaign with 3-5 emails + 2-3 LinkedIn messages where EVERY communication references the campaign signal. Format as:
Campaign Name: [Name]

Email 1 (Day 0):
Subject: [subject]

[email body with proper line breaks between paragraphs]
[CTA with Apollo link: [CTA text](https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min)]

Email 2 (Day 3):
Subject: [subject]

[email body with proper line breaks between paragraphs]
[CTA with Apollo link: [CTA text](https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min)]

LinkedIn Message 1 (Day 1):
[message]

LinkedIn Message 2 (Day 5):
[message]

Continue pattern...

FORMATTING REQUIREMENTS:
- Include proper line breaks between EVERY paragraph in emails
- EVERY EMAIL MUST HAVE AN APOLLO LINK CTA that flows naturally in the sentence - NO EXCEPTIONS
- Apollo link format: [CTA text](https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min)
- Example CTAs that flow naturally: "[Want to chat about this?](link)", "[Sound like something that could help?](link)", "[Worth a quick call?](link)"
- NEVER use formal language like "kindly" - keep it conversational and relaxed
- Make output ready to paste directly into CRM/marketing tools
- Each email should have clean paragraph breaks, not run-on text
- NO EMAIL IS COMPLETE WITHOUT AN APOLLO LINK CTA

FOCUS ON CREATING COMPELLING CONTENT BASED ON THE CAMPAIGN SIGNAL - WORD COUNT WILL BE OPTIMIZED BY THE QA SYSTEM`

    // Generate initial email
    const { text: initialEmail } = await generateText({
      model: openai(model),
      prompt,
    })

    let finalEmail = initialEmail
    let qualityReport: EmailQualityReport | null = null
    let fixesApplied: string[] = []

    // Run QA and auto-fix if enabled
    if (enableQA) {
      qualityReport = await analyzeEmailQuality(initialEmail, persona, painPoints, model)
      
      // Auto-fix issues if quality is below threshold
      if (!qualityReport.passed) {
        const { fixedEmail, fixesApplied: appliedFixes } = await autoFixEmail(
          initialEmail, 
          qualityReport, 
          persona, 
          painPoints, 
          contextItems,
          model
        )
        finalEmail = fixedEmail
        fixesApplied = appliedFixes
        
        // Double-check the final result
        const doubleCheck = await doubleCheckFinalEmail(finalEmail, persona, painPoints, model)
        finalEmail = doubleCheck.finalEmail
        fixesApplied = [...fixesApplied, ...doubleCheck.additionalFixes]
        
        // Get final quality report
        qualityReport = await analyzeEmailQuality(finalEmail, persona, painPoints, model)
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

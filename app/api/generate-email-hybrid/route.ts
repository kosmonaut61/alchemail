import { NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { runWithGpt5 } from "@/lib/cursor-gpt5-switcher"
import { analyzeEmailQuality, autoFixEmail, doubleCheckFinalEmail } from "@/lib/email-qa"
// buildDynamicContext function will be defined locally
import { getPersonaById } from "@/lib/personas"
import { getPreamble } from "@/lib/preamble"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { persona, signal, painPoints, contextItems, enableQA = true, model = "gpt-5" } = body

    console.log('🚀 ===== HYBRID EMAIL GENERATION START =====')
    console.log('📝 Request:', { persona, signal, painPoints: painPoints?.length, contextItems: contextItems?.length, enableQA, model })

    // Build context and persona info
    const dynamicContext = buildDynamicContext(contextItems || [])
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
    const preamble = getPreamble()

    // Batch 1: Generate Email 1 + LinkedIn Message 1
    console.log('📧 Starting Batch 1: Email 1 + LinkedIn Message 1')
    const batch1Result = await generateBatch1({
      persona,
      signal,
      painPoints,
      dynamicContext,
      personaContext,
      preamble,
      enableQA,
      model
    })

    // Batch 2: Generate Emails 2-4 + LinkedIn Message 2 (parallel)
    console.log('📧 Starting Batch 2: Emails 2-4 + LinkedIn Message 2')
    const batch2Result = await generateBatch2({
      persona,
      signal,
      painPoints,
      dynamicContext,
      personaContext,
      preamble,
      enableQA,
      model
    })

    // Combine results
    const fullSequence = {
      email1: batch1Result.email1,
      linkedin1: batch1Result.linkedin1,
      email2: batch2Result.email2,
      email3: batch2Result.email3,
      email4: batch2Result.email4,
      linkedin2: batch2Result.linkedin2
    }

    // Create the full email sequence string
    const fullEmailSequence = `Campaign Name: ${signal}

${fullSequence.email1}

${fullSequence.email2}

${fullSequence.email3}

${fullSequence.email4}

LinkedIn Message 1:
${fullSequence.linkedin1}

LinkedIn Message 2:
${fullSequence.linkedin2}`

    console.log('✅ Hybrid generation complete!')
    console.log('📊 Total emails generated:', 4)
    console.log('📊 LinkedIn messages generated:', 2)

    return NextResponse.json({
      email: fullEmailSequence,
      batch1: batch1Result,
      batch2: batch2Result,
      hybrid: true,
      totalBatches: 2,
      generationTime: Date.now()
    })

  } catch (error) {
    console.error("❌ ===== HYBRID GENERATION ERROR ======")
    console.error("❌ Error:", error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Failed to generate email sequence",
        hybrid: true
      },
      { status: 500 }
    )
  }
}

async function generateBatch1({
  persona,
  signal,
  painPoints,
  dynamicContext,
  personaContext,
  preamble,
  enableQA,
  model
}: any) {
  const prompt = `${preamble}

${dynamicContext}

${personaContext}

SIGNAL: ${signal}

PAIN POINTS: ${painPoints?.join(', ') || 'Not specified'}

Generate ONLY the first email and first LinkedIn message for this sequence:

EMAIL 1 (Day 0):
- Subject line
- Opening that acknowledges their pain point
- Value proposition
- Social proof (case study)
- Single, clear CTA
- Professional closing

LINKEDIN MESSAGE 1 (Day 1):
- Brief, personalized message
- Reference to the signal
- Soft CTA for connection

Make this email focused, concise, and directly address their pain points.`

  console.log('🤖 Generating Batch 1 with model:', model)
  
  let email1: string
  let linkedin1: string
  
  if (model.startsWith('gpt-5')) {
    const result = await runWithGpt5(prompt)
    console.log(`✅ Batch 1 generated with ${result.model}`)
    const content = result.text
    
    // Split the content into email and LinkedIn parts
    const parts = content.split('LINKEDIN MESSAGE 1')
    email1 = parts[0]?.trim() || content
    linkedin1 = parts[1]?.trim() || 'Hi {{contact.first_name}}, following up on our conversation about ' + signal
  } else {
    email1 = await generateTextWithModel(prompt, model)
    linkedin1 = 'Hi {{contact.first_name}}, following up on our conversation about ' + signal
  }

  // QA for Batch 1
  let qualityReport1 = null
  let optimizedEmail1 = email1
  let fixesApplied1: string[] = []

  if (enableQA) {
    console.log('🔍 Running QA for Batch 1...')
    try {
      qualityReport1 = await analyzeEmailQuality(email1, persona)
      if (qualityReport1 && qualityReport1.score < 80) {
        console.log('🔧 Auto-fixing Batch 1...')
        optimizedEmail1 = await autoFixEmail(email1, qualityReport1, persona)
        fixesApplied1 = qualityReport1.issues?.slice(0, 3).map((issue: any) => issue.message) || []
      }
    } catch (qaError) {
      console.warn('⚠️ QA failed for Batch 1, using original:', qaError)
    }
  }

  return {
    email1: optimizedEmail1,
    linkedin1,
    qualityReport1,
    fixesApplied1,
    originalEmail1: email1
  }
}

async function generateBatch2({
  persona,
  signal,
  painPoints,
  dynamicContext,
  personaContext,
  preamble,
  enableQA,
  model
}: any) {
  const prompt = `${preamble}

${dynamicContext}

${personaContext}

SIGNAL: ${signal}

PAIN POINTS: ${painPoints?.join(', ') || 'Not specified'}

Generate emails 2, 3, 4 and the second LinkedIn message for this sequence:

EMAIL 2 (Day 3):
- Follow-up on the first email
- Different angle on the pain point
- Additional social proof
- Clear CTA

EMAIL 3 (Day 7):
- Address objections or concerns
- Deeper value proposition
- Case study or example
- Soft CTA

EMAIL 4 (Day 11):
- Final follow-up
- Urgency or next steps
- Clear action item
- Strong CTA

LINKEDIN MESSAGE 2 (Day 5):
- Brief follow-up message
- Reference to previous touchpoints
- Soft CTA

Make each email distinct but cohesive with the overall sequence.`

  console.log('🤖 Generating Batch 2 with model:', model)
  
  let batch2Content: string
  
  if (model.startsWith('gpt-5')) {
    const result = await runWithGpt5(prompt)
    console.log(`✅ Batch 2 generated with ${result.model}`)
    batch2Content = result.text
  } else {
    batch2Content = await generateTextWithModel(prompt, model)
  }

  // Parse the batch 2 content
  const parts = batch2Content.split(/(EMAIL \d+|LINKEDIN MESSAGE 2)/)
  let email2 = '', email3 = '', email4 = '', linkedin2 = ''
  
  for (let i = 0; i < parts.length; i++) {
    if (parts[i]?.includes('EMAIL 2')) {
      email2 = parts[i + 1]?.trim() || ''
    } else if (parts[i]?.includes('EMAIL 3')) {
      email3 = parts[i + 1]?.trim() || ''
    } else if (parts[i]?.includes('EMAIL 4')) {
      email4 = parts[i + 1]?.trim() || ''
    } else if (parts[i]?.includes('LINKEDIN MESSAGE 2')) {
      linkedin2 = parts[i + 1]?.trim() || ''
    }
  }

  // QA for Batch 2
  let qualityReport2 = null
  let optimizedEmail2 = email2
  let optimizedEmail3 = email3
  let optimizedEmail4 = email4
  let fixesApplied2: string[] = []

  if (enableQA) {
    console.log('🔍 Running QA for Batch 2...')
    try {
      const batch2Combined = `${email2}\n\n${email3}\n\n${email4}`
      qualityReport2 = await analyzeEmailQuality(batch2Combined, persona)
      if (qualityReport2 && qualityReport2.score < 80) {
        console.log('🔧 Auto-fixing Batch 2...')
        const optimized = await autoFixEmail(batch2Combined, qualityReport2, persona)
        const optimizedParts = optimized.split(/\n\n/)
        optimizedEmail2 = optimizedParts[0] || email2
        optimizedEmail3 = optimizedParts[1] || email3
        optimizedEmail4 = optimizedParts[2] || email4
        fixesApplied2 = qualityReport2.issues?.slice(0, 3).map((issue: any) => issue.message) || []
      }
    } catch (qaError) {
      console.warn('⚠️ QA failed for Batch 2, using original:', qaError)
    }
  }

  return {
    email2: optimizedEmail2,
    email3: optimizedEmail3,
    email4: optimizedEmail4,
    linkedin2,
    qualityReport2,
    fixesApplied2,
    originalEmail2: email2,
    originalEmail3: email3,
    originalEmail4: email4
  }
}

// Helper function for non-GPT-5 models
async function generateTextWithModel(prompt: string, model: string): Promise<string> {
  const { text } = await generateText({
    model: openai(model, {
      apiKey: process.env.OPENAI_API_KEY,
    }),
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: 0.7,
    topP: 0.9,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1,
  })

  return text
}

// Build dynamic context from selected items
function buildDynamicContext(contextItems: any[]): string {
  if (!contextItems || contextItems.length === 0) {
    return ""
  }

  const contextByCategory = contextItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, any[]>)

  let contextString = ""

  // Add customers
  if (contextByCategory.customer) {
    contextString += "CUSTOMERS:\n"
    contextByCategory.customer.forEach(customer => {
      contextString += `- ${customer.title}: ${customer.content}\n`
    })
    contextString += "\n"
  }

  // Add case studies
  if (contextByCategory.case_study) {
    contextString += "CASE STUDIES:\n"
    contextByCategory.case_study.forEach(study => {
      contextString += `- ${study.title}: ${study.content}\n`
    })
    contextString += "\n"
  }

  // Add value propositions
  if (contextByCategory.value_prop) {
    contextString += "VALUE PROPOSITIONS:\n"
    contextByCategory.value_prop.forEach(prop => {
      contextString += `- ${prop.title}: ${prop.content}\n`
    })
    contextString += "\n"
  }

  // Add statistics
  if (contextByCategory.statistic) {
    contextString += "STATISTICS:\n"
    contextByCategory.statistic.forEach(stat => {
      contextString += `- ${stat.title}: ${stat.content}\n`
    })
    contextString += "\n"
  }

  // Add quotes
  if (contextByCategory.quote) {
    contextString += "QUOTES:\n"
    contextByCategory.quote.forEach(quote => {
      contextString += `- ${quote.title}: ${quote.content}\n`
    })
    contextString += "\n"
  }

  return contextString
}

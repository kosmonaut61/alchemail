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
import { runWithGpt5 } from "@/lib/cursor-gpt5-switcher"

// Import only the function we need to avoid circular dependencies
import { generateWithGPT5, generateWithGPT5Responses } from "@/lib/openai-models"

// Helper function to generate text with proper API for each model
async function generateTextWithModel(prompt: string, model: string): Promise<string> {
  if (model.startsWith('gpt-5')) {
    // Use the fixed GPT-5 Responses API for email generation
    console.log(`Using fixed GPT-5 Responses API for email generation with model: ${model}`)
    return await generateWithGPT5Responses(prompt, model)
  } else if (model.startsWith('o1')) {
    // For O1 models, use standard generateText with specific parameters
    console.log(`Using O1 model for email generation: ${model}`)
    
    const result = await generateText({
      model: openai(model),
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.1 // O1 models work better with lower temperature
    })
    return result.text
  } else {
    // Use the new function for other models (GPT-4, GPT-3.5, etc.)
    console.log(`Using standard model for email generation: ${model}`)
    return await generateWithGPT5(prompt, model)
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 POST handler called')
  
  // Generate a unique session ID for this generation
  const sessionId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  try {
    console.log('🏁 About to call processRequest...')
    const result = await processRequest(request, sessionId)
    console.log('✅ processRequest completed')
    
    // Status cleanup disabled to prevent fetch issues
    
    return result
  } catch (error) {
    console.error('❌ API Error:', error)
    
    // Status cleanup disabled to prevent fetch issues
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }, { status: 500 })
  }
}

async function processRequest(request: NextRequest, sessionId: string) {
  try {
    console.log('🚀 Starting processRequest...')
    
    // Helper function to update status (simplified to avoid fetch issues)
    const updateStatus = async (status: string, progress: number, message: string) => {
      console.log(`📊 STATUS UPDATE: ${status} (${progress}%) - ${message}`)
      // Note: Status updates disabled to prevent 504 timeouts
      // The frontend will show progress based on the generation process
    }
    
    const { persona, signal, painPoints, contextItems, enableQA = false, model = "gpt-5" } = await request.json()
    console.log('📝 Parsed request data')
    
    // Update status: Starting generation
    await updateStatus('initializing', 5, 'Preparing email generation...')

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }
    console.log('✅ API key found')

    // Log the model being used for debugging
    console.log(`Using model: ${model}`)
    
    // Check if model is GPT-5 and log potential issues
    if (model.startsWith('gpt-5')) {
      console.log('Warning: GPT-5 model selected - this may not be available yet or may timeout')
    }

    console.log('📖 Getting preamble...')
    await updateStatus('building_context', 15, 'Building email context and structure...')
    const preamble = await getPreamble()
    console.log('✅ Preamble loaded')

    // Build dynamic context from selected items
    console.log('🔧 Building dynamic context...')
    const dynamicContext = buildDynamicContext(contextItems || [])
    console.log('✅ Dynamic context built')
    
    await updateStatus('generating', 25, 'Generating initial email sequence...')
    
    // Get detailed persona information
    console.log('👤 Getting persona info...')
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
    console.log('📧 Getting email samples...')
    const samples = getEmailSamplesByPersona(persona)
    console.log('✅ Email samples retrieved')
    
    console.log('🔧 Building samples context...')
    const samplesContext = samples ? `

## EMAIL SAMPLES TO FOLLOW:
${samples.emails.map((sample, index) => 
  `Sample ${index + 1}:
Subject: ${sample.subject}
Body: ${sample.body}`
).join('\n\n---\n\n')}

**IMPORTANT**: Match the tone, structure, and style of these samples exactly.` : ''
    console.log('✅ Samples context built')

    console.log('📝 Building final prompt...')
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
5. EVERY EMAIL MUST HAVE AN APOLLO LINK CTA that flows naturally in the sentence - can be anywhere in the email, format as [CTA text](https://app.apollo.io/#/meet/managed-meetings/{{sender_meeting_alias}}/n9l-1si-q4y/30-min)
   CRITICAL: Apollo links MUST use {{sender_meeting_alias}} (with underscore) - NEVER use {{sender.meeting.alias}} (with dot)
6. Be creative and compelling - focus on the signal story first, word count will be optimized later
7. FOCUS ON 1-2 SPECIFIC PAIN POINTS per email - avoid repeating the same pain point phrases across emails
8. NEVER use generic pain point phrases like "steep learning curve" in multiple emails
9. SINGLE PAIN POINT VARIATION: If only 1 pain point exists, use different angles per email:
   - Email 1: Core challenge (e.g., "steep learning curve")
   - Email 2: Related aspects (e.g., "complex processes", "new systems")
   - Email 3: Impact/consequences (e.g., "time-consuming", "overwhelming") 
   - Email 4: Solutions/outcomes (e.g., "streamlined approach", "simplified process")
10. CRITICAL: VARY PAIN POINT PHRASING - Use different ways to express the same concept:
    - Instead of "steep learning curve" → try "complex processes", "new systems to master", "ramping up quickly", "getting up to speed", "learning the ropes"
    - Instead of "time-consuming" → try "takes forever", "eats up hours", "slows everything down", "bogs down the process"
    - Instead of "overwhelming" → try "a lot to take in", "information overload", "feels like drinking from a firehose", "can be daunting"

${samples ? 'MOST IMPORTANT: Match the sample emails exactly in tone, style, and approach. Copy their natural, conversational feel.' : ''}

Generate a campaign with 3-5 emails + 2-3 LinkedIn messages where EVERY communication references the campaign signal. Format as:
Campaign Name: [Name]

Email 1 (Day 0):
Subject: [subject]

[email body with proper line breaks between paragraphs]
[CTA with Apollo link: [CTA text](https://app.apollo.io/#/meet/managed-meetings/{{sender_meeting_alias}}/n9l-1si-q4y/30-min)]

Email 2 (Day 3):
Subject: [subject]

[email body with proper line breaks between paragraphs]
[CTA with Apollo link: [CTA text](https://app.apollo.io/#/meet/managed-meetings/{{sender_meeting_alias}}/n9l-1si-q4y/30-min)]

LinkedIn Message 1 (Day 1):
[message]

LinkedIn Message 2 (Day 5):
[message]

Continue pattern...

FORMATTING REQUIREMENTS:
- Include proper line breaks between EVERY paragraph in emails
- EVERY EMAIL MUST HAVE AN APOLLO LINK CTA that flows naturally in the sentence - NO EXCEPTIONS
- Apollo link format: [CTA text](https://app.apollo.io/#/meet/managed-meetings/{{sender_meeting_alias}}/n9l-1si-q4y/30-min)
- CRITICAL: Apollo links MUST use {{sender_meeting_alias}} (with underscore) - NEVER use {{sender.meeting.alias}} (with dot)
- Example CTAs that flow naturally: "[Want to chat about this?](link)", "[Sound like something that could help?](link)", "[Worth a quick call?](link)"
- NEVER use formal language like "kindly" - keep it conversational and relaxed
- Make output ready to paste directly into CRM/marketing tools
- Each email should have clean paragraph breaks, not run-on text
- NO EMAIL IS COMPLETE WITHOUT AN APOLLO LINK CTA

FOCUS ON CREATING COMPELLING CONTENT BASED ON THE CAMPAIGN SIGNAL - WORD COUNT WILL BE OPTIMIZED BY THE QA SYSTEM`
    console.log('✅ Final prompt built')

    // Generate initial email with simplified approach
    console.log('\n🚀 ===== EMAIL GENERATION START =====')
    console.log(`📧 Model: ${model}`)
    console.log(`👤 Persona: ${persona}`)
    console.log(`📝 Signal: ${signal}`)
    console.log(`🎯 Pain Points: ${painPoints.join(', ')}`)
    console.log(`📊 Context Items: ${contextItems?.length || 0} selected`)
    console.log(`🔧 QA Enabled: ${enableQA}`)
    console.log(`📏 Prompt Length: ${prompt.length} characters`)
    
    // Use the working chatbot approach for reliability
    let initialEmail: string
    try {
      if (model.startsWith('gpt-5')) {
        // Force GPT-5-nano for fastest, most reliable generation
        console.log(`🤖 Using GPT-5-nano for fast generation...`)
        const result = await runWithGpt5(prompt)
        console.log(`✅ Successfully used ${result.model}`)
        initialEmail = result.text
      } else {
        // For other models, use the existing function
        console.log(`🤖 Using standard model approach...`)
        initialEmail = await generateTextWithModel(prompt, model)
      }
    } catch (error) {
      console.error(`❌ Error with model ${model}:`, error)
      
      // Fallback to GPT-4o if any model fails
      if (model !== 'gpt-4o') {
        console.log('🔄 Falling back to GPT-4o...')
        const { text } = await generateText({
          model: openai('gpt-4o'),
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
        })
        initialEmail = text
        console.log(`✅ Fallback successful with GPT-4o`)
      } else {
        throw error
      }
    }
    
    console.log(`✅ Generation successful with ${model}`)
    console.log(`📊 Generated content length: ${initialEmail.length} characters`)
    console.log(`🎯 ===== INITIAL SEQUENCE GENERATION COMPLETE =====`)
    
    await updateStatus('initial_complete', 50, 'Initial sequence generated successfully!')

    let finalEmail = initialEmail
    let qualityReport: EmailQualityReport | null = null
    let fixesApplied: string[] = []

    // Run QA and auto-fix if enabled
    if (enableQA) {
      console.log('\n🔍 ===== QA ANALYSIS START =====')
      console.log(`🤖 QA Model: ${model}`)
      console.log(`📊 Analyzing email quality...`)
      
      await updateStatus('qa_analysis', 60, 'Verifying initial sequence quality...')
      
      try {
        // No timeout - let QA take as long as it needs
        qualityReport = await analyzeEmailQuality(initialEmail, persona, painPoints, model)
        
        console.log(`📈 Quality Score: ${qualityReport.score}/100`)
        console.log(`✅ Passed: ${qualityReport.passed}`)
        console.log(`📋 Issues Found: ${qualityReport.issues.length}`)
        
      } catch (qaError) {
        console.log(`⚠️ QA error: ${qaError instanceof Error ? qaError.message : 'Unknown error'}`)
        console.log(`🔄 Skipping QA analysis due to error`)
        qualityReport = null
      }
      
      if (qualityReport && qualityReport.issues.length > 0) {
        console.log(`🔧 Issues to fix:`)
        qualityReport.issues.forEach((issue, index) => {
          console.log(`  ${index + 1}. [${issue.severity.toUpperCase()}] ${issue.type}: ${issue.message}`)
        })
      }
      
      // Auto-fix issues if quality is below threshold
      if (qualityReport && !qualityReport.passed) {
        try {
          console.log(`\n🔧 ===== AUTO-FIX START =====`)
          console.log(`🤖 Auto-fix Model: ${model}`)
          console.log(`📝 Applying fixes to email...`)
          
          await updateStatus('auto_fixing', 75, 'Applying quality improvements...')
          
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
          
          console.log(`✅ Auto-fix completed`)
          console.log(`📊 Fixed content length: ${finalEmail.length} characters`)
          console.log(`🔧 Fixes applied: ${appliedFixes.length}`)
          appliedFixes.forEach((fix, index) => {
            console.log(`  ${index + 1}. ${fix}`)
          })
          
          // Double-check the final result
          console.log(`\n🔍 ===== DOUBLE-CHECK START =====`)
          console.log(`🤖 Double-check Model: ${model}`)
          console.log(`📝 Double-checking final email...`)
          
          const doubleCheck = await doubleCheckFinalEmail(finalEmail, persona, painPoints, model)
          finalEmail = doubleCheck.finalEmail
          fixesApplied = [...fixesApplied, ...doubleCheck.additionalFixes]
          
          console.log(`✅ Double-check completed`)
          console.log(`📊 Final content length: ${finalEmail.length} characters`)
          console.log(`🔧 Additional fixes: ${doubleCheck.additionalFixes.length}`)
          
          // Get final quality report
          console.log(`\n📈 ===== FINAL QA ANALYSIS =====`)
          console.log(`🤖 Final QA Model: ${model}`)
          console.log(`📝 Running final quality check...`)
          
          qualityReport = await analyzeEmailQuality(finalEmail, persona, painPoints, model)
          
          console.log(`📈 Final Quality Score: ${qualityReport.score}/100`)
          console.log(`✅ Final Passed: ${qualityReport.passed}`)
          console.log(`📋 Final Issues: ${qualityReport.issues.length}`)
          
        } catch (fixError) {
          console.log(`⚠️ Auto-fix error: ${fixError instanceof Error ? fixError.message : 'Unknown error'}`)
          console.log(`🔄 Skipping auto-fix due to error`)
        }
      } else if (qualityReport) {
        console.log(`✅ Email passed QA - no fixes needed`)
      }
    }

    console.log('\n🎉 ===== EMAIL GENERATION COMPLETE =====')
    console.log(`📧 Final Model Used: ${model}`)
    console.log(`📊 Final Content Length: ${finalEmail.length} characters`)
    console.log(`🔧 Total Fixes Applied: ${fixesApplied.length}`)
    console.log(`📈 Final Quality Score: ${qualityReport?.score || 'N/A'}/100`)
    console.log(`✅ QA Passed: ${qualityReport?.passed || 'N/A'}`)
    console.log(`📄 Final Content Preview (first 200 chars):`)
    console.log('─'.repeat(80))
    console.log(finalEmail.substring(0, 200) + (finalEmail.length > 200 ? '...' : ''))
    console.log('─'.repeat(80))
    console.log('🚀 ===== END =====\n')
    
    await updateStatus('complete', 100, 'Email sequence ready!')

    return NextResponse.json({ 
      email: finalEmail,
      qualityReport,
      originalEmail: initialEmail, // Always return the original email for comparison
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
  if (contextByCategory.resource) {
    context += "### Relevant Resources:\n"
    contextByCategory.resource.forEach(item => {
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

import { NextRequest, NextResponse } from 'next/server'
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { formatVariablesForPrompt } from '@/lib/dynamic-variables'
import { formatSamplesForPrompt } from '@/lib/email-samples'

async function getContextForOptimizer(signal: string, personaData: any, painPoints: string[]) {
  const { CONTEXT_REPOSITORY } = await import('@/lib/context-repository')
  
  // Get relevant context based on signal and persona
  const signalLower = signal.toLowerCase()
  const keywords = signalLower.split(/\s+/).filter(word => word.length > 3)
  
  // Find relevant context items
  const relevantItems = CONTEXT_REPOSITORY.filter(item => {
    const itemKeywords = item.keywords.map(k => k.toLowerCase())
    const itemContent = item.content.toLowerCase()
    
    return keywords.some(keyword => 
      itemKeywords.includes(keyword) || 
      itemContent.includes(keyword)
    ) || item.category === 'statistic' || item.category === 'quote'
  })
  
  // Prioritize statistics and quotes
  const prioritizedItems = [
    ...relevantItems.filter(item => item.category === 'statistic'),
    ...relevantItems.filter(item => item.category === 'quote'),
    ...relevantItems.filter(item => item.category === 'case_study'),
    ...relevantItems.filter(item => item.category === 'customer')
  ].slice(0, 6) // Limit to top 6 most relevant to avoid overwhelming
  
  return prioritizedItems.map(item => 
    `- ${item.title}: ${item.content}`
  ).join('\n')
}

export async function POST(request: NextRequest) {
  try {
    const { messageId, originalContent, type, signal, persona, painPoints } = await request.json()

    if (!messageId || !originalContent || !type) {
      return NextResponse.json(
        { error: 'Message ID, content, and type are required' },
        { status: 400 }
      )
    }

    // Get persona definition
    const { PERSONA_DEFINITIONS } = await import('@/lib/personas')
    const personaData = PERSONA_DEFINITIONS.find(p => p.id === persona)
    
    if (!personaData) {
      return NextResponse.json(
        { error: 'Invalid persona selected' },
        { status: 400 }
      )
    }

    console.log(`🔍 Optimizing ${type} message with GPT-5 nano: ${messageId}`)
    console.log('👤 Persona:', personaData.label)

    const optimizationPrompt = `You are an expert email and LinkedIn message optimizer specializing in B2B outreach. Using your advanced capabilities, optimize this message for maximum engagement and response rates.

ORIGINAL MESSAGE:
${originalContent}

CONTEXT:
- Message Type: ${type}
- Target Persona: ${personaData.label} (${personaData.department}, ${personaData.seniority})
- Signal: ${signal}
- Pain Points: ${painPoints.join(', ') || 'Not specified'}

SUCCESSFUL EMAIL EXAMPLES TO EMULATE:
${formatSamplesForPrompt(personaData.label)}

AVAILABLE CONTEXT FOR ENHANCEMENT:
${await getContextForOptimizer(signal, personaData, painPoints)}

OPTIMIZATION GUIDELINES:
1. Subtly integrate the signal naturally - don't make it obvious or forced
2. Enhance the value proposition using available context (quotes, statistics, case studies)
3. Strengthen the call-to-action
4. Ensure appropriate tone for the persona's seniority level
5. Better integrate the signal naturally
6. Address pain points more effectively
7. Improve subject line (for emails)
8. Make the message more compelling and actionable
9. Maintain professional tone while being engaging
10. Ensure proper formatting and structure
11. Use advanced psychological triggers for engagement
12. Optimize for emotional resonance and connection
13. Apply persuasion techniques appropriate for the persona
14. Enhance credibility and trust signals
15. Improve urgency and scarcity elements where appropriate
16. Make sure there is less than 3 adverbs in the message
17. Keep sentences naturally flowing - don't force them to be too short if it makes them choppy
18. Make sure there are natural line breaks in the message
19. Make sure the message is at a 5th grade reading level
20. PRESERVE the original's personality and warmth - don't strip out human elements
21. USE CUSTOMER QUOTES from available context to add credibility and emotional connection
22. VARY the content structure - don't use the same pattern as other messages
23. INCORPORATE different statistics and examples from the context repository
24. BE SELECTIVE with context - use 1-2 key stats/quote per message, not everything
25. KEEP messages concise and scannable - don't overwhelm with too many numbers

MESSAGE UNIQUENESS & VARIATION:
- Make each message completely unique and different from others
- Use different opening approaches (question, statement, story, direct value)
- Vary the structure and flow - don't follow the same template
- Use different stats, examples, and customer stories from the context repository
- Change the tone and approach for each message
- Avoid repetitive phrases like "I noticed you checked out" in every message
- Create distinct value propositions for each message
- Use different psychological triggers and persuasion techniques
- AVOID overused phrases like "great step", "smart move", "exactly what you need", "sounds like a smart move"
- Vary signal acknowledgments - use different ways to show appreciation
- Don't use the same connector phrases repeatedly - mix it up
- USE CUSTOMER QUOTES to add credibility and emotional connection
- AVOID repetitive phrases like "building an internal case" - find different ways to say this
- INCORPORATE different customer examples and success stories from the context
- BE SELECTIVE - use 1-2 key elements from context per message, not everything
- DON'T overwhelm with multiple statistics in one paragraph
- Choose the most relevant stat/quote for the message purpose

STRUCTURE & TONE OPTIMIZATION:
- Convert formal language to conversational tone
- Replace corporate jargon with direct, simple language
- Ensure proper merge field formatting ({{contact.first_name}}, {{account.name}}, etc.)
- Create naturally flowing sentences (don't force them to be too short)
- Add natural line breaks for readability
- Use active voice throughout
- Remove unnecessary words and phrases while preserving warmth
- Make the opening engaging but maintain conversational flow
- Ensure the CTA is hyperlinked and naturally integrated
- PRESERVE natural conversational flow - don't make sentences choppy or robotic
- MAINTAIN the warm, friendly tone of the original
- Keep the human, approachable feel - avoid being too sales-y or aggressive
- PRESERVE personality and warmth - don't strip out the human element
- PRESERVE the original's conversational connectors and natural flow
- Don't make the message too direct or choppy - keep it conversational

SPECIFIC IMPROVEMENTS TO MATCH SAMPLE QUALITY:
- Make the opening more direct and impactful 
- Add urgency and time sensitivity
- Include implementation details with stats
- Make CTAs more specific and benefit-focused
- Use more confident, assertive language ("I know", "We can", "That's why")
- Add credibility markers 
- Include company name in CTA for personalization ("help {{account.name}} achieve similar results")

TONE PRESERVATION (CRITICAL):
- MAINTAIN the warm, conversational tone of the original - this is the #1 priority
- Keep natural, flowing language - don't make it too aggressive or sales-y
- Preserve the friendly, approachable feel - don't strip out personality
- Don't shorten too much - maintain substance and warmth
- Keep the "human" element - write like you're talking to a colleague, not selling
- Maintain the supportive, helpful tone rather than being pushy or overly sales-focused
- PRESERVE personal touches and conversational connectors that create natural flow
- DON'T make emails choppy or robotic - maintain the original's personality and warmth
- AVOID repetitive phrases like "great step" - vary the language to keep it fresh
- Use different ways to acknowledge signals and show appreciation

SIGNAL INTEGRATION:
- Make signal references subtle and natural - avoid obvious statements like "That's a great sign you're exploring ROI"
- Don't over-analyze or comment on what they did - just acknowledge it naturally
- Avoid forced phrases like "ROI is top of mind" or "That's a great sign"
- Keep signal integration conversational and human, not analytical or robotic

VARIED OPENING APPROACHES:
- Message 1: "Thanks for checking our pricing page"
- Message 2: "Quick question about freight costs..."
- Message 3: "Dollar Tree just saved $6M - here's how"
- Message 4: "What if you could cut freight spend by 20%?"
- Message 5: "Most ops leaders I talk to struggle with..."
- LinkedIn 1: "Quick thought on freight optimization"
- LinkedIn 2: "Saw your team's focus on efficiency"
- LinkedIn 3: "One question about your freight processes"

Call-to-Action (CTA) Rules:
- Format CTAs as clickable hyperlinks: [CTA text](https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min)
- Keep CTA that flows naturally in the sentence - can be anywhere in the email, not just at the end

MERGE FIELD FORMATTING:
- Use dynamic variables for personalization (see list below)
- Always preserve merge field syntax exactly: {{variable.name}}
- Do NOT modify or break merge field formatting
- You can add new merge fields for personalization where appropriate

${formatVariablesForPrompt()}

For emails:
- Keep subject lines under 50 characters
- Use proper email formatting with clear sections
- Include strong value proposition early
- End with clear, specific call-to-action
- Keep emails concise (100-150 words max)
- Do NOT add signatures, sign-offs, or contact information
- Make messages longer if they need to be to be between 100-150 words

For LinkedIn messages:
- Keep under 100 words
- Start with personal connection or value
- Be conversational but professional
- End with clear next steps
- Do NOT add signatures, sign-offs, or contact information
- Do NOT make messages longer than the original

CRITICAL: Do NOT add signatures, contact information, or make messages longer. Keep the same length or shorter than the original. Return the optimized message with the same format as the original. Focus on improvements that will increase open rates, response rates, and engagement.

QUALITY TARGET: Match the tone, confidence, and impact of the successful email examples provided. Use the same direct, confident language patterns. Make the message feel as polished and compelling as the sample emails.

IMPORTANT: Preserve the warm, conversational tone of the original. Don't make emails too short or aggressive. Maintain the friendly, human element while improving structure and flow.`

    // Custom GPT-5 nano optimization with fallback
    let optimizedContent: string
    
    try {
      console.log('🚀 Attempting optimization with GPT-5 nano...')
      
      const { text } = await generateText({
        model: openai('gpt-5-nano'),
        messages: [
          {
            role: 'system',
            content: 'You are an expert B2B message optimizer with advanced AI capabilities. You specialize in creating highly engaging, persuasive messages that drive responses and conversions. Always preserve merge field syntax ({{variable.name}}) exactly as provided. Do NOT add signatures, contact information, or make messages longer than the original.'
          },
          {
            role: 'user',
            content: optimizationPrompt
          }
        ],
        temperature: 0.7,
        topP: 0.9,
        frequencyPenalty: 0.1,
        presencePenalty: 0.1
      })
      
      optimizedContent = text
      console.log('✅ GPT-5 nano optimization successful')
      
    } catch (gpt5Error) {
      console.warn('⚠️ GPT-5 nano failed, falling back to GPT-4o-mini:', gpt5Error)
      
      // Fallback to GPT-4o-mini
      const { text } = await generateText({
        model: openai('gpt-4o-mini'),
        messages: [
          {
            role: 'system',
            content: 'You are an expert B2B message optimizer. Improve messages for maximum engagement while maintaining authenticity and professionalism. Always preserve merge field syntax ({{variable.name}}) exactly as provided. Do NOT add signatures, contact information, or make messages longer than the original.'
          },
          {
            role: 'user',
            content: optimizationPrompt
          }
        ],
        temperature: 0.7
      })
      
      optimizedContent = text
      console.log('✅ Fallback optimization with GPT-4o-mini successful')
    }
    
    if (!optimizedContent || optimizedContent.trim().length === 0) {
      throw new Error('No optimized content received from OpenAI')
    }

    console.log('✅ Message optimized successfully')
    console.log('📄 Optimized content length:', optimizedContent.length)
    console.log('📄 Optimized content preview:', optimizedContent.substring(0, 200) + '...')

    return NextResponse.json({
      success: true,
      messageId,
      optimizedContent,
      originalContent,
      optimizations: [
        'Improved clarity and readability',
        'Enhanced value proposition',
        'Strengthened call-to-action',
        'Better signal integration',
        'Advanced psychological triggers',
        'Emotional resonance optimization',
        'Persuasion techniques applied',
        'Credibility and trust signals enhanced'
      ]
    })

  } catch (error) {
    console.error('❌ Error optimizing message:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to optimize message',
        details: 'Please try again'
      },
      { status: 500 }
    )
  }
}

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
    const itemKeywords = (item.keywords || []).map(k => k.toLowerCase())
    const itemContent = item.content.toLowerCase()
    
    return keywords.some(keyword => 
      itemKeywords.includes(keyword) || 
      itemContent.includes(keyword)
    ) || item.category === 'statistic' || item.category === 'quote' || item.category === 'value_prop'
  })
  
  // Add persona-specific context
  const personaSpecificItems = CONTEXT_REPOSITORY.filter(item => 
    item.persona?.includes(personaData.id) ||
    (item.category === 'language_style' && item.persona?.includes(personaData.id))
  )
  
  // Add pain point specific context
  const painPointItems = CONTEXT_REPOSITORY.filter(item => 
    item.category === 'pain_points' && (
      item.persona?.includes(personaData.id) ||
      painPoints.some(pp => item.content.toLowerCase().includes(pp.toLowerCase()))
    )
  )
  
  // Prioritize statistics, quotes, and value props, then case studies, customers, persona-specific, and pain point context
  const prioritizedItems = [
    ...relevantItems.filter(item => item.category === 'statistic'),
    ...relevantItems.filter(item => item.category === 'quote'),
    ...relevantItems.filter(item => item.category === 'value_prop'),
    ...relevantItems.filter(item => item.category === 'resource'),
    ...relevantItems.filter(item => item.category === 'customer'),
    ...personaSpecificItems,
    ...painPointItems
  ].slice(0, 5) // Limit to top 5 most relevant to avoid overwhelming and maintain focus
  
  return prioritizedItems.map(item => 
    `- ${item.title}: ${item.content}`
  ).join('\n')
}

export async function POST(request: NextRequest) {
  try {
    const { messageId, originalContent, type, signal, persona, painPoints, contextItems } = await request.json()

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

    console.log(`🔍 Optimizing ${type} message with GPT-5: ${messageId}`)
    console.log('👤 Persona:', personaData.label)

    const optimizationPrompt = `You are an expert email and LinkedIn message optimizer specializing in B2B outreach. Using your advanced capabilities, optimize this message for maximum engagement and response rates.

CRITICAL: Be CONSERVATIVE with changes. Preserve the original's conversation context, email references, and relationship flow. Only enhance what's already there - don't strip out important context or make follow-up messages sound like cold outreach.

ORIGINAL MESSAGE:
${originalContent}

CONTEXT:
- Message Type: ${type}
- Target Persona: ${personaData.label} (${personaData.department}, ${personaData.seniority})
- Signal: ${signal}
- Pain Points: ${painPoints.join(', ') || 'Not specified'}

SUCCESSFUL EMAIL EXAMPLES TO EMULATE:
${formatSamplesForPrompt(personaData.label)}

AVAILABLE CONTEXT FOR ENHANCEMENT (use strategically - focus on 1-2 primary items):
${contextItems && contextItems.length > 0 
  ? contextItems.map((item: any) => `- ${item.title}: ${item.content}`).join('\n')
  : await getContextForOptimizer(signal, personaData, painPoints)
}

CONTEXT DISTRIBUTION STRATEGY:
- Focus on 1-2 PRIMARY context items to avoid overwhelming the recipient
- Use different customer examples, statistics, or case studies strategically
- Avoid cramming multiple context items into one message
- Build credibility progressively with focused, digestible content

CUSTOMER LIST ITEMS AVAILABLE:
${contextItems && contextItems.length > 0 
  ? contextItems.filter((item: any) => item.category === 'customer').map((item: any) => `- ${item.title}: ${item.content}`).join('\n')
  : (await getContextForOptimizer(signal, personaData, painPoints)).split('\n').filter(line => line.includes('Customers')).join('\n')
}

IMPORTANT: If there are customer list items above, PRESERVE and ENHANCE companies from those lists instead of removing them.

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
21. CRITICAL: PRESERVE email references and conversation context - if the original mentions "the email I sent" or "following up on", KEEP those references
22. PRESERVE the original's conversation flow and relationship context - don't make follow-up messages sound like cold outreach
23. USE CUSTOMER QUOTES from available context to add credibility and emotional connection
24. VARY the content structure - don't use the same pattern as other messages
25. INCORPORATE different statistics and examples from the context repository
26. CRITICAL: Focus on 1-2 PRIMARY context items - avoid overwhelming recipients with too many examples, stats, or customer names
27. BE SELECTIVE with context - use 1-2 key stats/quote per message, not everything
28. KEEP messages concise and scannable - don't overwhelm with too many numbers
29. REPLACE ASSUMPTIONS WITH QUESTIONS: Instead of "I noticed you're focusing on..." say "Are you focusing on...?"
30. Turn presumptive statements into questions to avoid assumptions
31. PRESERVE CUSTOMER LISTS: If the original message mentions companies from customer lists (e.g., Honda, Bridgestone from Automotive Customers), KEEP them in the optimized version
32. ENHANCE CUSTOMER EXAMPLES: Don't remove customer list companies - instead, make them more compelling and relevant
33. MAINTAIN CONTEXT DIVERSITY: Preserve the variety of customer examples from different context items
34. AVOID CONTEXT OVERLOAD: Don't add more context items than the original message - focus on enhancing what's already there

MESSAGE UNIQUENESS & VARIATION:
- Make each message completely unique and different from others
- Use different opening approaches (question, statement, story, direct value)
- Vary the structure and flow - don't follow the same template
- Use different stats, examples, and customer stories from the context repository
- Change the tone and approach for each message
- Avoid repetitive phrases like "I noticed you checked out" in every message
- Create distinct value propositions for each message
- Use different psychological triggers and persuasion techniques
- NEVER use these overused phrases: "smart move", "simple move", "good move", "solid move", "right move", "great step", "exactly what you need"
- BANNED WORDS: "move", "moves" - find completely different ways to express these concepts
- Use varied, creative language - avoid repetitive phrases entirely
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

CONTEXT PRESERVATION (CRITICAL):
- PRESERVE all customer examples from the original message - don't remove Honda, Bridgestone, etc.
- ENHANCE customer list companies rather than removing them
- MAINTAIN the variety of context items used in the original
- DON'T strip out industry-specific customer examples for generic ones
- KEEP the original's context diversity and relevance

CONVERSATION CONTEXT PRESERVATION (CRITICAL):
- PRESERVE email references: "the email I sent", "following up on", "my previous email" - these are ESSENTIAL
- MAINTAIN follow-up context: if the original is a follow-up message, keep it as a follow-up
- PRESERVE relationship context: don't make ongoing conversations sound like cold outreach
- KEEP conversation flow: maintain the natural progression of the conversation
- PRESERVE timing references: "this week", "recently", "earlier" - these show conversation continuity

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
- NATURAL LINK INTEGRATION: Weave links naturally into sentences, not as entire sentence links
- Link only 2-4 key words in the middle of sentences, not entire phrases
- Make the link feel like a natural part of the conversation flow
- CRITICAL: Never show URLs as plain text - always wrap them in markdown link format [text](url)
- LINK TYPE RULES:
  * For MEETING/CALL requests: Use Apollo URL: [schedule a call](https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min)
  * For CASE STUDY sharing: Use ONLY actual case study URLs from context:
    - [Dollar Tree case study](https://www.emergemarket.com/resource/dollar-tree-study)
    - [Golden State Foods case study](https://www.emergemarket.com/resource/golden-state-foods-case-study)
    - [EZRack case study](https://www.emergemarket.com/resource/ezrack-case-study)
    - [Pepsi case study](https://www.emergemarket.com/resource/pepsi-bottling-case-study)
    - [Premier Carrier Program case study](https://www.emergemarket.com/resource/premier-carrier-case-study)
    - [DBIN case study](https://www.emergemarket.com/resource/dynamic-book-it-now-case-study)
  * For DEMO/PRESENTATION: Use Apollo URL: [book a demo](https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min)
- Examples of NATURAL link integration with correct URLs:
  * "Want to [schedule a call](https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min) to explore this further?"
  * "I can [share the Dollar Tree case study](https://www.emergemarket.com/resource/dollar-tree-study) with you."
  * "Would you like me to [send the Golden State Foods case study](https://www.emergemarket.com/resource/golden-state-foods-case-study) or [book a walkthrough](https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min)?"
- AVOID: Entire sentence links like "[Would you be open to a quick chat to explore this further?](url)"

FINAL FLOW REVIEW (CRITICAL):
After optimizing, do a final pass to ensure:
- Links flow naturally within sentences, not randomly placed
- Case study links are integrated contextually
- No orphaned links at the end of sentences without context
- Smooth transitions between ideas and paragraphs
- Natural conversation flow from start to finish
- Links feel intentional and purposeful, not tacked on


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
      
      // Log the complete prompt for auditing
      console.log('\n' + '='.repeat(80))
      console.log('🤖 OPENAI API CALL - MESSAGE OPTIMIZATION')
      console.log('='.repeat(80))
      console.log('📧 MODEL: gpt-5')
      console.log('🎯 PURPOSE: Optimize message for engagement')
      console.log('📝 MESSAGE ID:', messageId)
      console.log('📏 PROMPT LENGTH:', optimizationPrompt.length, 'characters')
      console.log('\n📝 COMPLETE PROMPT:')
      console.log('-'.repeat(60))
      console.log(optimizationPrompt)
      console.log('-'.repeat(60))
      console.log('='.repeat(80) + '\n')
      
      const { text } = await generateText({
        model: openai('gpt-5'),
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

      console.log('\n' + '='.repeat(80))
      console.log('✅ OPENAI API RESPONSE - MESSAGE OPTIMIZATION (GPT-5)')
      console.log('='.repeat(80))
      console.log('📧 MODEL: gpt-5')
      console.log('📝 MESSAGE ID:', messageId)
      console.log('📏 RESPONSE LENGTH:', text.length, 'characters')
      console.log('\n📝 COMPLETE RESPONSE:')
      console.log('-'.repeat(60))
      console.log(text)
      console.log('-'.repeat(60))
      console.log('='.repeat(80) + '\n')
      
      optimizedContent = text
      console.log('✅ GPT-5 optimization successful')
      
    } catch (gpt5Error) {
      console.warn('⚠️ GPT-5 failed, falling back to GPT-4o-mini:', gpt5Error)
      
      // Fallback to GPT-4o-mini
      console.log('\n' + '='.repeat(80))
      console.log('🤖 OPENAI API CALL - MESSAGE OPTIMIZATION (FALLBACK)')
      console.log('='.repeat(80))
      console.log('📧 MODEL: gpt-4o-mini')
      console.log('🎯 PURPOSE: Optimize message for engagement (fallback)')
      console.log('📝 MESSAGE ID:', messageId)
      console.log('📏 PROMPT LENGTH:', optimizationPrompt.length, 'characters')
      console.log('\n📝 COMPLETE PROMPT:')
      console.log('-'.repeat(60))
      console.log(optimizationPrompt)
      console.log('-'.repeat(60))
      console.log('='.repeat(80) + '\n')
      
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

      console.log('\n' + '='.repeat(80))
      console.log('✅ OPENAI API RESPONSE - MESSAGE OPTIMIZATION (GPT-4O-MINI FALLBACK)')
      console.log('='.repeat(80))
      console.log('📧 MODEL: gpt-4o-mini')
      console.log('📝 MESSAGE ID:', messageId)
      console.log('📏 RESPONSE LENGTH:', text.length, 'characters')
      console.log('\n📝 COMPLETE RESPONSE:')
      console.log('-'.repeat(60))
      console.log(text)
      console.log('-'.repeat(60))
      console.log('='.repeat(80) + '\n')
      
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

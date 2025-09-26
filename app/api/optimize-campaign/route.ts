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
  ].slice(0, 10) // Get more context items for campaign-level optimization
  
  return prioritizedItems.map(item => 
    `- ${item.title}: ${item.content}`
  ).join('\n')
}

export async function POST(request: NextRequest) {
  try {
    const { messages, signal, persona, painPoints, contextItems } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required and must not be empty' },
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

    console.log(`🚀 TURBO: Optimizing entire campaign with ${messages.length} messages`)
    console.log('👤 Persona:', personaData.label)

    // Build the complete campaign for analysis
    const campaignContent = messages.map((msg, index) => 
      `${msg.type} ${index + 1}:\n${msg.content}\n`
    ).join('\n')

    const optimizationPrompt = `You are an expert email and LinkedIn message optimizer specializing in B2B outreach campaigns. Using your advanced capabilities, optimize this ENTIRE CAMPAIGN for maximum engagement and response rates.

CRITICAL: This is a CAMPAIGN-LEVEL optimization. You must analyze all messages together and ensure they work as a cohesive sequence while maintaining individual message quality. Focus on eliminating repetition, creating variety, and building a natural conversation flow across the entire campaign.

COMPLETE CAMPAIGN TO OPTIMIZE:
${campaignContent}

CONTEXT:
- Campaign Signal: ${signal}
- Target Persona: ${personaData.label} (${personaData.department}, ${personaData.seniority})
- Pain Points: ${painPoints.join(', ') || 'Not specified'}

PERSONA-SPECIFIC PAIN POINTS TO REFERENCE:
${personaData.painPoints.slice(0, 3).map(painPoint => `- ${painPoint}`).join('\n')}

SUCCESSFUL EMAIL EXAMPLES TO EMULATE:
${formatSamplesForPrompt(personaData.label)}

AVAILABLE CONTEXT FOR ENHANCEMENT (distribute strategically across campaign):
${contextItems && contextItems.length > 0 
  ? contextItems.map((item: any) => `- ${item.title}: ${item.content}`).join('\n')
  : await getContextForOptimizer(signal, personaData, painPoints)
}

CAMPAIGN-LEVEL OPTIMIZATION STRATEGY:
1. **REPETITION ANALYSIS**: Identify and eliminate repetitive phrases, structures, and approaches across all messages
2. **VARIATION STRATEGY**: Ensure each message has a unique opening, structure, and value proposition
3. **CONTEXT DISTRIBUTION**: Strategically distribute different customer examples, statistics, and case studies across messages
4. **CONVERSATION FLOW**: Create natural progression from initial contact to follow-up messages
5. **COHESIVE NARRATIVE**: Build a story arc that makes sense across the entire campaign

CONTEXT DISTRIBUTION RULES:
- Email 1: Focus on 1-2 primary context items (statistics or customer quotes)
- Email 2: Use different customer examples and case studies
- Email 3: Introduce new statistics or success stories
- Email 4: Use remaining context items or repeat most impactful ones
- LinkedIn 1: Quick, personal approach with minimal context
- LinkedIn 2: Different angle with remaining context items

MESSAGE UNIQUENESS REQUIREMENTS:
- Each message must have a COMPLETELY different opening approach
- Vary the structure and flow - no two messages should follow the same template
- Use different psychological triggers and persuasion techniques
- Create distinct value propositions for each message
- NEVER use the same connector phrases or signal acknowledgments
- BANNED WORDS across campaign: "move", "moves", "smart move", "simple move", "good move", "solid move", "right move", "great step", "exactly what you need"
- Vary signal acknowledgments - use different ways to show appreciation across messages

OPENING VARIATION STRATEGY:
- Message 1: Direct signal acknowledgment ("Thanks for checking our pricing page")
- Message 2: Question-based approach ("Quick question about freight costs...")
- Message 3: Story/value approach ("Dollar Tree just saved $6M - here's how")
- Message 4: Challenge/hypothetical ("What if you could cut freight spend by 20%?")
- LinkedIn 1: Personal/thought approach ("Quick thought on freight optimization")
- LinkedIn 2: Team/process focus ("Saw your team's focus on efficiency")

CUSTOMER EXAMPLE DISTRIBUTION:
- Distribute different customer examples across messages to avoid repetition
- Use 1-2 key customer examples per message maximum
- Ensure variety in industry examples and success stories
- Build credibility progressively without overwhelming any single message

OPTIMIZATION GUIDELINES (apply to each message individually):
1. Subtly integrate the signal naturally - don't make it obvious or forced
2. Enhance the value proposition using available context (quotes, statistics, case studies)
3. Strengthen the call-to-action
4. Ensure appropriate tone for the persona's seniority level
5. Address pain points more effectively
6. Improve subject line (for emails)
7. Make the message more compelling and actionable
8. Maintain professional tone while being engaging
9. Ensure proper formatting and structure
10. Use advanced psychological triggers for engagement
11. Optimize for emotional resonance and connection
12. Apply persuasion techniques appropriate for the persona
13. Enhance credibility and trust signals
14. Improve urgency and scarcity elements where appropriate
15. Make sure there is less than 3 adverbs in the message
16. Keep sentences naturally flowing - don't force them to be too short if it makes them choppy
17. Make sure there are natural line breaks in the message
18. Make sure the message is at a 5th grade reading level
19. PRESERVE the original's personality and warmth - don't strip out human elements
20. CRITICAL: PRESERVE email references and conversation context - if the original mentions "the email I sent" or "following up on", KEEP those references
21. PRESERVE the original's conversation flow and relationship context - don't make follow-up messages sound like cold outreach
22. USE CUSTOMER QUOTES from available context to add credibility and emotional connection
23. INCORPORATE different statistics and examples from the context repository
24. CRITICAL: Focus on 1-2 PRIMARY context items - avoid overwhelming recipients with too many examples, stats, or customer names
25. BE SELECTIVE with context - use 1-2 key stats/quote per message, not everything
26. KEEP messages concise and scannable - don't overwhelm with too many numbers
27. REPLACE ASSUMPTIONS WITH QUESTIONS: Instead of "I noticed you're focusing on..." say "Are you focusing on...?"
28. Turn presumptive statements into questions to avoid assumptions
29. PRESERVE CUSTOMER LISTS: If the original message mentions companies from customer lists (e.g., Honda, Bridgestone from Automotive Customers), KEEP them in the optimized version
30. ENHANCE CUSTOMER EXAMPLES: Don't remove customer list companies - instead, make them more compelling and relevant
31. MAINTAIN CONTEXT DIVERSITY: Preserve the variety of customer examples from different context items
32. AVOID CONTEXT OVERLOAD: Don't add more context items than the original message - focus on enhancing what's already there
33. REMOVE EM DASHES: Replace all em dashes (—) with regular hyphens (-) or rephrase the sentence - em dashes are an AI tell that should be avoided
34. BOLD KEY CONTEXT ITEMS: Use **bold formatting** to highlight 2-3 complete thoughts or phrases that contain the most impactful context items - bold entire meaningful phrases including company names, statistics, and value propositions (like "**Golden State Foods cut freight costs by 18%**" or "**Dollar Tree saved $6M**") - ensure the whole thought is bolded, not just fragments - CRITICAL: Every message MUST have at least 2-3 bolded phrases to highlight key value propositions
35. USE APOLLO ROLE FIELDS: When referring to someone's role or title, use Apollo merge fields like {{contact.title}} or {{contact.job_title}} instead of generic terms like "your role" or "your position" - this personalizes the message with their actual job title
36. USE ACTUAL URLs: When referencing resources like videos, case studies, or other materials, use the EXACT URLs provided in the context repository - do NOT make up or create fake URLs - if a context item has a URL field, use that exact URL, not a made-up one
37. GIFT CARD LANGUAGE: If mentioning gift card compensation, ALWAYS use "up to $X" language - never promise the full amount. Example: "up to $500 gift card for your time" not "$500 gift card". Frame it as compensation for their valuable time, not an incentive to meet. The gift card is applicable to a demo. Do not reference a specific amount of time required to participate in a demo to be eligible. Keep the gift card as a secondary thought in the call to action. We are primarily trying to have an initial conversation to see if they are eligible for a demo and compensation.
38. DEMO REQUESTS: When asking for time, use "quick chat" language rather than time-boxed demos. Mention the compensation separately after the chat request
39. WRITE COHESIVE SENTENCES: Rewrite choppy, fragmented sentences into smooth, natural flowing statements that feel like a cohesive thought - avoid breaking up natural flow with unnecessary pauses or fragments - make it read like natural conversation, not bullet points

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

Call-to-Action (CTA) Rules:
- NATURAL LINK INTEGRATION: Weave links naturally into sentences, not as entire sentence links
- Link only 2-4 key words in the middle of sentences, not entire phrases
- Make the link feel like a natural part of the conversation flow
- CRITICAL: Never show URLs as plain text - always wrap them in markdown link format [text](url)
- CRITICAL: Every message MUST have a clear, actionable CTA with proper markdown links
- CRITICAL: Ensure all CTAs are properly formatted and functional - no missing or broken links
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
  * "Want to [schedule a quick chat](https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min) to explore this further?"
  * "I can [share the Dollar Tree case study](https://www.emergemarket.com/resource/dollar-tree-study) with you."
  * "Would you like me to [send the Golden State Foods case study](https://www.emergemarket.com/resource/golden-state-foods-case-study) or [book a quick chat](https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min)?"

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
- CRITICAL: When referring to someone's role/title, use Apollo merge fields like {{contact.title}} or {{contact.job_title}} instead of generic terms like "your role" or "your position"
- CRITICAL: When referencing resources with URLs, use the EXACT URLs from the context repository - do NOT create fake or made-up URLs

COHESIVE WRITING REQUIREMENTS:
- Rewrite choppy, fragmented sentences into smooth, natural flowing statements
- Create cohesive thoughts that flow together naturally - avoid unnecessary pauses or fragments
- Make it read like natural conversation, not bullet points or choppy statements
- Match the persona's tone profile while maintaining smooth sentence flow

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

CRITICAL: Do NOT add signatures, contact information, or make messages longer. Keep the same length or shorter than the original. Return the optimized campaign with the same format as the original. Focus on improvements that will increase open rates, response rates, and engagement.

QUALITY TARGET: Match the tone, confidence, and impact of the successful email examples provided. Use the same direct, confident language patterns. Make the messages feel as polished and compelling as the sample emails.

IMPORTANT: Preserve the warm, conversational tone of the original. Don't make emails too short or aggressive. Maintain the friendly, human element while improving structure and flow.

CAMPAIGN OUTPUT FORMAT:
Return the optimized campaign in the exact same format as the input, with each message clearly labeled by type and number. Ensure each message is completely unique while maintaining the overall campaign coherence.

CRITICAL OUTPUT REQUIREMENTS:
- Each message must be labeled exactly as: "Email 1:", "Email 2:", "Email 3:", "Email 4:", "LinkedIn Message 1:", "LinkedIn Message 2:", etc.
- Use EXACT capitalization: "Email" (capital E) and "LinkedIn Message" (capital L and M)
- Return ALL ${messages.length} messages from the original campaign - do not skip or omit any messages
- Preserve all markdown formatting including **bold text** and [link text](url) formats
- Ensure every message has proper CTAs with working markdown links
- Maintain the exact structure and formatting of the original campaign
- Do not add any extra text, explanations, or formatting outside the message content
- CRITICAL: The output must contain exactly ${messages.length} messages, no more, no less
- CRITICAL: Use the exact format "Email 1:", "Email 2:", etc. - do not use lowercase "email" or other variations`

    // Custom GPT-5 optimization with fallback
    let optimizedContent: string
    
    try {
      console.log('🚀 TURBO: Attempting campaign optimization with GPT-5...')
      
      // Log the complete prompt for auditing
      console.log('\n' + '='.repeat(80))
      console.log('🤖 OPENAI API CALL - CAMPAIGN OPTIMIZATION (TURBO)')
      console.log('='.repeat(80))
      console.log('📧 MODEL: gpt-5')
      console.log('🎯 PURPOSE: Optimize entire campaign for engagement and variety')
      console.log('📝 MESSAGE COUNT:', messages.length)
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
            content: 'You are an expert B2B campaign optimizer with advanced AI capabilities. You specialize in creating highly engaging, persuasive message sequences that drive responses and conversions while ensuring variety and avoiding repetition. Always preserve merge field syntax ({{variable.name}}) exactly as provided. CRITICAL: Use ONLY the exact URLs provided in the context repository - do NOT create fake or made-up URLs. Rewrite choppy, fragmented sentences into smooth, natural flowing statements that feel cohesive. Do NOT add signatures, contact information, or make messages longer than the original. Focus on campaign-level optimization to eliminate repetition and create variety.'
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
      console.log('✅ OPENAI API RESPONSE - CAMPAIGN OPTIMIZATION (TURBO)')
      console.log('='.repeat(80))
      console.log('📧 MODEL: gpt-5')
      console.log('📝 MESSAGE COUNT:', messages.length)
      console.log('📏 RESPONSE LENGTH:', text.length, 'characters')
      console.log('\n📝 COMPLETE RESPONSE:')
      console.log('-'.repeat(60))
      console.log(text)
      console.log('-'.repeat(60))
      console.log('='.repeat(80) + '\n')
      
      optimizedContent = text
      console.log('✅ TURBO: GPT-5 campaign optimization successful')
      
    } catch (gpt5Error) {
      console.warn('⚠️ TURBO: GPT-5 failed, falling back to GPT-4o-mini:', gpt5Error)
      
      // Fallback to GPT-4o-mini
      console.log('\n' + '='.repeat(80))
      console.log('🤖 OPENAI API CALL - CAMPAIGN OPTIMIZATION (TURBO FALLBACK)')
      console.log('='.repeat(80))
      console.log('📧 MODEL: gpt-4o-mini')
      console.log('🎯 PURPOSE: Optimize entire campaign for engagement and variety (fallback)')
      console.log('📝 MESSAGE COUNT:', messages.length)
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
            content: 'You are an expert B2B campaign optimizer. Improve message sequences for maximum engagement while maintaining authenticity and professionalism. Always preserve merge field syntax ({{variable.name}}) exactly as provided. CRITICAL: Use ONLY the exact URLs provided in the context repository - do NOT create fake or made-up URLs. Rewrite choppy, fragmented sentences into smooth, natural flowing statements that feel cohesive. Do NOT add signatures, contact information, or make messages longer than the original. Focus on campaign-level optimization to eliminate repetition and create variety.'
          },
          {
            role: 'user',
            content: optimizationPrompt
          }
        ],
        temperature: 0.7
      })

      console.log('\n' + '='.repeat(80))
      console.log('✅ OPENAI API RESPONSE - CAMPAIGN OPTIMIZATION (TURBO FALLBACK)')
      console.log('='.repeat(80))
      console.log('📧 MODEL: gpt-4o-mini')
      console.log('📝 MESSAGE COUNT:', messages.length)
      console.log('📏 RESPONSE LENGTH:', text.length, 'characters')
      console.log('\n📝 COMPLETE RESPONSE:')
      console.log('-'.repeat(60))
      console.log(text)
      console.log('-'.repeat(60))
      console.log('='.repeat(80) + '\n')
      
      optimizedContent = text
      console.log('✅ TURBO: Fallback campaign optimization with GPT-4o-mini successful')
    }
    
    if (!optimizedContent || optimizedContent.trim().length === 0) {
      throw new Error('No optimized content received from OpenAI')
    }

    console.log('✅ TURBO: Campaign optimized successfully')
    console.log('📄 Optimized content length:', optimizedContent.length)
    console.log('📄 Optimized content preview:', optimizedContent.substring(0, 200) + '...')

    return NextResponse.json({
      success: true,
      optimizedCampaign: optimizedContent,
      originalMessageCount: messages.length,
      optimizations: [
        'Campaign-level repetition analysis and elimination',
        'Strategic context distribution across messages',
        'Varied opening approaches for each message',
        'Unique value propositions per message',
        'Improved conversation flow and progression',
        'Enhanced psychological triggers and persuasion',
        'Better customer example distribution',
        'Eliminated repetitive phrases and structures',
        'Advanced emotional resonance optimization',
        'Cohesive campaign narrative development'
      ]
    })

  } catch (error) {
    console.error('❌ TURBO: Error optimizing campaign:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to optimize campaign',
        details: 'Please try again'
      },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { CONTEXT_REPOSITORY } from '@/lib/context-repository'
import { formatVariablesForPrompt } from '@/lib/dynamic-variables'

// Helper function to get relevant context items
function getRelevantContext(signal: string, personaData: any, painPoints: string[]) {
  const signalLower = signal.toLowerCase()
  const relevantItems: any[] = []
  
  // Extract keywords from signal and add broad matching terms
  const keywords = signalLower.split(/\s+/).filter(word => word.length > 3)
  const broadKeywords = [
    'demo', 'pricing', 'savings', 'cost', 'efficiency', 'roi', 'results', 'performance', 'metrics',
    'operations', 'logistics', 'transportation', 'freight', 'shipping', 'supply chain',
    'automation', 'optimization', 'productivity', 'revenue', 'growth', 'scalability',
    'visibility', 'control', 'management', 'process', 'workflow', 'streamline'
  ]
  const allKeywords = [...keywords, ...broadKeywords]
  
  // Find context items that match keywords (broader matching)
  const keywordMatches = allKeywords
    .flatMap(keyword => CONTEXT_REPOSITORY.filter(item => 
      item.keywords && Array.isArray(item.keywords) && item.keywords.some(itemKeyword => 
        itemKeyword.toLowerCase().includes(keyword.toLowerCase())
      )
    ))
  
  // Find context items that match industry mentions
  const industryKeywords = ['retail', 'food', 'beverage', 'automotive', 'manufacturing', 'technology', 'healthcare']
  const industryMatches = industryKeywords
    .filter(industry => signalLower.includes(industry))
    .flatMap(industry => CONTEXT_REPOSITORY.filter(item => 
      item.industry && Array.isArray(item.industry) && item.industry.includes(industry)
    ))
  
  // Add customer context items (most important for social proof)
  const customerItems = CONTEXT_REPOSITORY.filter(item => 
    item.category === 'customer' && (
      keywordMatches.includes(item) || 
      industryMatches.includes(item)
    )
  )
  
  // Add case studies that match
  const caseStudyItems = CONTEXT_REPOSITORY.filter(item => 
    item.category === 'resource' && (
      keywordMatches.includes(item) || 
      industryMatches.includes(item)
    )
  )
  
  // Add statistics that match
  const statisticItems = CONTEXT_REPOSITORY.filter(item => 
    item.category === 'statistic' && (
      keywordMatches.includes(item) || 
      industryMatches.includes(item)
    )
  )
  
  // Add quotes that match
  const quoteItems = CONTEXT_REPOSITORY.filter(item => 
    item.category === 'quote' && (
      keywordMatches.includes(item) || 
      industryMatches.includes(item)
    )
  )
  
  // Add pain point context items
  const painPointMatches = CONTEXT_REPOSITORY.filter(item => 
    item.category === 'pain_points' && (
      item.persona?.includes(personaData.id) ||
      (painPoints && Array.isArray(painPoints) && painPoints.some(pp => item.content.toLowerCase().includes(pp.toLowerCase())))
    )
  )
  
  // Add value propositions and language styles
  const valuePropItems = CONTEXT_REPOSITORY.filter(item => 
    item.category === 'value_prop' && (
      keywordMatches.includes(item) || 
      industryMatches.includes(item) ||
      painPointMatches.includes(item)
    )
  )
  
  const languageStyleItems = CONTEXT_REPOSITORY.filter(item => 
    item.category === 'language_style' && (
      personaData.id === item.persona?.[0] ||
      painPointMatches.includes(item)
    )
  )
  
  // Add some general high-value context items that are always relevant
  const generalHighValue = CONTEXT_REPOSITORY.filter(item => 
    ['dollar_tree_stats', 'golden_state_foods_stats', 'pepsi_case_study'].includes(item.id)
  )
  
  // Prioritize statistics first (most important for credibility), then case studies, then customers, then quotes, then value props, pain points, and language styles
  const allRelevant = [
    ...statisticItems,  // Prioritize statistics first
    ...caseStudyItems, 
    ...customerItems,
    ...quoteItems,
    ...valuePropItems,  // Add value propositions
    ...painPointMatches,  // Add pain point context
    ...languageStyleItems,  // Add language styles
    ...generalHighValue  // Add some general high-value items
  ]
  
  // Remove duplicates and limit to top 8 most relevant (more options for user to choose from)
  const uniqueItems = allRelevant.filter((item, index, self) => 
    index === self.findIndex(t => t.id === item.id)
  )
  
  return uniqueItems.slice(0, 8)
}

export async function POST(request: NextRequest) {
  try {
    const { signal, persona, painPoints = [], emailCount, linkedInCount, contextItems, isIncentivized = false, incentiveAmount = 500 } = await request.json()

    if (!signal || !persona) {
      return NextResponse.json(
        { error: 'Signal and persona are required' },
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

    // Use provided context items if available, otherwise dynamically select relevant context
    let relevantContext: any[]
    if (contextItems && contextItems.length > 0) {
      console.log('✅ Using provided context items for sequence plan:', contextItems.map((c: any) => c.title).join(', '))
      relevantContext = contextItems
    } else {
      console.log('⚠️ No context items provided, dynamically selecting relevant context for sequence plan')
      relevantContext = getRelevantContext(signal, personaData, painPoints)
      console.log('🎯 Dynamically selected context items for sequence plan:', relevantContext.map(c => c.title).join(', '))
    }

    // Create the prompt for sequence plan generation
    const prompt = `You are an expert email sequence strategist. Create a strategic sequence plan for B2B outreach.

CRITICAL: The signal below is the PRIMARY REASON for outreach and MUST be integrated into every message in some way.

SIGNAL (Primary Reason for Outreach - MUST BE INTEGRATED):
${signal}

TARGET PERSONA:
- Role: ${personaData.label}
- Department: ${personaData.department}
- Seniority: ${personaData.seniority}
- Tone Profile: ${personaData.toneProfile}
- Keywords: ${personaData.keywords.join(', ')}
- Key Pain Points: ${painPoints.join(', ') || 'Not specified'}

RELEVANT CONTEXT ITEMS (distribute these strategically across messages - each message should focus on 1-2 specific items):
${relevantContext.map(item => `- ${item.title}: ${item.content}`).join('\n')}

CONTEXT DISTRIBUTION STRATEGY:
- Each message should focus on 1-2 PRIMARY context items to avoid overwhelming the recipient
- Distribute different customer examples, case studies, and statistics across the sequence
- Build credibility progressively by introducing different proof points in each message
- Avoid cramming all context into every message - create focused, digestible content

AVAILABLE DYNAMIC VARIABLES FOR PERSONALIZATION:
${formatVariablesForPrompt()}

SEQUENCE REQUIREMENTS:
- Emails: ${emailCount}
- LinkedIn Messages: ${linkedInCount}

${isIncentivized ? `
INCENTIVE CAMPAIGN REQUIREMENTS:
- This is an incentivized campaign with a $${incentiveAmount} gift card offer
- 50% of messages (approximately ${Math.round((emailCount + linkedInCount) * 0.5)} out of ${emailCount + linkedInCount} total messages) should mention the gift card incentive
- CRITICAL: The FIRST email (Day 1) and FIRST LinkedIn message MUST include the incentive - this sets the expectation from the start
- Distribute the remaining incentive mentions strategically across the sequence - don't put them all at the beginning or end
- The incentive should be mentioned naturally in the context of demo bookings or calls
- Use phrases like "up to $${incentiveAmount} gift card", "$${incentiveAmount} Visa gift card", or "$${incentiveAmount} gift card for your time"
- Make the incentive feel like a genuine appreciation for their time, not a bribe
- Only mention the incentive in messages that have demo/call CTAs
` : ''}

Create a strategic sequence plan that:
1. Creates UNIQUE signal integration approaches for each message - avoid repetitive "I noticed you" patterns
2. Builds value and trust progressively
3. Addresses the target persona's pain points using their specific tone profile and keywords
4. Uses appropriate spacing between messages (2-3 days for emails, 1-2 days for LinkedIn) - CRITICAL: NO TWO MESSAGES CAN BE ON THE SAME DAY - each message must have a unique day number - NEVER bunch LinkedIn messages together on consecutive days
5. Has clear purposes for each touchpoint
6. Varies signal integration: some messages lead with stats, others with questions, others with stories
7. Strategically distributes specific stats across the sequence - each email should focus on 1-2 specific quantified results from the context items
8. Plans which specific stats/numbers will be featured in each email to build credibility progressively
9. CRITICAL: Each message must focus on 1-2 PRIMARY context items - avoid overwhelming recipients with too many examples, stats, or customer names in a single message
10. Distribute different customer examples, case studies, and statistics across the sequence to build credibility progressively
11. Creates different narrative approaches: direct value props, challenge-focused questions, success stories, urgency-driven calls
12. PRIORITIZE industry-relevant customers and social proof - if targeting automotive, mention automotive customers like Honda, Bridgestone, etc.
13. Use customer names and industry-specific examples to build immediate credibility and relevance
14. INCORPORATE the persona's tone profile and keywords throughout the sequence plan to ensure messaging resonates with their communication style
15. Use the persona's keywords naturally in subject lines, value props, and CTAs to speak their language
16. CRITICAL: The FIRST LinkedIn message must casually reference the email that was just sent - use natural, conversational language like "Hey, sent something to your inbox but wanted to touch base here too..." or "Sent you an email too but wanted to ask you if..." - make it feel casual and natural, not formal or scripted - avoid using the same phrasing repeatedly, create unique variations for each sequence
17. CRITICAL: EVERY sequence must start with "Send Connection Request on LinkedIn" on Day 1 - this is always the first step and happens on the same day as the first email
18. CRITICAL: ALTERNATE message types - never have multiple LinkedIn messages in a row - intersperse LinkedIn messages between emails to create a natural flow
19. MANDATORY: Follow this exact pattern: Email → LinkedIn → Email → LinkedIn → Email → LinkedIn (NO EXCEPTIONS)
20. FORBIDDEN: Any sequence that has LinkedIn → LinkedIn → LinkedIn or Email → Email → Email
21. VALIDATION: Before generating, verify that no two consecutive messages are the same type

MESSAGE VARIATION REQUIREMENTS:
- Each message must have a DISTINCTLY different approach
- Use different opening styles: questions, statements, stories, direct value props
- Vary the signal integration style for each message
- Ensure each message feels unique and different from the others with a cohesive story arc
- Make the differences obvious in the signalIntegration field

DETAILED MESSAGE OUTLINES REQUIRED:
- Create a comprehensive messageOutline for each email and LinkedIn message
- Each outline must include natural, conversational guidance for opening lines, signal mentions, stat usage, value props, and CTAs
- The signalMention field should contain NATURAL, CASUAL phrases that reference ONLY the actual signal provided above
- The opening field should contain natural opening approaches that feel timely and relevant based on the actual signal
- The statUsage field should specify HOW to incorporate 1-2 specific statistics naturally (avoid overwhelming with multiple stats)
- The customerMention field should specify which 1-2 industry-relevant customers to mention (e.g., "Honda, Bridgestone" for automotive) - focus on quality over quantity
- The valueProp field should define the core value proposition for that specific message
- The cta field should specify the call-to-action approach
- The assignedContext field should specify which 1-2 specific context items from the available context will be used in this message (e.g., "Dollar Tree Case Study, Food & Beverage Customers")
- Each message outline should be unique and build upon the previous message in the sequence
- Focus on natural, human-like language that flows conversationally like the sample emails
- The signal should flow naturally into relevant questions and value propositions
- Follow the conversational style of the sample emails - direct, friendly, and engaging
- Use casual language like "Hey", "Hi", "Quick question", etc.
- Avoid formal corporate language like "I hope this message finds you well" or "I wanted to reach out"
- CRITICAL: Only reference the actual signal provided - do not make up or assume additional context

LINKEDIN MESSAGE COORDINATION REQUIREMENTS:
- The FIRST LinkedIn message MUST casually reference the email that was just sent - use natural, conversational language that feels authentic and personal
- Create unique, natural variations for each sequence - avoid using the same phrases repeatedly across different campaigns
- Casually reference the email in a way that feels like a natural continuation of the conversation, not a formal follow-up
- Use casual, authentic language that varies each time - create fresh, natural ways to mention the email without being repetitive
- Make it feel like a genuine, personal touchpoint that builds on the email relationship
- Do not imply you have spoken with them directly, only that you have previously reached out.

SIGNAL INTEGRATION REQUIREMENTS:
- Use natural, casual language that flows like the sample emails
- Focus on the VALUE or OPPORTUNITY the signal represents through natural conversation
- Make the signal mention feel natural and conversational, not analytical or corporate
- Create approaches that acknowledge the signal in a friendly, human way
- The signal should flow naturally into relevant questions and value propositions
- NEVER make presumptive statements about things not mentioned in the signal
- ONLY reference what the signal explicitly states - don't assume additional context
- NEVER fabricate engagement like "I saw you checked out..." or "Nice to see you looking at..." unless the signal explicitly mentions this
- AVOID overused phrases like "smart move", "great step", "exactly what you need"
- Follow the conversational style of the sample emails - direct, friendly, and engaging
- Turn corporate speak into natural, casual conversations
- Use casual language like "Hey", "Hi", "Quick question", etc.
- Avoid formal corporate language like "I hope this message finds you well" or "I wanted to reach out"
- CRITICAL: Only work with the actual signal provided - do not invent or assume additional context

SIGNAL INTERPRETATION RULES:
- If signal mentions "write a campaign" or "campaign for [industry]", this means you're HELPING create outreach TO that industry - don't reference a "campaign"
- If signal mentions specific actions like "downloaded case study", "visited demo page", "checked pricing" - reference those actual actions naturally
- If signal is vague like "write me a campaign for automotive leaders" - focus on the TARGET AUDIENCE (automotive leaders) not the campaign creation aspect
- NEVER say things like "I noticed a campaign" - this makes no sense in outreach context
- Focus on the INDUSTRY or PERSONA being targeted, not the campaign creation process

CRITICAL: You must respond with ONLY valid JSON. Do not include any text before or after the JSON. The response must be parseable as JSON.

Return your response as a JSON object with this exact structure:

CRITICAL DAY SPACING REQUIREMENTS:
- Use "daysLater" field to indicate how many days after the previous message this should be sent
- LinkedIn connection request is always "daysLater": 0 (same day as start)
- First email is always "daysLater": 0 (same day as connection request)
- Emails should be spaced 2-3 days later from previous message
- LinkedIn messages should be spaced 1-2 days later from previous message
- CRITICAL: NEVER have 2 or more LinkedIn messages with consecutive "daysLater" values - always alternate between emails and LinkedIn messages
- LinkedIn messages should be interspersed between emails, not bunched together
- MANDATORY PATTERN: Email → LinkedIn → Email → LinkedIn → Email → LinkedIn (alternating pattern)
- FORBIDDEN: LinkedIn → LinkedIn → LinkedIn (any consecutive LinkedIn messages)
- Each message type must alternate - no exceptions

MANDATORY SEQUENCE PATTERN (NO EXCEPTIONS):
- Step 1: LinkedIn Connection Request (daysLater: 0)
- Step 2: First Email (daysLater: 0) 
- Step 3: First LinkedIn Message (daysLater: 2)
- Step 4: Second Email (daysLater: 4)
- Step 5: Second LinkedIn Message (daysLater: 6)
- Step 6: Third Email (daysLater: 8)
- Step 7: Third LinkedIn Message (daysLater: 10)
- Continue alternating: Email → LinkedIn → Email → LinkedIn

{
  "isIncentivized": ${isIncentivized},
  "incentiveAmount": ${incentiveAmount},
  "linkedInConnectionRequest": {
    "daysLater": 0,
    "purpose": "Send connection request on LinkedIn to establish initial contact before email outreach"
  },
  "emails": [
    {
      "daysLater": 0,
      "subject": "Subject line here",
      "purpose": "Purpose of this email",
      "signalIntegration": "Exactly how to mention the signal in this message",
      "specificStats": "Which specific stats/numbers from the context items to feature in this email (1-2 stats max)",
      "messageOutline": {
        "opening": "Exact opening line or approach",
        "signalMention": "Exact phrase to reference the signal",
        "statUsage": "How to incorporate the specific stats",
        "customerMention": "Which industry-relevant customers to mention (e.g., Honda, Bridgestone for automotive)",
        "valueProp": "Core value proposition for this message",
        "cta": "Call to action approach",
        "assignedContext": "Which 1-2 specific context items will be used in this message (e.g., 'Dollar Tree Case Study, Food & Beverage Customers')"
      },
      "includeIncentive": ${isIncentivized ? 'true for first email (Day 1), then distribute remaining incentives across other emails' : 'false'}
    }
  ],
  "linkedInMessages": [
    {
      "daysLater": 2,
      "purpose": "Purpose of this LinkedIn message",
      "signalIntegration": "Exactly how to mention the signal in this message",
      "specificStats": "Which specific stats/numbers from the context items to feature in this LinkedIn message (1 stat max)",
      "messageOutline": {
        "opening": "Exact opening line or approach",
        "signalMention": "Exact phrase to reference the signal",
        "statUsage": "How to incorporate the specific stats",
        "customerMention": "Which industry-relevant customers to mention (e.g., Honda, Bridgestone for automotive)",
        "valueProp": "Core value proposition for this message",
        "cta": "Call to action approach",
        "assignedContext": "Which 1-2 specific context items will be used in this message (e.g., 'Dollar Tree Case Study, Food & Beverage Customers')"
      },
      "includeIncentive": ${isIncentivized ? 'true for first LinkedIn message, then distribute remaining incentives across other LinkedIn messages' : 'false'}
    }
  ],
  "totalDays": 8
}

Make sure the sequence feels natural and builds momentum. Each message should advance the conversation and provide value.`

    console.log('🚀 Generating sequence plan with GPT-5-mini...')
    console.log('📝 Signal:', signal.substring(0, 100) + '...')
    console.log('👤 Persona:', personaData.label)
    
    // Log the complete prompt for auditing
    console.log('\n' + '='.repeat(80))
    console.log('🤖 OPENAI API CALL - SEQUENCE PLAN GENERATION')
    console.log('='.repeat(80))
    console.log('📧 MODEL: gpt-5-mini')
    console.log('🎯 PURPOSE: Generate strategic sequence plan')
    console.log('📏 PROMPT LENGTH:', prompt.length, 'characters')
    console.log('\n📝 COMPLETE PROMPT:')
    console.log('-'.repeat(60))
    console.log(prompt)
    console.log('-'.repeat(60))
    console.log('='.repeat(80) + '\n')

    const { text } = await generateText({
      model: openai('gpt-5-mini'),
      messages: [
        {
          role: 'system',
          content: 'You are an expert email sequence strategist specializing in B2B outreach. Create a sequence plan around the signal provided that weaves the signal throughout each interaction. You must respond with ONLY valid JSON. Do not include any explanatory text, markdown formatting, or code blocks. Return only the JSON object.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7
    })

    console.log('\n' + '='.repeat(80))
    console.log('✅ OPENAI API RESPONSE - SEQUENCE PLAN GENERATION')
    console.log('='.repeat(80))
    console.log('📧 MODEL: gpt-5-mini')
    console.log('📏 RESPONSE LENGTH:', text.length, 'characters')
    console.log('\n📝 COMPLETE RESPONSE:')
    console.log('-'.repeat(60))
    console.log(text)
    console.log('-'.repeat(60))
    console.log('='.repeat(80) + '\n')

    if (!text) {
      throw new Error('No content received from OpenAI')
    }

    console.log('✅ Sequence plan generated successfully')

    // Parse the JSON response
    let sequencePlan
    try {
      // Try to extract JSON from the response in case AI added extra text
      let jsonText = text.trim()
      
      // Look for JSON object boundaries
      const jsonStart = jsonText.indexOf('{')
      const jsonEnd = jsonText.lastIndexOf('}') + 1
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        jsonText = jsonText.substring(jsonStart, jsonEnd)
      }
      
      console.log('📄 Raw AI response:', jsonText.substring(0, 200) + '...')
      
      sequencePlan = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('❌ Failed to parse sequence plan JSON:', parseError)
      console.error('❌ Raw response was:', text)
      throw new Error(`Invalid JSON response from AI: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
    }

    // Validate the structure
    if (!sequencePlan.emails || !sequencePlan.linkedInMessages || !sequencePlan.totalDays) {
      console.warn('⚠️ Invalid sequence plan structure, using fallback')
      
      // Create a fallback sequence plan with proper email count and alternating pattern
      const fallbackEmails = []
      for (let i = 0; i < emailCount; i++) {
        const daysLater = i * 4 // Emails at 0, 4, 8, 12... (alternating with LinkedIn at 2, 6, 10...)
        fallbackEmails.push({
          daysLater: daysLater,
          subject: i === 0 ? "Quick question about your freight costs" : 
                   i === emailCount - 1 ? "One last thought on freight savings" :
                   `Following up on freight optimization (${i + 1})`,
          purpose: i === 0 ? "Initial value-driven opener" :
                   i === emailCount - 1 ? "Final attempt with urgency" :
                   "Reinforce value proposition",
          signalIntegration: i === 0 ? "Lead with the signal and provide value" :
                               i === emailCount - 1 ? "Highlight time-sensitive aspects of the signal" :
                               "Share specific examples related to the signal"
        })
      }
      
      sequencePlan = {
        emails: fallbackEmails,
        linkedInMessages: (() => {
          const fallbackLinkedInMessages = []
          for (let i = 0; i < linkedInCount; i++) {
            const daysLater = 2 + (i * 4) // LinkedIn at 2, 6, 10... (alternating with emails at 0, 4, 8...)
            fallbackLinkedInMessages.push({
              daysLater: daysLater,
              purpose: i === 0 ? "Connect and add value" : "Follow up on email",
              signalIntegration: i === 0 ? "Share industry insight related to their challenges" : "Reference the email and offer additional resources"
            })
          }
          return fallbackLinkedInMessages
        })(),
        totalDays: Math.max(...[
          ...(sequencePlan.emails || []).map((e: any) => e.daysLater),
          ...(sequencePlan.linkedInMessages || []).map((m: any) => m.daysLater)
        ], 8)
      }
    }

    return NextResponse.json({
      success: true,
      sequencePlan,
      persona: personaData.label,
      signal: signal.substring(0, 100) + '...',
      contextItems: relevantContext.map(item => ({
        id: item.id,
        title: item.title,
        category: item.category,
        content: item.content,
        industry: item.industry,
        keywords: item.keywords
      }))
    })

  } catch (error) {
    console.error('❌ Error generating sequence plan:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate sequence plan',
        details: 'Please try again with different parameters'
      },
      { status: 500 }
    )
  }
}

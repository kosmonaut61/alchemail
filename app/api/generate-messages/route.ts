import { NextRequest, NextResponse } from 'next/server'
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { CONTEXT_REPOSITORY, ContextItem } from "@/lib/context-repository"
import { PERSONA_DEFINITIONS } from "@/lib/personas"
import { formatSamplesForPrompt, getPersonaExampleEmail } from "@/lib/email-samples"
import { formatVariablesForPrompt } from "@/lib/dynamic-variables"

// Function to dynamically select relevant context based on signal
function getRelevantContext(signal: string, personaData: any, painPoints: string[]): ContextItem[] {
  const signalLower = signal.toLowerCase()
  const relevantItems: ContextItem[] = []
  
  // Extract potential industries from signal
  const industryKeywords = [
    'retail', 'food', 'beverage', 'automotive', 'logistics', 'manufacturing',
    'ecommerce', 'grocery', 'tire', 'transportation', 'warehouse', 'distribution',
    'production', 'supply chain', 'shipping'
  ]
  
  // Extract potential company types
  const companyKeywords = [
    'enterprise', 'fortune', 'large', 'small', 'medium', 'startup', 'growing',
    'established', 'multinational', 'global', 'regional', 'local'
  ]
  
  // Extract company names and specific keywords from the signal
  const companyNames = ['golden state foods', 'dollar tree', 'frito lay', 'molson coors', 'pepsi', 'walmart', 'honda', 'toyota']
  const specificKeywords = companyNames.filter(name => signalLower.includes(name))
  
  // Find context items that match signal keywords
  const signalKeywords = [...industryKeywords, ...companyKeywords, ...specificKeywords]
  const keywordMatches = CONTEXT_REPOSITORY.filter(item => 
    item.keywords && Array.isArray(item.keywords) && signalKeywords.some(keyword => 
      signalLower.includes(keyword) && item.keywords!.some(itemKeyword => 
        itemKeyword.toLowerCase().includes(keyword.toLowerCase())
      )
    )
  )
  
  // Find context items that match industry mentions
  const industryMatches = industryKeywords
    .filter(industry => signalLower.includes(industry))
    .flatMap(industry => CONTEXT_REPOSITORY.filter(item => 
      item.industry && item.industry.includes(industry)
    ))
  
  // Also find context items by checking if any context item keywords appear in the signal
  const directMatches = CONTEXT_REPOSITORY.filter(item => {
    if (item.keywords && Array.isArray(item.keywords)) {
      return item.keywords.some(keyword => signalLower.includes(keyword.toLowerCase()))
    }
    return false
  })
  
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
  
  // Add value propositions and language styles
  const valuePropItems = CONTEXT_REPOSITORY.filter(item => 
    item.category === 'value_prop' && (
      keywordMatches.includes(item) || 
      industryMatches.includes(item) ||
      (painPoints && Array.isArray(painPoints) && painPoints.some(pp => item.content.toLowerCase().includes(pp.toLowerCase())))
    )
  )
  
  const languageStyleItems = CONTEXT_REPOSITORY.filter(item => 
    item.category === 'language_style' && (
      personaData.id === item.persona?.[0] ||
      (painPoints && Array.isArray(painPoints) && painPoints.some(pp => item.content.toLowerCase().includes(pp.toLowerCase())))
    )
  )
  
  // Add pain point context items
  const painPointMatches = CONTEXT_REPOSITORY.filter(item => 
    item.category === 'pain_points' && (
      item.persona?.includes(personaData.id) ||
      (painPoints && Array.isArray(painPoints) && painPoints.some(pp => item.content.toLowerCase().includes(pp.toLowerCase())))
    )
  )
  
  // Combine and deduplicate with prioritization
  const allRelevant = [
    ...customerItems,
    ...caseStudyItems, 
    ...statisticItems,
    ...quoteItems,
    ...valuePropItems,
    ...painPointMatches,
    ...languageStyleItems,
    ...directMatches
  ]
  
  // Remove duplicates and limit to top 5 most relevant
  const uniqueItems = allRelevant.filter((item, index, self) => 
    index === self.findIndex(t => t.id === item.id)
  )
  
  return uniqueItems.slice(0, 5)
}

export async function POST(request: NextRequest) {
  try {
    const { signal, persona, painPoints, sequencePlan, contextItems } = await request.json()

    if (!signal || !persona || !sequencePlan) {
      return NextResponse.json(
        { error: 'Signal, persona, and sequence plan are required' },
        { status: 400 }
      )
    }

    // Get persona definition
    const personaData = PERSONA_DEFINITIONS.find(p => p.id === persona)
    
    if (!personaData) {
      return NextResponse.json(
        { error: 'Invalid persona selected' },
        { status: 400 }
      )
    }

    console.log('🚀 Generating messages for sequence...')
    console.log('📝 Signal:', signal.substring(0, 100) + '...')
    console.log('👤 Persona:', personaData.label)
    console.log('📧 Emails:', sequencePlan.emails.length)
    console.log('💼 LinkedIn:', sequencePlan.linkedInMessages.length)
    console.log('🎯 Context items received:', contextItems?.length || 0)

    // Use provided context items if available, otherwise dynamically select relevant context
    let relevantContext: ContextItem[]
    if (contextItems && contextItems.length > 0) {
      console.log('✅ Using provided context items:', contextItems.map((c: ContextItem) => c.title).join(', '))
      console.log('📋 Context items details:', contextItems.map((c: ContextItem) => ({ id: c.id, title: c.title, category: c.category, content: c.content.substring(0, 100) + '...' })))
      relevantContext = contextItems
    } else {
      console.log('⚠️ No context items provided, dynamically selecting relevant context')
      relevantContext = getRelevantContext(signal, personaData, painPoints)
      console.log('🎯 Dynamically selected context items:', relevantContext.map(c => c.title).join(', '))
    }

    const generatedMessages = []

    // Generate emails
    for (const emailPlan of sequencePlan.emails) {
      const emailPrompt = `You are a friendly, conversational B2B email writer for Emerge. Write like you're talking to a colleague - casual, authentic, and human. Keep it simple and avoid corporate jargon.

CRITICAL INSTRUCTION: You MUST use the specific context items provided below. Do not use any companies, statistics, or examples that are not explicitly listed in the VERIFIED CONTEXT section.

**CRITICAL STATISTICS VALIDATION**: Use ONLY the exact statistics provided in the context repository. DO NOT create, fabricate, or invent any specific percentage numbers, dollar amounts, or time savings that are not explicitly listed in the verified context. If no specific statistics are available, use general descriptive language instead of specific numbers.

SIGNAL (Primary Reason for Outreach):
${signal}

TARGET PERSONA:
- Role: ${personaData.label}
- Department: ${personaData.department}
- Seniority: ${personaData.seniority}
- Tone Profile: ${personaData.toneProfile}
- Keywords to Use: ${personaData.keywords?.join(', ') || 'Not specified'}
- Selected Pain Points: ${painPoints?.join(', ') || 'Not specified'}
- All Available Pain Points: ${personaData.painPoints?.join('; ') || 'Not specified'}

PAIN POINT DISTRIBUTION FOR THIS EMAIL:
- This is Email ${sequencePlan.emails.indexOf(emailPlan) + 1} of ${sequencePlan.emails.length}
- Total pain points available: ${painPoints?.length || 0}
- CRITICAL: Focus on 1-2 PRIMARY pain points to avoid overwhelming the recipient
${painPoints?.length === 1 ? `
- SINGLE PAIN POINT DETECTED: Since only 1 pain point is provided, use DIFFERENT ANGLES and DESCRIPTIONS for each email:
  - Email 1: Focus on the core challenge (e.g., "steep learning curve")
  - Email 2: Focus on related aspects (e.g., "complex processes", "new systems", "ramping up")
  - Email 3: Focus on impact/consequences (e.g., "time-consuming", "overwhelming", "difficult to master")
  - Email 4: Focus on solutions/outcomes (e.g., "streamlined approach", "simplified process", "easier to understand")
- NEVER use the exact same pain point phrase across multiple emails
- Use varied language to describe the same underlying challenge
- CRITICAL: VARY PAIN POINT PHRASING - Use different ways to express the same concept:
  - Instead of "steep learning curve" → try "complex processes", "new systems to master", "ramping up quickly", "getting up to speed", "learning the ropes"
  - Instead of "time-consuming" → try "takes forever", "eats up hours", "slows everything down", "bogs down the process"
  - Instead of "overwhelming" → try "a lot to take in", "information overload", "feels like drinking from a firehose", "can be daunting"` : `
- MULTIPLE PAIN POINTS: Use DIFFERENT pain points than previous emails in the sequence
- If this is Email 1: Focus on pain point 1-2 from the list
- If this is Email 2: Focus on pain point 2-3 from the list  
- If this is Email 3: Focus on pain point 3-4 from the list
- If this is Email 4: Focus on pain point 4-5 from the list
- AVOID repeating the same pain point phrases across multiple emails
- NEVER use the same pain point description in multiple emails
- CRITICAL: VARY PAIN POINT PHRASING - Use different ways to express the same concept:
  - Instead of "steep learning curve" → try "complex processes", "new systems to master", "ramping up quickly", "getting up to speed", "learning the ropes"
  - Instead of "time-consuming" → try "takes forever", "eats up hours", "slows everything down", "bogs down the process"
  - Instead of "overwhelming" → try "a lot to take in", "information overload", "feels like drinking from a firehose", "can be daunting"`}

      VERIFIED CONTEXT (ONLY use these exact facts - do not make up any customer claims or numbers):
      ${relevantContext.map(item => `- ${item.title}: ${item.content}`).join('\n')}

      CUSTOMER LIST ITEMS AVAILABLE:
      ${relevantContext.filter(item => item.category === 'customer').map(item => `- ${item.title}: ${item.content}`).join('\n')}
      
      DEBUG INFO:
      - Total context items: ${relevantContext.length}
      - Customer context items: ${relevantContext.filter(item => item.category === 'customer').length}
      - Context item IDs: ${relevantContext.map(item => item.id).join(', ')}
      
      IMPORTANT: If there are customer list items above, use companies from those lists instead of individual case studies or statistics.

      CONTEXT USAGE PRIORITY:
      1. CRITICAL: Focus on 1-2 PRIMARY context items per email to avoid overwhelming recipients
      2. If there are customer list items (e.g., "Food & Beverage Customers", "Automotive Customers", "Logistics Customers"), use 1-2 specific company names from those lists
      3. MANDATORY: Use the EXACT context items provided above - do not substitute with other companies or examples
      4. Use statistics and case studies to provide specific quantified results (limit to 1-2 per email)
      5. Use quotes to add credibility and emotional connection (limit to 1 per email)
      6. DISTRIBUTE context across emails - each email should use DIFFERENT context items to avoid repetition
      7. NEVER reuse the same company examples across multiple emails in the same sequence
      8. NEVER use companies not listed in the provided context items
      9. AVOID cramming multiple customer examples, stats, and case studies into one email

      AVAILABLE DYNAMIC VARIABLES FOR PERSONALIZATION:
      ${formatVariablesForPrompt()}
      
      CRITICAL MERGE FIELD SYNTAX RULES:
      - Always use {{#endif}} to close conditionals, NEVER use {{/if}}
      - Correct: {{#if contact.first_name}}{{contact.first_name}}{{#else}}there{{#endif}}
      - WRONG: {{#if contact.first_name}}{{contact.first_name}}{{#else}}there{{/if}}
      - This is critical for CRM compatibility - incorrect syntax breaks merge fields

      EMAIL STRUCTURE EXAMPLES (follow this tone and structure):
      ${formatSamplesForPrompt(personaData.label)}

      EXAMPLE EMAIL FOR THIS PERSONA (use as a template):
      ${getPersonaExampleEmail(personaData.label)}

      EMAIL SPECIFICATIONS:
      - Days Later: ${emailPlan.daysLater}
      - Email Number: ${sequencePlan.emails.indexOf(emailPlan) + 1} of ${sequencePlan.emails.length}
      - Subject: ${emailPlan.subject}
      - Purpose: ${emailPlan.purpose}
      - Signal Integration: ${emailPlan.signalIntegration}
      - Specific Stats to Feature: ${emailPlan.specificStats || 'Use relevant stats from context'}

      CONTEXT DISTRIBUTION FOR THIS EMAIL:
      - This is Email ${sequencePlan.emails.indexOf(emailPlan) + 1} of ${sequencePlan.emails.length}
      - CRITICAL: Focus on 1-2 PRIMARY context items to avoid overwhelming the recipient
      - Use DIFFERENT context items than previous emails in the sequence
      - If this is Email 1: Use customer list companies (e.g., from "Automotive Customers" or "Logistics Customers")
      - If this is Email 2: Use different customer list companies or statistics
      - If this is Email 3: Use different customer list companies or case studies
      - AVOID cramming multiple customer examples, stats, and case studies into one email
      - NEVER repeat the same company examples used in other emails

      DETAILED MESSAGE OUTLINE (FOLLOW NATURALLY):
      ${emailPlan.messageOutline ? `
      - Opening: ${emailPlan.messageOutline.opening}
      - Signal Mention: ${emailPlan.messageOutline.signalMention} (mention the signal naturally and conversationally)
      - Stat Usage: ${emailPlan.messageOutline.statUsage}
      - Customer Mention: ${emailPlan.messageOutline.customerMention} (mention these specific customers naturally)
      - Value Prop: ${emailPlan.messageOutline.valueProp}
      - CTA: ${emailPlan.messageOutline.cta}
      ` : 'No detailed outline provided - use general guidelines'}
      
      IMPORTANT: Mention the signal naturally and conversationally, like "Nice to see you checking our integrations page" or "I noticed you were looking at our demo page." Make it feel friendly and human, not robotic or analytical.

      CRITICAL SIGNAL INTEGRATION REQUIREMENT:
      The signalIntegration field tells you EXACTLY how to integrate the signal. You MUST follow it precisely.
      
      SIGNAL TO INTEGRATE: "${signal}"
      SIGNAL INTEGRATION INSTRUCTION: "${emailPlan.signalIntegration}"
      
      You MUST include the signal in the email exactly as specified in the signalIntegration instruction above.

      ${sequencePlan.isIncentivized && emailPlan.includeIncentive ? `
COMPENSATION REQUIREMENT:
- This email should mention the gift card compensation for their valuable time
- CRITICAL: Always use "up to $${sequencePlan.incentiveAmount}" language - never promise the full amount
- Include it naturally in the context of demo bookings or calls
- Use professional phrases like "up to $${sequencePlan.incentiveAmount} gift card for your time", "$${sequencePlan.incentiveAmount} Visa gift card as appreciation", or "$${sequencePlan.incentiveAmount} gift card to compensate you for your valuable time"
- Frame it as compensation for their time, not an incentive to meet with us
- Only mention it if the email has a demo/call CTA
- When asking for time, request a "quick chat" rather than time-boxed demos, then mention the compensation separately
      ` : ''}

      Write a complete email that:
      1. Uses the exact subject line provided
      2. Follows the purpose and signal integration guidelines EXACTLY as specified
      3. Matches the persona's tone profile and uses their keywords
      4. CRITICAL: MUST BE WRITTEN AT A 5TH GRADE READING LEVEL - use simple, clear language that anyone can understand easily
      5. Focuses on the recipient's potential challenges and goals - NEVER assume what they downloaded or their specific business situation
      6. Sounds conversational and human (like talking to a friend)
      7. Includes a clear call-to-action
      8. Is concise but compelling (100-150 words)
      9. Does NOT include a signature or sign-off
      10. Focus on the SPECIFIC STATS mentioned in "Specific Stats to Feature" - use 1-2 specific quantified results from the VERIFIED CONTEXT
      11. If no relevant context is available, focus on the signal and pain points without making specific customer claims
      12. NEVER mention specific dollar amounts, percentages, or savings unless they are explicitly provided in the VERIFIED CONTEXT
      13. NEVER assume what the recipient downloaded, their specific problems, or their business situation
      14. Focus on potential challenges they MIGHT face based on their role, not assumptions about their current situation
      15. Make each email unique and different - avoid generic phrases like "you're not alone" or "many companies"
      16. Use the specific stats mentioned in the plan to make the email compelling and credible
      17. Don't overwhelm with too many stats - focus on the 1-2 specific ones planned for this email
      18. MUST integrate the signal as specified in the signalIntegration field - this is mandatory
      19. PRIORITIZE CUSTOMER LISTS: If there's a customer list context item (e.g., "Automotive Customers", "Logistics Customers"), use companies from that list when mentioning industry-relevant examples
      20. CUSTOMER LIST USAGE: When using customer lists, mention 2-3 specific company names from the list to build credibility and relevance
      21. CONTEXT DISTRIBUTION: Each email must use DIFFERENT context items - never repeat the same company examples across emails
      22. SEQUENCE VARIETY: Email 1 should use different context than Email 2, Email 2 different from Email 3, etc.
      23. CUSTOMER LIST FIRST: Always check for customer list items first before using individual case studies or statistics

      STRUCTURE GUIDELINES:
      - CRITICAL: USE 5TH GRADE READING LEVEL - avoid complex words, jargon, or overly formal language
      - Start with personal greeting using merge fields: "Hi {{contact.first_name}},"
      - Open with signal acknowledgment (if applicable)
      - State the challenge/opportunity in 1-2 short sentences
      - Present the specific stat/result in context
      - End with clear, hyperlinked CTA using NATURAL link integration
      - Weave links into sentences naturally (2-4 key words), not entire sentence links
      - LINK TYPE RULES:
        * For MEETING/CALL requests: Use Apollo URL: [schedule a call](https://app.apollo.io/#/meet/managed-meetings/{{sender_meeting_alias}}/n9l-1si-q4y/30-min)
          CRITICAL: Apollo links MUST use {{sender_meeting_alias}} (with underscore) - NEVER use {{sender.meeting.alias}} (with dot)
        * For CASE STUDY sharing: Use ONLY actual case study URLs from context:
          - [Dollar Tree case study](https://www.emergemarket.com/resource/dollar-tree-study)
          - [Golden State Foods case study](https://www.emergemarket.com/resource/golden-state-foods-case-study)
          - [EZRack case study](https://www.emergemarket.com/resource/ezrack-case-study)
          - [Pepsi case study](https://www.emergemarket.com/resource/pepsi-bottling-case-study)
          - [Premier Carrier Program case study](https://www.emergemarket.com/resource/premier-carrier-case-study)
          - [DBIN case study](https://www.emergemarket.com/resource/dynamic-book-it-now-case-study)
        * For DEMO/PRESENTATION: Use Apollo URL: [book a demo](https://app.apollo.io/#/meet/managed-meetings/{{sender_meeting_alias}}/n9l-1si-q4y/30-min)
          CRITICAL: Apollo links MUST use {{sender_meeting_alias}} (with underscore) - NEVER use {{sender.meeting.alias}} (with dot)
      - Examples: "Would you be open to a [quick chat](https://app.apollo.io/#/meet/managed-meetings/{{sender_meeting_alias}}/n9l-1si-q4y/30-min) to explore this?" or "I can [share the Dollar Tree case study](https://www.emergemarket.com/resource/dollar-tree-study) with you."
      - Keep sentences short and punchy
      - Use active voice and direct language
      - Avoid corporate jargon and formal phrases
      - CRITICAL: Format all links as markdown [text](url) - never show plain URLs

      MESSAGE TYPE VARIATION BY TIMING:
      - Same Day (0 days later): Follow the signalIntegration instruction from the sequence plan
      - 2 Days Later: Question-based approach focusing on challenges (start with question)
      - 4 Days Later: Story-driven with customer success focus (start with story/customer name)
      - 6 Days Later: Urgency-driven with clear next steps (start with urgency/time)
      - LinkedIn: More casual, personal, and conversational (start with personal note)

      TIMING-SPECIFIC INSTRUCTIONS:
      - Same Day (0 days later): Follow the signalIntegration instruction from the sequence plan
      - 2 Days Later: Start with a question about their challenges
      - 4 Days Later: Start with a customer story or success example
      - 6 Days Later: Start with urgency or time-sensitive language
      - LinkedIn: Start with personal/casual language, avoid formal openings

      VARIED OPENING EXAMPLES (USE DIFFERENT ONES):
      - Direct: "Quick question about your freight costs..."
      - Story: "Dollar Tree just saved $6M - here's what happened"
      - Question: "What if you could cut freight spend by 20%?"
      - Challenge: "Most ops leaders struggle with this..."
      - Value: "Thanks for checking our pricing - here's what we found"
      - Personal: "I've been thinking about your team's efficiency challenges"
      - Problem: "Freight costs are killing budgets everywhere..."
      - Solution: "Here's how we helped Pepsi cut RFP time by 20%"
      - Urgency: "Time-sensitive question about your freight spend"
      - Insight: "Interesting trend I'm seeing in freight optimization"

      CRITICAL: Do NOT use "I saw you checked out" or "I noticed you" in every message. Vary your openings completely.

CRITICAL RULES:
- Only use facts from the VERIFIED CONTEXT section. Never make up customer names, savings amounts, percentages, or results that aren't explicitly provided.
- NEVER assume what the recipient downloaded or their specific business situation
- Focus on their potential challenges and goals based on their role, not assumptions about their current state
- Use phrases like "if you're facing..." or "many [role] deal with..." instead of assuming their situation
- REPLACE ASSUMPTIONS WITH QUESTIONS: Instead of "I noticed you're focusing on..." say "Are you focusing on...?"
- Instead of "It looks like you're looking for..." say "Are you looking for...?"
- Instead of "I noticed TOMS is focusing on..." say "Is TOMS focusing on...?"
- Turn all presumptive statements into questions

Format your response as:
Subject: [subject line]

[email body]

Write like you're having a genuine conversation, not sending a formal business proposal.

NEVER ASSUME OR MENTION (unless the signal explicitly mentions it):
- Making up what the recipient downloaded or viewed
- Their specific business situation (unless mentioned in signal)
- What challenges they're currently facing (unless mentioned in signal)
- Any assumptions about their company or role (unless mentioned in signal)
- LinkedIn posts, social media activity, or other online behavior not in the signal
- What they're "considering" or "thinking about" unless explicitly mentioned
- Their internal processes, strategies, or decision-making unless stated in the signal
- Overused phrases like "smart move", "great step", "exactly what you need"

IMPORTANT: If the signal explicitly mentions the recipient downloaded something, you CAN reference this fact as it's part of the signal, not an assumption. However, do NOT assume which specific case study, document, or resource they downloaded - only reference the general fact that they downloaded something.

      CORE PRINCIPLES:
      - CRITICAL: WRITE AT A 5TH GRADE READING LEVEL - simple words, short sentences, easy to understand
      - Start with specific, quantified results from the VERIFIED CONTEXT (this builds credibility)
      - Focus on the recipient's potential challenges, not assumptions about their current situation
      - Use different approaches and stats for each email to avoid repetition
      - Be conversational and authentic - write like you're talking to a colleague
      - Let your creativity flow while staying within these boundaries

      MESSAGE VARIATION RULES:
      - Each email must be COMPLETELY UNIQUE - no repetitive phrases or structures
      - Use different opening approaches: questions, statements, stories, direct value props
      - Vary the signal integration - don't always start with "I noticed you checked out"
      - Use different stats and customer examples for each email
      - Change the tone and approach - some direct, some conversational, some story-driven
      - Avoid template-style writing - make each message feel fresh and different`

      // Log the complete prompt for auditing
      console.log('\n' + '='.repeat(80))
      console.log('🤖 OPENAI API CALL - EMAIL GENERATION')
      console.log('='.repeat(80))
      console.log('📧 MODEL: gpt-4o-mini')
      console.log('🎯 PURPOSE: Generate email content')
      console.log('📅 DAY:', emailPlan.day)
      console.log('📏 PROMPT LENGTH:', emailPrompt.length, 'characters')
      console.log('\n📝 COMPLETE PROMPT:')
      console.log('-'.repeat(60))
      console.log(emailPrompt)
      console.log('-'.repeat(60))
      console.log('='.repeat(80) + '\n')

      try {
        const { text: emailContent } = await generateText({
          model: openai('gpt-4o-mini'),
          messages: [
            {
              role: 'system',
              content: 'You are a friendly, conversational B2B email writer for Emerge. CRITICAL: Write at a 5th grade reading level - use simple, clear language that anyone can understand easily. Write like you\'re talking to a colleague - casual, authentic, and human. Keep it simple and avoid corporate jargon. Focus on the recipient\'s potential challenges and goals based on their role, not assumptions about their current situation. If the signal explicitly mentions the recipient downloaded something, you can reference this general fact but do NOT assume which specific document they downloaded. Do not include signatures, sign-offs, or contact information - just the email content. CRITICAL: You MUST integrate the signal exactly as specified in the signalIntegration instruction provided.'
            },
            {
              role: 'user',
              content: emailPrompt
            }
          ],
          temperature: 0.8
        })

        console.log('\n' + '='.repeat(80))
        console.log('✅ OPENAI API RESPONSE - EMAIL GENERATION')
        console.log('='.repeat(80))
        console.log('📧 MODEL: gpt-4o-mini')
        console.log('📅 DAY:', emailPlan.day)
        console.log('📏 RESPONSE LENGTH:', emailContent.length, 'characters')
        console.log('\n📝 COMPLETE RESPONSE:')
        console.log('-'.repeat(60))
        console.log(emailContent)
        console.log('-'.repeat(60))
        console.log('='.repeat(80) + '\n')
        
        generatedMessages.push({
          id: `email-${emailPlan.daysLater}-${sequencePlan.emails.indexOf(emailPlan)}`,
          type: 'email',
          daysLater: emailPlan.daysLater,
          content: emailContent,
          originalContent: emailContent,
          isOptimized: false,
          isGenerating: false,
          isOptimizing: false
        })

        console.log(`✅ Generated email for ${emailPlan.daysLater} days later`)

      } catch (emailError) {
        console.error(`❌ Error generating email for ${emailPlan.daysLater} days later:`, emailError)
        // Continue with other emails even if one fails
      }
    }

    // Generate LinkedIn messages
    for (const linkedInPlan of sequencePlan.linkedInMessages) {
      const linkedInPrompt = `You are a friendly, conversational LinkedIn message writer for Emerge. Write like you're talking to a colleague - casual, authentic, and human. Keep it simple and avoid corporate jargon. Do not include signatures, sign-offs, or contact information - just the message content.

SIGNAL (Primary Reason for Outreach):
${signal}

TARGET PERSONA:
- Role: ${personaData.label}
- Department: ${personaData.department}
- Seniority: ${personaData.seniority}
- Tone Profile: ${personaData.toneProfile}
- Keywords to Use: ${personaData.keywords?.join(', ') || 'Not specified'}
- Selected Pain Points: ${painPoints?.join(', ') || 'Not specified'}
- All Available Pain Points: ${personaData.painPoints?.join('; ') || 'Not specified'}

VERIFIED CONTEXT (ONLY use these exact facts - do not make up any customer claims or numbers):
${relevantContext.map(item => `- ${item.title}: ${item.content}`).join('\n')}

AVAILABLE DYNAMIC VARIABLES FOR PERSONALIZATION:
${formatVariablesForPrompt()}

EXAMPLE EMAIL FOR THIS PERSONA (use as a template for tone and structure):
${getPersonaExampleEmail(personaData.label)}

LINKEDIN MESSAGE SPECIFICATIONS:
      - Days Later: ${linkedInPlan.daysLater}
      - Purpose: ${linkedInPlan.purpose}
      - Signal Integration: ${linkedInPlan.signalIntegration}
      - Specific Stats to Feature: ${linkedInPlan.specificStats || 'Use relevant stats from context'}

      DETAILED MESSAGE OUTLINE (FOLLOW NATURALLY):
      ${linkedInPlan.messageOutline ? `
      - Opening: ${linkedInPlan.messageOutline.opening}
      - Signal Mention: ${linkedInPlan.messageOutline.signalMention} (mention the signal naturally and conversationally)
      - Stat Usage: ${linkedInPlan.messageOutline.statUsage}
      - Customer Mention: ${linkedInPlan.messageOutline.customerMention} (mention these specific customers naturally)
      - Value Prop: ${linkedInPlan.messageOutline.valueProp}
      - CTA: ${linkedInPlan.messageOutline.cta}
      ` : 'No detailed outline provided - use general guidelines'}
      
      IMPORTANT: Mention the signal naturally and conversationally, like "Nice to see you checking our integrations page" or "I noticed you were looking at our demo page." Make it feel friendly and human, not robotic or analytical.

      CRITICAL: You MUST follow the Signal Integration instructions exactly. The signalIntegration field tells you exactly how to integrate the signal - follow it precisely.

      ${sequencePlan.isIncentivized && linkedInPlan.includeIncentive ? `
      COMPENSATION REQUIREMENT:
      - This LinkedIn message should mention the gift card compensation for their valuable time
      - CRITICAL: Always use "up to $${sequencePlan.incentiveAmount}" language - never promise the full amount
      - Include it naturally in the context of demo bookings or calls
      - Use professional phrases like "up to $${sequencePlan.incentiveAmount} gift card for your time", "$${sequencePlan.incentiveAmount} Visa gift card as appreciation", or "$${sequencePlan.incentiveAmount} gift card to compensate you for your valuable time"
      - Frame it as compensation for their time, not an incentive to meet with us
      - Only mention it if the message has a demo/call CTA
      - When asking for time, request a "quick chat" rather than time-boxed demos, then mention the compensation separately
      ` : ''}

Write a LinkedIn message that:
1. Follows the purpose and signal integration guidelines
2. Matches the persona's tone profile and uses their keywords
3. CRITICAL: MUST BE WRITTEN AT A 5TH GRADE READING LEVEL - use simple, clear language that anyone can understand easily
4. Focuses on the recipient's potential challenges and goals - NEVER assume what they downloaded or their specific business situation
5. Is appropriate for the target persona's seniority level
6. Feels personal and professional
7. Is concise (50-100 words)
8. Includes a clear call-to-action
9. Feels natural and builds on previous messages
10. Does NOT include a signature or sign-off
11. Focus on the SPECIFIC STATS mentioned in "Specific Stats to Feature" - use 1 specific quantified result from the VERIFIED CONTEXT
12. NEVER mention specific dollar amounts, percentages, or savings unless they are explicitly provided in the VERIFIED CONTEXT
13. NEVER assume what the recipient downloaded, their specific problems, or their business situation
14. Focus on potential challenges they MIGHT face based on their role, not assumptions about their current situation
15. Make each message unique and different - avoid generic phrases
16. Use the specific stat mentioned in the plan to make the message compelling and credible

CRITICAL: Only use facts from the VERIFIED CONTEXT section. Never make up customer names, savings amounts, percentages, or results that aren't explicitly provided. If you don't have specific numbers, don't mention any. NEVER assume what the recipient downloaded or their specific business situation.

Make sure the message is engaging and drives the conversation forward. Use the tone profile to guide your writing style and incorporate the persona's keywords naturally.

NEVER ASSUME OR MENTION (unless the signal explicitly mentions it):
- Making up what the recipient downloaded or viewed
- Their specific business situation (unless mentioned in signal)
- What challenges they're currently facing (unless mentioned in signal)
- Any assumptions about their company or role (unless mentioned in signal)

IMPORTANT: If the signal explicitly mentions the recipient downloaded something, you CAN reference this fact as it's part of the signal, not an assumption. However, do NOT assume which specific case study, document, or resource they downloaded - only reference the general fact that they downloaded something.

      CORE PRINCIPLES:
      - CRITICAL: WRITE AT A 5TH GRADE READING LEVEL - simple words, short sentences, easy to understand
      - Start with specific, quantified results from the VERIFIED CONTEXT (this builds credibility)
      - Focus on the recipient's potential challenges, not assumptions about their current situation
      - Use different approaches and stats for each message to avoid repetition
      - Be conversational and authentic - write like you're talking to a colleague
      - Let your creativity flow while staying within these boundaries

      LINKEDIN VARIATION RULES:
      - Each LinkedIn message must be COMPLETELY UNIQUE and different from emails
      - Use casual, personal tone - more like a colleague reaching out
      - Vary openings: questions, thoughts, insights, personal notes
      - Keep it conversational and less formal than emails
      - Use different stats and examples than the emails
      - Avoid repetitive signal integration - be more creative
      - CRITICAL: Format all links as markdown [text](url) - never show plain URLs
      - Use NATURAL link integration: weave links into sentences (2-4 key words)
      - LINK TYPE RULES:
        * For MEETING/CALL requests: Use Apollo URL: [schedule a call](https://app.apollo.io/#/meet/managed-meetings/{{sender_meeting_alias}}/n9l-1si-q4y/30-min)
          CRITICAL: Apollo links MUST use {{sender_meeting_alias}} (with underscore) - NEVER use {{sender.meeting.alias}} (with dot)
        * For CASE STUDY sharing: Use ONLY actual case study URLs from context:
          - [Dollar Tree case study](https://www.emergemarket.com/resource/dollar-tree-study)
          - [Golden State Foods case study](https://www.emergemarket.com/resource/golden-state-foods-case-study)
          - [EZRack case study](https://www.emergemarket.com/resource/ezrack-case-study)
          - [Pepsi case study](https://www.emergemarket.com/resource/pepsi-bottling-case-study)
          - [Premier Carrier Program case study](https://www.emergemarket.com/resource/premier-carrier-case-study)
          - [DBIN case study](https://www.emergemarket.com/resource/dynamic-book-it-now-case-study)
      - Examples: "Want to [jump on a call](https://app.apollo.io/#/meet/managed-meetings/{{sender_meeting_alias}}/n9l-1si-q4y/30-min) this week?" or "I can [share the Dollar Tree case study](https://www.emergemarket.com/resource/dollar-tree-study) with you."`

      // Log the complete prompt for auditing
      console.log('\n' + '='.repeat(80))
      console.log('🤖 OPENAI API CALL - LINKEDIN GENERATION')
      console.log('='.repeat(80))
      console.log('📧 MODEL: gpt-4o-mini')
      console.log('🎯 PURPOSE: Generate LinkedIn message content')
      console.log('📅 DAY:', linkedInPlan.day)
      console.log('📏 PROMPT LENGTH:', linkedInPrompt.length, 'characters')
      console.log('\n📝 COMPLETE PROMPT:')
      console.log('-'.repeat(60))
      console.log(linkedInPrompt)
      console.log('-'.repeat(60))
      console.log('='.repeat(80) + '\n')

      try {
        const { text: linkedInContent } = await generateText({
          model: openai('gpt-4o-mini'),
          messages: [
            {
              role: 'system',
              content: 'You are a friendly, conversational LinkedIn message writer for Emerge. CRITICAL: Write at a 5th grade reading level - use simple, clear language that anyone can understand easily. Write like you\'re talking to a colleague - casual, authentic, and human. Keep it simple and avoid corporate jargon. Focus on the recipient\'s potential challenges and goals based on their role, not assumptions about their current situation. If the signal explicitly mentions the recipient downloaded something, you can reference this general fact but do NOT assume which specific document they downloaded. Do not include signatures, sign-offs, or contact information - just the message content.'
            },
            {
              role: 'user',
              content: linkedInPrompt
            }
          ],
          temperature: 0.8
        })

        console.log('\n' + '='.repeat(80))
        console.log('✅ OPENAI API RESPONSE - LINKEDIN GENERATION')
        console.log('='.repeat(80))
        console.log('📧 MODEL: gpt-4o-mini')
        console.log('📅 DAY:', linkedInPlan.day)
        console.log('📏 RESPONSE LENGTH:', linkedInContent.length, 'characters')
        console.log('\n📝 COMPLETE RESPONSE:')
        console.log('-'.repeat(60))
        console.log(linkedInContent)
        console.log('-'.repeat(60))
        console.log('='.repeat(80) + '\n')
        
        generatedMessages.push({
          id: `linkedin-${linkedInPlan.daysLater}-${sequencePlan.linkedInMessages.indexOf(linkedInPlan)}`,
          type: 'linkedin',
          daysLater: linkedInPlan.daysLater,
          content: linkedInContent,
          originalContent: linkedInContent,
          isOptimized: false,
          isGenerating: false,
          isOptimizing: false
        })

        console.log(`✅ Generated LinkedIn message for ${linkedInPlan.daysLater} days later`)

      } catch (linkedInError) {
        console.error(`❌ Error generating LinkedIn message for ${linkedInPlan.daysLater} days later:`, linkedInError)
        // Continue with other messages even if one fails
      }
    }

    // Sort messages by daysLater
    generatedMessages.sort((a, b) => a.daysLater - b.daysLater)

    console.log('✅ All messages generated successfully')

    return NextResponse.json({
      success: true,
      messages: generatedMessages,
      totalMessages: generatedMessages.length,
      emailsGenerated: generatedMessages.filter(m => m.type === 'email').length,
      linkedInGenerated: generatedMessages.filter(m => m.type === 'linkedin').length
    })

  } catch (error) {
    console.error('❌ Error generating messages:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate messages',
        details: 'Please try again with different parameters'
      },
      { status: 500 }
    )
  }
}

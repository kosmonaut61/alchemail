import { NextRequest, NextResponse } from 'next/server'
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { CONTEXT_REPOSITORY, getContextItemsByKeywords, getContextItemsByIndustry, ContextItem } from "@/lib/context-repository"

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
  
  // Find context items that match signal keywords
  const signalKeywords = [...industryKeywords, ...companyKeywords]
  const keywordMatches = getContextItemsByKeywords(signalKeywords.filter(keyword => 
    signalLower.includes(keyword)
  ))
  
  // Find context items that match industry mentions
  const industryMatches = industryKeywords
    .filter(industry => signalLower.includes(industry))
    .flatMap(industry => getContextItemsByIndustry(industry))
  
  // Add customer context items (most important for social proof)
  const customerItems = CONTEXT_REPOSITORY.filter(item => 
    item.category === 'customer' && (
      keywordMatches.includes(item) || 
      industryMatches.includes(item)
    )
  )
  
  // Add case studies that match
  const caseStudyItems = CONTEXT_REPOSITORY.filter(item => 
    item.category === 'case_study' && (
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
  
  // Combine and deduplicate
  const allRelevant = [
    ...customerItems,
    ...caseStudyItems, 
    ...statisticItems,
    ...quoteItems
  ]
  
  // Remove duplicates and limit to top 5 most relevant
  const uniqueItems = allRelevant.filter((item, index, self) => 
    index === self.findIndex(t => t.id === item.id)
  )
  
  return uniqueItems.slice(0, 5)
}

export async function POST(request: NextRequest) {
  try {
    const { signal, persona, painPoints, sequencePlan } = await request.json()

    if (!signal || !persona || !sequencePlan) {
      return NextResponse.json(
        { error: 'Signal, persona, and sequence plan are required' },
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

    console.log('🚀 Generating messages for sequence...')
    console.log('📝 Signal:', signal.substring(0, 100) + '...')
    console.log('👤 Persona:', personaData.label)
    console.log('📧 Emails:', sequencePlan.emails.length)
    console.log('💼 LinkedIn:', sequencePlan.linkedInMessages.length)

    // Dynamically select relevant context based on signal
    const relevantContext = getRelevantContext(signal, personaData, painPoints)
    console.log('🎯 Selected context items:', relevantContext.map(c => c.title).join(', '))

    const generatedMessages = []

    // Generate emails
    for (const emailPlan of sequencePlan.emails) {
      const emailPrompt = `You are a friendly, conversational B2B email writer for Emerge. Write like you're talking to a colleague - casual, authentic, and human. Keep it simple and avoid corporate jargon.

SIGNAL (Primary Reason for Outreach):
${signal}

TARGET PERSONA:
- Role: ${personaData.label}
- Department: ${personaData.department}
- Seniority: ${personaData.seniority}
- Tone Profile: ${personaData.toneProfile}
- Keywords to Use: ${personaData.keywords.join(', ')}
- Selected Pain Points: ${painPoints.join(', ') || 'Not specified'}
- All Available Pain Points: ${personaData.painPoints.join('; ')}

VERIFIED CONTEXT (ONLY use these exact facts - do not make up any customer claims or numbers):
${relevantContext.map(item => `- ${item.title}: ${item.content}`).join('\n')}

EMAIL SPECIFICATIONS:
- Day: ${emailPlan.day}
- Subject: ${emailPlan.subject}
- Purpose: ${emailPlan.purpose}
- Signal Integration: ${emailPlan.signalIntegration}

Write a complete email that:
1. Uses the exact subject line provided
2. Follows the purpose and signal integration guidelines
3. Matches the persona's tone profile and uses their keywords
4. Focuses on the recipient's potential challenges and goals - NEVER assume what they downloaded or their specific business situation
5. Sounds conversational and human (like talking to a friend)
6. Includes a clear call-to-action
7. Is concise but compelling (100-150 words)
8. Does NOT include a signature or sign-off
9. ALWAYS use specific stats and quantified results from the VERIFIED CONTEXT - this is crucial for credibility
10. If no relevant context is available, focus on the signal and pain points without making specific customer claims
11. NEVER mention specific dollar amounts, percentages, or savings unless they are explicitly provided in the VERIFIED CONTEXT
12. NEVER assume what the recipient downloaded, their specific problems, or their business situation
13. Focus on potential challenges they MIGHT face based on their role, not assumptions about their current situation
14. Make each email unique and different - avoid generic phrases like "you're not alone" or "many companies"
15. Use specific numbers and results to make the email compelling and credible

CRITICAL RULES:
- Only use facts from the VERIFIED CONTEXT section. Never make up customer names, savings amounts, percentages, or results that aren't explicitly provided.
- NEVER assume what the recipient downloaded or their specific business situation
- Focus on their potential challenges and goals based on their role, not assumptions about their current state
- Use phrases like "if you're facing..." or "many [role] deal with..." instead of assuming their situation

Format your response as:
Subject: [subject line]

[email body]

Write like you're having a genuine conversation, not sending a formal business proposal.

NEVER ASSUME OR MENTION:
- "I noticed you downloaded..." (NEVER say this)
- "I saw you downloaded..." (NEVER say this)
- What the recipient downloaded or viewed
- Their specific business situation
- What challenges they're currently facing
- Any assumptions about their company or role

CORE PRINCIPLES:
- Start with specific, quantified results from the VERIFIED CONTEXT (this builds credibility)
- Focus on the recipient's potential challenges, not assumptions about their current situation
- Use different approaches and stats for each email to avoid repetition
- Be conversational and authentic - write like you're talking to a colleague
- Let your creativity flow while staying within these boundaries`

      try {
        const { text: emailContent } = await generateText({
          model: openai('gpt-4o-mini'),
          messages: [
            {
              role: 'system',
              content: 'You are a friendly, conversational B2B email writer for Emerge. Write like you\'re talking to a colleague - casual, authentic, and human. Keep it simple and avoid corporate jargon. Focus on the recipient\'s potential challenges and goals based on their role, not assumptions about their current situation. Do not include signatures, sign-offs, or contact information - just the email content.'
            },
            {
              role: 'user',
              content: emailPrompt
            }
          ],
          temperature: 0.8
        })
        
        generatedMessages.push({
          id: `email-${emailPlan.day}`,
          type: 'email',
          day: emailPlan.day,
          content: emailContent,
          originalContent: emailContent,
          isOptimized: false,
          isGenerating: false,
          isOptimizing: false
        })

        console.log(`✅ Generated email for day ${emailPlan.day}`)

      } catch (emailError) {
        console.error(`❌ Error generating email for day ${emailPlan.day}:`, emailError)
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
- Keywords to Use: ${personaData.keywords.join(', ')}
- Selected Pain Points: ${painPoints.join(', ') || 'Not specified'}
- All Available Pain Points: ${personaData.painPoints.join('; ')}

VERIFIED CONTEXT (ONLY use these exact facts - do not make up any customer claims or numbers):
${relevantContext.map(item => `- ${item.title}: ${item.content}`).join('\n')}

LINKEDIN MESSAGE SPECIFICATIONS:
- Day: ${linkedInPlan.day}
- Purpose: ${linkedInPlan.purpose}
- Signal Integration: ${linkedInPlan.signalIntegration}

Write a LinkedIn message that:
1. Follows the purpose and signal integration guidelines
2. Matches the persona's tone profile and uses their keywords
3. Focuses on the recipient's potential challenges and goals - NEVER assume what they downloaded or their specific business situation
4. Is appropriate for the target persona's seniority level
5. Feels personal and professional and only uses 5th grade level language
6. Is concise (50-100 words)
7. Includes a clear call-to-action
8. Feels natural and builds on previous messages
9. Does NOT include a signature or sign-off
10. ALWAYS use specific stats and quantified results from the VERIFIED CONTEXT - this is crucial for credibility
11. NEVER mention specific dollar amounts, percentages, or savings unless they are explicitly provided in the VERIFIED CONTEXT
12. NEVER assume what the recipient downloaded, their specific problems, or their business situation
13. Focus on potential challenges they MIGHT face based on their role, not assumptions about their current situation
14. Make each message unique and different - avoid generic phrases
15. Use specific numbers and results to make the message compelling and credible

CRITICAL: Only use facts from the VERIFIED CONTEXT section. Never make up customer names, savings amounts, percentages, or results that aren't explicitly provided. If you don't have specific numbers, don't mention any. NEVER assume what the recipient downloaded or their specific business situation.

Make sure the message is engaging and drives the conversation forward. Use the tone profile to guide your writing style and incorporate the persona's keywords naturally.

NEVER ASSUME OR MENTION:
- "I noticed you downloaded..." (NEVER say this)
- "I saw you downloaded..." (NEVER say this)
- What the recipient downloaded or viewed
- Their specific business situation
- What challenges they're currently facing
- Any assumptions about their company or role

CORE PRINCIPLES:
- Start with specific, quantified results from the VERIFIED CONTEXT (this builds credibility)
- Focus on the recipient's potential challenges, not assumptions about their current situation
- Use different approaches and stats for each message to avoid repetition
- Be conversational and authentic - write like you're talking to a colleague
- Let your creativity flow while staying within these boundaries`

      try {
        const { text: linkedInContent } = await generateText({
          model: openai('gpt-4o-mini'),
          messages: [
            {
              role: 'system',
              content: 'You are a friendly, conversational LinkedIn message writer for Emerge. Write like you\'re talking to a colleague - casual, authentic, and human. Keep it simple and avoid corporate jargon. Focus on the recipient\'s potential challenges and goals based on their role, not assumptions about their current situation. Do not include signatures, sign-offs, or contact information - just the message content.'
            },
            {
              role: 'user',
              content: linkedInPrompt
            }
          ],
          temperature: 0.8
        })
        
        generatedMessages.push({
          id: `linkedin-${linkedInPlan.day}`,
          type: 'linkedin',
          day: linkedInPlan.day,
          content: linkedInContent,
          originalContent: linkedInContent,
          isOptimized: false,
          isGenerating: false,
          isOptimizing: false
        })

        console.log(`✅ Generated LinkedIn message for day ${linkedInPlan.day}`)

      } catch (linkedInError) {
        console.error(`❌ Error generating LinkedIn message for day ${linkedInPlan.day}:`, linkedInError)
        // Continue with other messages even if one fails
      }
    }

    // Sort messages by day
    generatedMessages.sort((a, b) => a.day - b.day)

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

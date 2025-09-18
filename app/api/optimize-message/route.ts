import { NextRequest, NextResponse } from 'next/server'
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { formatVariablesForPrompt } from '@/lib/dynamic-variables'
import { formatSamplesForPrompt } from '@/lib/email-samples'

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

OPTIMIZATION GUIDELINES:
1. Improve focus on campaign signal with focus on the recipient's pain points, goals, or problems
2. Enhance the value proposition
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
17. Keep sentences reasonably short but don't make them too choppy - maintain natural flow
18. Make sure there are natural line breaks in the message
19. Make sure the message is at a 5th grade reading level

STRUCTURE & TONE OPTIMIZATION:
- Convert formal language to conversational tone
- Replace corporate jargon with direct, simple language
- Ensure proper merge field formatting ({{contact.first_name}}, {{account.name}}, etc.)
- Create short easy to read sentences (under 15 words each)
- Add natural line breaks for readability
- Use active voice throughout
- Remove unnecessary words and phrases
- Make the opening more engaging and direct
- Ensure the CTA is hyperlinked and naturally integrated
- PRESERVE natural conversational flow - don't make sentences too choppy
- MAINTAIN the warm, friendly tone of the original
- Keep the human, approachable feel - avoid being too sales-y or aggressive

SPECIFIC IMPROVEMENTS TO MATCH SAMPLE QUALITY:
- Make the opening more direct and impactful 
- Add urgency and time sensitivity
- Include implementation details with stats
- Make CTAs more specific and benefit-focused
- Use more confident, assertive language ("I know", "We can", "That's why")
- Add credibility markers 
- Include company name in CTA for personalization ("help {{account.name}} achieve similar results")

TONE PRESERVATION:
- MAINTAIN the warm, conversational tone of the original
- Keep natural, flowing language - don't make it too aggressive or sales-y
- Preserve the friendly, approachable feel
- Don't shorten too much - maintain substance and warmth
- Keep the "human" element - write like you're talking to a colleague, not selling
- Preserve warm phrases like "great to see your interest" instead of making them cold or direct
- Maintain the supportive, helpful tone rather than being pushy or overly sales-focused

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
- Do NOT make messages longer than the original

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

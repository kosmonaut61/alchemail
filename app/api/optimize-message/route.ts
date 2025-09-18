import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

    console.log(`🔍 Optimizing ${type} message: ${messageId}`)
    console.log('👤 Persona:', personaData.label)

    const optimizationPrompt = `You are an expert email and LinkedIn message optimizer specializing in B2B outreach. Optimize this message for maximum engagement and response rates.

ORIGINAL MESSAGE:
${originalContent}

CONTEXT:
- Message Type: ${type}
- Target Persona: ${personaData.label} (${personaData.department}, ${personaData.seniority})
- Signal: ${signal}
- Pain Points: ${painPoints.join(', ') || 'Not specified'}

OPTIMIZATION GUIDELINES:
1. Improve clarity and readability
2. Enhance the value proposition
3. Strengthen the call-to-action
4. Ensure appropriate tone for the persona's seniority level
5. Better integrate the signal naturally
6. Address pain points more effectively
7. Improve subject line (for emails)
8. Make the message more compelling and actionable
9. Maintain professional tone while being engaging
10. Ensure proper formatting and structure

For emails:
- Keep subject lines under 50 characters
- Use proper email formatting with clear sections
- Include strong value proposition early
- End with clear, specific call-to-action

For LinkedIn messages:
- Keep under 100 words
- Start with personal connection or value
- Be conversational but professional
- End with clear next steps

Return the optimized message with the same format as the original. Focus on improvements that will increase open rates, response rates, and engagement.`

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert B2B message optimizer. Improve messages for maximum engagement while maintaining authenticity and professionalism.'
        },
        {
          role: 'user',
          content: optimizationPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    })

    const optimizedContent = response.choices[0]?.message?.content || ''
    
    if (!optimizedContent) {
      throw new Error('No optimized content received from OpenAI')
    }

    console.log('✅ Message optimized successfully')

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
        'Improved formatting'
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

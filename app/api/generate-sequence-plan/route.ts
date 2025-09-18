import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { signal, persona, painPoints, emailCount, linkedInCount } = await request.json()

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

    // Create the prompt for sequence plan generation
    const prompt = `You are an expert email sequence strategist. Create a strategic sequence plan for B2B outreach.

SIGNAL (Primary Reason for Outreach):
${signal}

TARGET PERSONA:
- Role: ${personaData.label}
- Department: ${personaData.department}
- Seniority: ${personaData.seniority}
- Key Pain Points: ${painPoints.join(', ') || 'Not specified'}

SEQUENCE REQUIREMENTS:
- Emails: ${emailCount}
- LinkedIn Messages: ${linkedInCount}

Create a strategic sequence plan that:
1. Naturally introduces the signal in each message
2. Builds value and trust progressively
3. Addresses the target persona's pain points
4. Uses appropriate spacing between messages (2-3 days for emails, 1-2 days for LinkedIn)
5. Has clear purposes for each touchpoint
6. Integrates the signal naturally without being repetitive

Return your response as a JSON object with this exact structure:
{
  "emails": [
    {
      "day": 1,
      "subject": "Subject line here",
      "purpose": "Purpose of this email",
      "signalIntegration": "How the signal is integrated"
    }
  ],
  "linkedInMessages": [
    {
      "day": 3,
      "purpose": "Purpose of this LinkedIn message",
      "signalIntegration": "How the signal is integrated"
    }
  ],
  "totalDays": 8
}

Make sure the sequence feels natural and builds momentum. Each message should advance the conversation and provide value.`

    console.log('🚀 Generating sequence plan with GPT-5-nano...')
    console.log('📝 Signal:', signal.substring(0, 100) + '...')
    console.log('👤 Persona:', personaData.label)

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Using GPT-4o-mini for speed and reliability
      messages: [
        {
          role: 'system',
          content: 'You are an expert email sequence strategist specializing in B2B outreach. Always respond with valid JSON that matches the exact structure requested.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content received from OpenAI')
    }

    console.log('✅ Sequence plan generated successfully')

    // Parse the JSON response
    let sequencePlan
    try {
      sequencePlan = JSON.parse(content)
    } catch (parseError) {
      console.error('❌ Failed to parse sequence plan JSON:', parseError)
      throw new Error('Invalid JSON response from AI')
    }

    // Validate the structure
    if (!sequencePlan.emails || !sequencePlan.linkedInMessages || !sequencePlan.totalDays) {
      throw new Error('Invalid sequence plan structure')
    }

    return NextResponse.json({
      success: true,
      sequencePlan,
      persona: personaData.label,
      signal: signal.substring(0, 100) + '...'
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

import { NextRequest, NextResponse } from 'next/server'
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

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

CRITICAL: You must respond with ONLY valid JSON. Do not include any text before or after the JSON. The response must be parseable as JSON.

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

    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      messages: [
        {
          role: 'system',
          content: 'You are an expert email sequence strategist specializing in B2B outreach. You must respond with ONLY valid JSON. Do not include any explanatory text, markdown formatting, or code blocks. Return only the JSON object.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7
    })

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
      throw new Error(`Invalid JSON response from AI: ${parseError.message}`)
    }

    // Validate the structure
    if (!sequencePlan.emails || !sequencePlan.linkedInMessages || !sequencePlan.totalDays) {
      console.warn('⚠️ Invalid sequence plan structure, using fallback')
      
      // Create a fallback sequence plan
      sequencePlan = {
        emails: [
          {
            day: 1,
            subject: "Quick question about your freight costs",
            purpose: "Initial value-driven opener",
            signalIntegration: "Lead with the signal and provide value"
          },
          {
            day: 4,
            subject: "Following up on freight optimization",
            purpose: "Reinforce value proposition",
            signalIntegration: "Share specific examples related to the signal"
          },
          {
            day: 8,
            subject: "One last thought on freight savings",
            purpose: "Final attempt with urgency",
            signalIntegration: "Highlight time-sensitive aspects of the signal"
          }
        ].slice(0, emailCount),
        linkedInMessages: [
          {
            day: 3,
            purpose: "Connect and add value",
            signalIntegration: "Share industry insight related to their challenges"
          },
          {
            day: 7,
            purpose: "Follow up on email",
            signalIntegration: "Reference the email and offer additional resources"
          }
        ].slice(0, linkedInCount),
        totalDays: Math.max(...[
          ...(sequencePlan.emails || []).map(e => e.day),
          ...(sequencePlan.linkedInMessages || []).map(m => m.day)
        ], 8)
      }
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

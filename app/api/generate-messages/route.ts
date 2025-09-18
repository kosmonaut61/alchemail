import { NextRequest, NextResponse } from 'next/server'
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

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

    const generatedMessages = []

    // Generate emails
    for (const emailPlan of sequencePlan.emails) {
      const emailPrompt = `You are an expert email copywriter specializing in B2B outreach. Write a professional, engaging email that follows the sequence plan.

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

EMAIL SPECIFICATIONS:
- Day: ${emailPlan.day}
- Subject: ${emailPlan.subject}
- Purpose: ${emailPlan.purpose}
- Signal Integration: ${emailPlan.signalIntegration}

Write a complete email that:
1. Uses the exact subject line provided
2. Follows the purpose and signal integration guidelines
3. Matches the persona's tone profile and uses their keywords
4. Addresses the selected pain points naturally
5. Feels personal and professional
6. Includes a clear call-to-action
7. Is concise but compelling (100-200 words)
8. Does NOT include a signature or sign-off

Format your response as:
Subject: [subject line]

[email body]

Make sure the email feels natural and builds on previous messages in the sequence. Use the tone profile to guide your writing style and incorporate the persona's keywords naturally.`

      try {
        const { text: emailContent } = await generateText({
          model: openai('gpt-4o-mini'),
          messages: [
            {
              role: 'system',
              content: 'You are an expert B2B email copywriter. Write compelling, professional emails that drive engagement and responses. Do not include signatures, sign-offs, or contact information - just the email content.'
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
      const linkedInPrompt = `You are an expert LinkedIn message writer specializing in B2B outreach. Write a professional, engaging LinkedIn message that follows the sequence plan.

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

LINKEDIN MESSAGE SPECIFICATIONS:
- Day: ${linkedInPlan.day}
- Purpose: ${linkedInPlan.purpose}
- Signal Integration: ${linkedInPlan.signalIntegration}

Write a LinkedIn message that:
1. Follows the purpose and signal integration guidelines
2. Matches the persona's tone profile and uses their keywords
3. Addresses the selected pain points naturally
4. Is appropriate for the target persona's seniority level
5. Feels personal and professional
6. Is concise (50-100 words)
7. Includes a clear call-to-action
8. Feels natural and builds on previous messages
9. Does NOT include a signature or sign-off

Make sure the message is engaging and drives the conversation forward. Use the tone profile to guide your writing style and incorporate the persona's keywords naturally.`

      try {
        const { text: linkedInContent } = await generateText({
          model: openai('gpt-4o-mini'),
          messages: [
            {
              role: 'system',
              content: 'You are an expert LinkedIn message writer. Write compelling, professional messages that drive engagement and build relationships. Do not include signatures, sign-offs, or contact information - just the message content.'
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

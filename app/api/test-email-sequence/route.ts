import { NextRequest, NextResponse } from 'next/server'

/**
 * Simple test endpoint to verify email sequence generation works
 * This tests the full flow: sequence plan -> message generation
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing email sequence generation...')

    // Check API key first
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { 
          error: 'OpenAI API key not configured',
          success: false 
        },
        { status: 500 }
      )
    }
    console.log('✅ API key found')

    // Simple test data
    const testData = {
      signal: "Prospect downloaded our freight optimization case study",
      persona: "operations_management",
      painPoints: ["high freight costs", "inefficient carrier selection"],
      emailCount: 2,
      linkedInCount: 0,
      contextItems: []
    }

    console.log('📝 Test data:', testData)

    // Step 1: Generate sequence plan
    console.log('🎯 Step 1: Generating sequence plan...')
    const planResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/generate-sequence-plan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    })

    if (!planResponse.ok) {
      const errorText = await planResponse.text()
      console.error('❌ Sequence plan error:', errorText)
      return NextResponse.json(
        { 
          error: 'Failed to generate sequence plan',
          details: errorText,
          success: false 
        },
        { status: planResponse.status }
      )
    }

    const planData = await planResponse.json()
    console.log('✅ Sequence plan generated:', {
      emails: planData.sequencePlan?.emails?.length || 0,
      linkedIn: planData.sequencePlan?.linkedInMessages?.length || 0,
    })

    if (!planData.success || !planData.sequencePlan) {
      return NextResponse.json(
        { 
          error: 'Sequence plan generation failed',
          details: planData,
          success: false 
        },
        { status: 500 }
      )
    }

    // Step 2: Generate messages
    console.log('🎯 Step 2: Generating messages...')
    const messagesResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/generate-messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        signal: testData.signal,
        persona: testData.persona,
        painPoints: testData.painPoints,
        sequencePlan: planData.sequencePlan,
        contextItems: planData.contextItems || [],
      }),
    })

    if (!messagesResponse.ok) {
      const errorText = await messagesResponse.text()
      console.error('❌ Messages generation error:', errorText)
      return NextResponse.json(
        { 
          error: 'Failed to generate messages',
          details: errorText,
          success: false,
          sequencePlan: planData.sequencePlan,
        },
        { status: messagesResponse.status }
      )
    }

    const messagesData = await messagesResponse.json()
    console.log('✅ Messages generated:', {
      total: messagesData.messages?.length || 0,
      emails: messagesData.emailsGenerated || 0,
      linkedIn: messagesData.linkedInGenerated || 0,
    })

    return NextResponse.json({
      success: true,
      message: 'Email sequence generation test completed successfully!',
      testData,
      sequencePlan: {
        emails: planData.sequencePlan.emails.length,
        linkedInMessages: planData.sequencePlan.linkedInMessages.length,
        totalDays: planData.sequencePlan.totalDays,
      },
      messages: {
        total: messagesData.messages?.length || 0,
        emails: messagesData.emailsGenerated || 0,
        linkedIn: messagesData.linkedInGenerated || 0,
        sampleEmail: messagesData.messages?.[0]?.content?.substring(0, 200) || 'No messages generated',
      },
    })

  } catch (error) {
    console.error('❌ Test error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        success: false 
      },
      { status: 500 }
    )
  }
}


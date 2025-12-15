import { NextRequest, NextResponse } from 'next/server'

const WORKFLOW_ID = 'wf_693c77f188cc8190823a200bf9ad277600f80275a4c4acbd'
const OPENAI_API_BASE = 'https://api.openai.com/v1'

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    const { user } = await request.json()
    const userId = user || `user-${Date.now()}`

    console.log('🚀 ===== CHATKIT SESSION CREATION =====')
    console.log('👤 User ID:', userId)
    console.log('🔗 Workflow ID:', WORKFLOW_ID)

    // Create a ChatKit session using the HTTP API directly
    const response = await fetch(`${OPENAI_API_BASE}/chatkit/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'OpenAI-Beta': 'chatkit_beta=v1',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        workflow: { 
          id: WORKFLOW_ID,
          version: "3" // Use version 3 as shown in the ChatKit interface
        },
        user: userId,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ ChatKit API error:', response.status, errorText)
      throw new Error(`ChatKit API error: ${response.status} ${errorText}`)
    }

    const session = await response.json()
    console.log('✅ ChatKit session created:', session.id || 'success')

    return NextResponse.json({
      client_secret: session.client_secret,
      session_id: session.id,
    })

  } catch (error) {
    console.error('❌ Error creating ChatKit session:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to create ChatKit session',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}


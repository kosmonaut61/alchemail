import { NextRequest, NextResponse } from 'next/server'

// In-memory store for generation status (in production, use Redis or database)
const generationStatus = new Map<string, {
  status: string
  progress: number
  message: string
  timestamp: number
}>()

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')
  
  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 })
  }
  
  const status = generationStatus.get(sessionId)
  
  if (!status) {
    return NextResponse.json({ 
      status: 'not_found',
      progress: 0,
      message: 'No generation in progress',
      timestamp: Date.now()
    })
  }
  
  return NextResponse.json(status)
}

export async function POST(request: NextRequest) {
  try {
    const { sessionId, status, progress, message } = await request.json()
    
    if (!sessionId || !status) {
      return NextResponse.json({ error: 'Session ID and status required' }, { status: 400 })
    }
    
    generationStatus.set(sessionId, {
      status,
      progress: progress || 0,
      message: message || '',
      timestamp: Date.now()
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')
  
  if (sessionId) {
    generationStatus.delete(sessionId)
  }
  
  return NextResponse.json({ success: true })
}

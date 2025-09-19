import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  console.log('🚀 Testing OpenAI import...')
  
  try {
    console.log('📝 Parsing request...')
    const { prompt = "test" } = await request.json()
    console.log('✅ Request parsed')
    
    console.log('🔑 Checking API key...')
    const apiKey = process.env.OPENAI_API_KEY
    console.log('✅ API key checked:', !!apiKey)
    
    console.log('📦 Importing AI SDK...')
    const { openai } = await import("@ai-sdk/openai")
    console.log('✅ AI SDK imported')
    
    console.log('📦 Importing generateText...')
    const { generateText } = await import("ai")
    console.log('✅ generateText imported')
    
    console.log('🤖 Testing generateText...')
    const { text } = await generateText({
      model: openai("gpt-5", {
        apiKey: process.env.OPENAI_API_KEY,
      }),
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      maxTokens: 100,
    })
    console.log('✅ generateText completed')
    
    return NextResponse.json({ 
      success: true,
      message: "OpenAI import test successful!",
      text: text
    })
    
  } catch (error) {
    console.error('❌ OpenAI import test error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }, { status: 500 })
  }
}


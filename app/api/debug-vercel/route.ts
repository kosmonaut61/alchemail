import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Vercel Debug API called');
    
    // Check environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    const nodeEnv = process.env.NODE_ENV;
    
    // Try to parse the request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (error) {
      requestBody = { error: 'Failed to parse request body', details: error };
    }
    
    // Test OpenAI import
    let openaiImport;
    try {
      const { OpenAI } = await import('openai');
      openaiImport = { success: true, hasOpenAI: !!OpenAI };
    } catch (error) {
      openaiImport = { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
    
    // Test basic GPT-5 call
    let gpt5Test;
    try {
      if (apiKey) {
        const { OpenAI } = await import('openai');
        const openaiClient = new OpenAI();
        
        // Simple test call
        const response = await openaiClient.chat.completions.create({
          model: "gpt-4o-mini", // Use a reliable model for testing
          messages: [{ role: "user", content: "Say hello" }],
          max_completion_tokens: 10
        });
        
        gpt5Test = { 
          success: true, 
          response: response.choices[0]?.message?.content || 'No content',
          model: "gpt-4o-mini"
        };
      } else {
        gpt5Test = { success: false, error: 'No API key available' };
      }
    } catch (error) {
      gpt5Test = { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      };
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        nodeEnv,
        hasApiKey: !!apiKey,
        apiKeyLength: apiKey ? apiKey.length : 0,
        apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + '...' : 'Not set'
      },
      request: {
        method: req.method,
        url: req.url,
        body: requestBody
      },
      openaiImport,
      gpt5Test,
      allEnvVars: Object.keys(process.env).filter(key => key.includes('OPENAI') || key.includes('VERCEL'))
    });
    
  } catch (error) {
    console.error('❌ Debug API Error:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

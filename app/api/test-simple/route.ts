import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log('🚀 Simple test API called');
    
    const { prompt = "Write a simple email", model = "gpt-5" } = await req.json();
    console.log(`📝 Prompt: ${prompt}`);
    console.log(`🤖 Model: ${model}`);

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }
    console.log('✅ API key found');

    console.log('🚀 Calling GPT-5...');
    const { text, usage, finishReason } = await generateText({
      model: openai(model, {
        apiKey: process.env.OPENAI_API_KEY,
      }),
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      maxTokens: 2000,
      temperature: 0.7,
    });

    console.log('✅ GPT-5 response received');
    console.log(`📊 Usage:`, usage);

    return NextResponse.json({ 
      success: true,
      text,
      usage,
      finishReason,
      model: model
    });

  } catch (error) {
    console.error("❌ Simple test error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error occurred",
      success: false
    }, { status: 500 });
  }
}




import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, model = "gpt-5" } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    console.log(`[TEST] Using model: ${model}`);
    console.log(`[TEST] Prompt length: ${prompt.length} characters`);

    // Use the exact same pattern as the working chatbot
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
      topP: 0.9,
      frequencyPenalty: 0.1,
      presencePenalty: 0.1,
    });

    console.log(`[TEST] Response generated successfully, usage:`, usage);

    return NextResponse.json({ 
      success: true,
      text,
      usage,
      finishReason,
      model: model
    });

  } catch (error) {
    console.error("[TEST] Error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error occurred",
      success: false
    }, { status: 500 });
  }
}

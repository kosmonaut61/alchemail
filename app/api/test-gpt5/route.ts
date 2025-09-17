import { generateWithGPT5, generateWithOpenAIDirect } from "@/lib/openai-models";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, model = "gpt-5", useDirect = false } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });
    }

    console.log(`Testing with model: ${model}, useDirect: ${useDirect}`);

    let output: string;
    
    if (useDirect) {
      output = await generateWithOpenAIDirect(prompt, model);
    } else {
      output = await generateWithGPT5(prompt, model);
    }

    return NextResponse.json({ 
      success: true,
      output,
      model: model,
      method: useDirect ? "direct" : "ai-sdk"
    });

  } catch (error) {
    console.error("Test API Error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error occurred",
      success: false
    }, { status: 500 });
  }
}

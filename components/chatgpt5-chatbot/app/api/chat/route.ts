import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    if (!prompt) {
      return Response.json({ error: "Prompt is required" }, { status: 400 })
    }

    console.log("[v0] Using model: gpt-5")

    const { text, usage, finishReason } = await generateText({
      model: openai("gpt-5"),
      messages: [
        {
          role: "system",
          content:
            "You are ChatGPT-5, the latest version of OpenAI's language model. When asked about your identity or model version, you should identify yourself as GPT-5 or ChatGPT-5.",
        },
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
    })

    console.log("[v0] Response generated successfully, usage:", usage)

    return Response.json({
      text,
      usage,
      finishReason,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return Response.json({ error: "Failed to generate response" }, { status: 500 })
  }
}

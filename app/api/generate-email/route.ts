import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"
import { getPreamble } from "@/lib/preamble"

export async function POST(request: NextRequest) {
  try {
    const { persona, signal, painPoints } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    const preamble = await getPreamble()

    const prompt = `${preamble}

GENERATION REQUEST:
- Persona/Role: ${persona}
- Signal: ${signal}
- Pain Points: ${painPoints.join(", ")}

Please generate an email sequence following all the rules and guidelines provided in the preamble above. Focus on the specified persona, incorporate the signal, and address the selected pain points.`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      maxTokens: 2000,
    })

    return NextResponse.json({ email: text })
  } catch (error) {
    console.error("Error generating email:", error)
    return NextResponse.json({ error: "Failed to generate email" }, { status: 500 })
  }
}

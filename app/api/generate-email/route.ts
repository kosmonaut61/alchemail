import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"
import { getPreamble } from "@/lib/preamble"
import { ContextItem } from "@/lib/context-repository"

export async function POST(request: NextRequest) {
  try {
    const { persona, signal, painPoints, contextItems, generateOverview } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    // Handle overview generation
    if (generateOverview) {
      const { text } = await generateText({
        model: openai("gpt-4o-mini"),
        prompt: signal,
        maxTokens: 300,
      })
      return NextResponse.json({ email: text })
    }

    const preamble = await getPreamble()

    // Build dynamic context from selected items
    const dynamicContext = buildDynamicContext(contextItems || [])
    
    console.log("=== DEBUG INFO ===")
    console.log("Context items received:", contextItems?.length || 0)
    if (contextItems && contextItems.length > 0) {
      console.log("Context items details:", contextItems.map(item => ({ id: item.id, title: item.title, category: item.category })))
    }
    console.log("Dynamic context generated:", dynamicContext)
    console.log("==================")

    const prompt = `${preamble}

${dynamicContext}

GENERATION REQUEST:
- Persona/Role: ${persona}
- Signal: ${signal}
- Pain Points: ${painPoints.join(", ")}

Please generate an email sequence following all the rules and guidelines provided in the preamble above. Use the specific context provided to create highly relevant and personalized content. Focus on the specified persona, incorporate the signal, and address the selected pain points.`

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

function buildDynamicContext(contextItems: ContextItem[]): string {
  if (!contextItems || contextItems.length === 0) {
    return ""
  }

  const contextByCategory = contextItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ContextItem[]>)

  let context = "## RELEVANT CONTEXT FOR THIS EMAIL:\n\n"

  // Add customers
  if (contextByCategory.customer) {
    context += "### Relevant Customers:\n"
    contextByCategory.customer.forEach(item => {
      context += `- ${item.content}\n`
    })
    context += "\n"
  }

  // Add case studies
  if (contextByCategory.case_study) {
    context += "### Relevant Case Studies:\n"
    contextByCategory.case_study.forEach(item => {
      context += `- ${item.title}: ${item.content}`
      if (item.url) {
        context += ` (URL: ${item.url})`
      }
      context += `\n`
    })
    context += "\n"
  }

  // Add value propositions
  if (contextByCategory.value_prop) {
    context += "### Relevant Value Propositions:\n"
    contextByCategory.value_prop.forEach(item => {
      context += `- ${item.content}\n`
    })
    context += "\n"
  }

  // Add statistics
  if (contextByCategory.statistic) {
    context += "### Relevant Statistics:\n"
    contextByCategory.statistic.forEach(item => {
      context += `- ${item.content}\n`
    })
    context += "\n"
  }

  // Add customer quotes
  if (contextByCategory.quote) {
    context += "### Relevant Customer Quotes:\n"
    contextByCategory.quote.forEach(item => {
      context += `- ${item.content}\n`
    })
    context += "\n"
  }

  // Add language styles
  if (contextByCategory.language_style) {
    context += "### Relevant Language Guidelines:\n"
    contextByCategory.language_style.forEach(item => {
      context += `- ${item.content}\n`
    })
    context += "\n"
  }

  return context
}

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"
import { CONTEXT_REPOSITORY, ContextItem } from "@/lib/context-repository"

export async function POST(request: NextRequest) {
  try {
    const { signal, persona, painPoints } = await request.json()

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 })
    }

    // Create a prompt to analyze the signal and suggest relevant context items
    const analysisPrompt = `Analyze the following email generation request and suggest relevant context items from our repository.

SIGNAL: ${signal}
PERSONA: ${persona}
PAIN POINTS: ${painPoints.join(", ")}

CONTEXT REPOSITORY:
${CONTEXT_REPOSITORY.map(item => `ID: ${item.id}
Title: ${item.title}
Category: ${item.category}
Industry: ${item.industry?.join(", ") || "N/A"}
Persona: ${item.persona?.join(", ") || "N/A"}
Pain Points: ${item.pain_points?.join(", ") || "N/A"}
Keywords: ${item.keywords?.join(", ") || "N/A"}
Content: ${item.content}

---`).join("\n")}

Based on the signal, persona, and pain points, suggest 8-12 relevant context items that would be most useful for generating this email. Consider:
1. Industry relevance
2. Persona alignment
3. Pain point matching
4. Keyword relevance
5. A good mix of customer examples, case studies, value props, and language styles

Return your response as a JSON array of context item IDs that should be included, like this:
["item_id_1", "item_id_2", "item_id_3", ...]`

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt: analysisPrompt,
      maxTokens: 1000,
    })

    // Parse the JSON response
    let suggestedIds: string[]
    try {
      suggestedIds = JSON.parse(text)
    } catch (error) {
      console.error("Error parsing AI response:", error)
      // Fallback: return items based on simple matching
      suggestedIds = getFallbackContextItems(signal, persona, painPoints)
    }

    // Get the full context items for the suggested IDs
    const suggestedItems = CONTEXT_REPOSITORY.filter(item => suggestedIds.includes(item.id))

    return NextResponse.json({ 
      suggestedItems,
      allItems: CONTEXT_REPOSITORY // Include all items for the UI
    })
  } catch (error) {
    console.error("Error analyzing context:", error)
    return NextResponse.json({ error: "Failed to analyze context" }, { status: 500 })
  }
}

// Fallback function for simple matching when AI parsing fails
function getFallbackContextItems(signal: string, persona: string, painPoints: string[]): string[] {
  const suggestedIds: string[] = []
  
  // Add items based on persona
  if (persona === "Enterprise") {
    suggestedIds.push("enterprise_language")
  } else if (persona === "SMB") {
    suggestedIds.push("smb_language")
  }
  
  // Add items based on pain points
  if (painPoints.includes("Cost")) {
    suggestedIds.push("cost_savings_value_prop", "cost_focused_language", "dollar_tree_case_study")
  }
  if (painPoints.includes("Effort") || painPoints.includes("Efficiency")) {
    suggestedIds.push("efficiency_value_prop", "efficiency_focused_language", "ezrack_case_study")
  }
  
  // Add some general items
  suggestedIds.push("dollar_tree_quote", "golden_state_quote")
  
  return suggestedIds.slice(0, 10) // Limit to 10 items
}

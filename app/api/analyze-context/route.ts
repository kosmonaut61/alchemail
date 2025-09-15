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
${item.url ? `URL: ${item.url}` : ''}

---`).join("\n")}

Based on the signal, persona, and pain points, suggest 8-12 relevant context items that would be most useful for generating this email. Consider:
1. Industry relevance - match companies mentioned in signal to industry categories
2. Persona alignment - use appropriate language styles for Enterprise vs SMB
3. Pain point matching - prioritize value props and case studies that address specific pain points
4. Keyword relevance - look for keyword matches between signal and context items
5. A good mix of customer examples, case studies, value props, and language styles
6. ALWAYS include at least 1-2 case studies when available, especially if the signal mentions specific companies or industries
7. Include relevant customer quotes and statistics for social proof

IMPORTANT: Look for company names in the signal (like "Dollar Tree", "Golden State Foods", "EZRack", "Pepsi") and include their corresponding case studies.

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
  const signalLower = signal.toLowerCase()
  
  // Add items based on persona
  if (persona === "Enterprise") {
    suggestedIds.push("enterprise_language")
  } else if (persona === "SMB") {
    suggestedIds.push("smb_language")
  }
  
  // Check for specific company mentions in signal
  if (signalLower.includes("dollar tree")) {
    suggestedIds.push("dollar_tree_case_study", "dollar_tree_quote", "dollar_tree_stats")
  }
  if (signalLower.includes("golden state") || signalLower.includes("golden state foods")) {
    suggestedIds.push("golden_state_foods_case_study", "golden_state_quote", "golden_state_stats")
  }
  if (signalLower.includes("ezrack") || signalLower.includes("ez rack")) {
    suggestedIds.push("ezrack_case_study", "ezrack_quote")
  }
  if (signalLower.includes("pepsi")) {
    suggestedIds.push("pepsi_case_study")
  }
  
  // Add items based on pain points
  if (painPoints.includes("Cost")) {
    suggestedIds.push("cost_savings_value_prop", "cost_focused_language")
    if (!suggestedIds.includes("dollar_tree_case_study")) {
      suggestedIds.push("dollar_tree_case_study")
    }
  }
  if (painPoints.includes("Effort") || painPoints.includes("Efficiency")) {
    suggestedIds.push("efficiency_value_prop", "efficiency_focused_language")
    if (!suggestedIds.includes("ezrack_case_study")) {
      suggestedIds.push("ezrack_case_study")
    }
  }
  
  // Add industry-specific items based on signal keywords
  if (signalLower.includes("retail") || signalLower.includes("grocery") || signalLower.includes("store")) {
    suggestedIds.push("retail_customers", "dollar_tree_case_study")
  }
  if (signalLower.includes("food") || signalLower.includes("beverage") || signalLower.includes("snack")) {
    suggestedIds.push("food_beverage_customers", "golden_state_foods_case_study", "pepsi_case_study")
  }
  if (signalLower.includes("logistics") || signalLower.includes("warehouse") || signalLower.includes("shipping")) {
    suggestedIds.push("logistics_customers", "ezrack_case_study")
  }
  if (signalLower.includes("manufacturing") || signalLower.includes("production")) {
    suggestedIds.push("manufacturing_customers")
  }
  
  // Add some general items if we don't have enough
  if (suggestedIds.length < 5) {
    suggestedIds.push("dollar_tree_quote", "golden_state_quote")
  }
  
  return suggestedIds.slice(0, 12) // Limit to 12 items
}

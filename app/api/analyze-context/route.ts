import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { type NextRequest, NextResponse } from "next/server"
import { CONTEXT_REPOSITORY, ContextItem } from "@/lib/context-repository"
import { getPersonaById } from "@/lib/personas"

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
2. Persona alignment - use appropriate language styles for persona. Consider the positon they have and what their KPIs are.
3. Pain point matching - prioritize value props and case studies that address specific pain points
4. Keyword relevance - look for keyword matches between signal and context items
5. A good mix of customer examples, case studies, value props, and language styles
6. ALWAYS include at least 1-2 case studies when available, especially if the signal mentions specific companies or industries
7. Include relevant customer quotes and statistics for social proof

KEYWORD MATCHING PRIORITIES:
- Industry keywords: retail, food, beverage, automotive, auto, car, tire, vehicle, logistics, shipping, transport, warehouse, manufacturing, production, factory, plant
- Pain point keywords: cost, savings, spend, budget, money, price, efficiency, time, automation, streamline, faster, effort, coverage, carriers, network, lanes, capacity
- Process keywords: rfp, tender, bid, booking, confirmation, pricing
- Company-specific keywords: dollar tree, golden state foods, ezrack, pepsi

IMPORTANT: Look for company names in the signal (like "Dollar Tree", "Golden State Foods", "EZRack", "Pepsi") and include their corresponding case studies.

ALSO IMPORTANT: Look for industry keywords in the signal (like "automotive", "auto", "car", "tire", "vehicle", "retail", "food", "logistics", "manufacturing") and include relevant customer examples and case studies for those industries.

Return your response as a JSON array of context item IDs that should be included, like this:
["item_id_1", "item_id_2", "item_id_3", ...]`

    const { text } = await generateText({
      model: openai("gpt-5-turbo"),
      prompt: analysisPrompt,
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

    // Note: Persona-specific pain points and tone profile are handled directly in the email generation API
    // No need to add them to context repository as they're passed directly to the generation prompt

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
  
  // Fallback to old system for backward compatibility
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
  
  // Comprehensive industry keyword matching
  // Retail keywords
  if (signalLower.includes("retail") || signalLower.includes("grocery") || signalLower.includes("store") || 
      signalLower.includes("chain") || signalLower.includes("shopping")) {
    suggestedIds.push("retail_customers")
    if (!suggestedIds.includes("dollar_tree_case_study")) {
      suggestedIds.push("dollar_tree_case_study")
    }
  }
  
  // Food & Beverage keywords
  if (signalLower.includes("food") || signalLower.includes("beverage") || signalLower.includes("snack") || 
      signalLower.includes("drink") || signalLower.includes("production") || signalLower.includes("manufacturing")) {
    suggestedIds.push("food_beverage_customers")
    if (!suggestedIds.includes("golden_state_foods_case_study")) {
      suggestedIds.push("golden_state_foods_case_study")
    }
    if (!suggestedIds.includes("pepsi_case_study")) {
      suggestedIds.push("pepsi_case_study")
    }
  }
  
  // Automotive keywords
  if (signalLower.includes("automotive") || signalLower.includes("auto") || signalLower.includes("car") || 
      signalLower.includes("tire") || signalLower.includes("vehicle")) {
    suggestedIds.push("automotive_customers")
  }
  
  // Logistics keywords
  if (signalLower.includes("logistics") || signalLower.includes("shipping") || signalLower.includes("transport") || 
      signalLower.includes("warehouse") || signalLower.includes("distribution")) {
    suggestedIds.push("logistics_customers")
    if (!suggestedIds.includes("ezrack_case_study")) {
      suggestedIds.push("ezrack_case_study")
    }
  }
  
  // Manufacturing keywords
  if (signalLower.includes("manufacturing") || signalLower.includes("production") || signalLower.includes("factory") || 
      signalLower.includes("plant") || signalLower.includes("industrial")) {
    suggestedIds.push("manufacturing_customers")
  }
  
  // Cost-related keywords
  if (signalLower.includes("cost") || signalLower.includes("savings") || signalLower.includes("spend") || 
      signalLower.includes("budget") || signalLower.includes("money") || signalLower.includes("price")) {
    if (!suggestedIds.includes("cost_savings_value_prop")) {
      suggestedIds.push("cost_savings_value_prop")
    }
    if (!suggestedIds.includes("cost_focused_language")) {
      suggestedIds.push("cost_focused_language")
    }
  }
  
  // Efficiency-related keywords
  if (signalLower.includes("efficiency") || signalLower.includes("time") || signalLower.includes("automation") || 
      signalLower.includes("streamline") || signalLower.includes("faster") || signalLower.includes("effort")) {
    if (!suggestedIds.includes("efficiency_value_prop")) {
      suggestedIds.push("efficiency_value_prop")
    }
    if (!suggestedIds.includes("efficiency_focused_language")) {
      suggestedIds.push("efficiency_focused_language")
    }
  }
  
  // Coverage/Capacity keywords
  if (signalLower.includes("coverage") || signalLower.includes("carriers") || signalLower.includes("network") || 
      signalLower.includes("lanes") || signalLower.includes("capacity")) {
    suggestedIds.push("coverage_value_prop")
  }
  
  // RFP-related keywords
  if (signalLower.includes("rfp") || signalLower.includes("tender") || signalLower.includes("bid")) {
    if (!suggestedIds.includes("golden_state_foods_case_study")) {
      suggestedIds.push("golden_state_foods_case_study")
    }
  }
  
  // Add some general items if we don't have enough
  if (suggestedIds.length < 5) {
    suggestedIds.push("dollar_tree_quote", "golden_state_quote")
  }
  
  return suggestedIds.slice(0, 12) // Limit to 12 items
}

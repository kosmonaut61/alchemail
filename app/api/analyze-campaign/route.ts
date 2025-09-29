import { NextRequest, NextResponse } from 'next/server'
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { messages, signal, persona, painPoints, contextItems, userFeedback } = await request.json()

    if (!messages || !signal || !persona) {
      return NextResponse.json(
        { error: 'Messages, signal, and persona are required' },
        { status: 400 }
      )
    }

    console.log(`🔍 Analyzing campaign with GPT-5: ${messages.length} messages`)
    console.log('👤 Persona:', persona)
    console.log('📝 Signal:', signal.substring(0, 100) + '...')

    // Use optimized versions if available, otherwise use original
    const messagesToAnalyze = messages.map((m: any) => ({
      ...m,
      content: m.isOptimized ? m.content : m.originalContent
    }))

    const analysisPrompt = `You are an expert email campaign strategist. Analyze this complete email sequence for campaign coherence and generate specific feedback for each message.

SEQUENCE TO ANALYZE:
${messagesToAnalyze.map((m: any, i: number) => 
  `Message ${i+1} (${m.type}, Day ${m.daysLater}):\n${m.content}\n`
).join('\n---\n')}

USER FEEDBACK: ${userFeedback || 'No specific feedback provided'}

CAMPAIGN ANALYSIS TASKS:
1. Identify repetitive phrases, stats, or customer examples across messages
2. Check for varied opening approaches and value propositions
3. Ensure proper story arc progression and signal integration
4. Verify tone consistency with persona
5. Look for opportunities to improve campaign flow and coherence
6. Ensure each message has unique value and doesn't repeat previous content
7. Check for proper spacing and timing in the sequence
8. Verify that each message builds on the previous one appropriately

FEEDBACK GUIDELINES:
- Be specific about what needs to change in each message
- Prioritize feedback based on impact (high/medium/low)
- Focus on campaign coherence, not individual message quality
- Suggest concrete improvements, not vague recommendations
- Consider the user's feedback when provided

Return ONLY valid JSON with this exact structure:
{
  "campaignAnalysis": "Overall campaign assessment and key findings",
  "feedbackPlan": {
    "message1": {
      "feedback": "Specific improvements needed for this message",
      "priority": "high|medium|low",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "message2": {
      "feedback": "Specific improvements needed for this message", 
      "priority": "high|medium|low",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "message3": {
      "feedback": "Specific improvements needed for this message",
      "priority": "high|medium|low", 
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "message4": {
      "feedback": "Specific improvements needed for this message",
      "priority": "high|medium|low",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "message5": {
      "feedback": "Specific improvements needed for this message",
      "priority": "high|medium|low",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "message6": {
      "feedback": "Specific improvements needed for this message",
      "priority": "high|medium|low",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    }
  }
}

CRITICAL: Return ONLY the JSON object, no other text. The response must be parseable as JSON.`

    const analysis = await generateText({
      model: openai('gpt-5'),
      prompt: analysisPrompt
    })

    console.log('✅ Campaign analysis complete')

    const campaignPlan = JSON.parse(analysis.text)
    
    return NextResponse.json({ campaignPlan })

  } catch (error) {
    console.error('Error analyzing campaign:', error)
    return NextResponse.json(
      { error: 'Failed to analyze campaign' },
      { status: 500 }
    )
  }
}

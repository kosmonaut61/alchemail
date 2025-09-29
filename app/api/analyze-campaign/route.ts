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
9. Check for formatting consistency (bold text, links, merge fields)
10. Ensure proper use of context items and customer examples
11. Verify CTA variety and effectiveness
12. Check for proper use of gift card language and demo requests

FORMATTING CONSISTENCY CHECKS:
- Are em dashes (—) being used consistently or should they be replaced with hyphens?
- Are key context items properly bolded with **formatting**?
- Are Apollo merge fields like {{contact.title}} being used appropriately?
- Are actual URLs being used for case studies and resources?
- Is gift card language using "up to $X" format consistently?
- Are demo requests using "quick chat" language rather than time-boxed demos?
- Are links integrated naturally into sentences, not as entire sentence links?
- Are customer examples and statistics varied across messages?
- CRITICAL: Does every email have at least one Apollo meeting link?
- CRITICAL: Are Apollo meeting link texts varied across messages (not all saying "schedule a quick chat")?
- Are Apollo links using different phrases like "book a demo", "set up a call", "schedule a meeting", etc.?

FEEDBACK GUIDELINES:
- Be specific about what needs to change in each message
- Prioritize feedback based on impact (high/medium/low)
- Focus on campaign coherence, not individual message quality
- Suggest concrete improvements, not vague recommendations
- Consider the user's feedback when provided
- Include formatting consistency feedback when relevant
- Suggest specific context items or customer examples to vary
- Recommend specific CTA improvements or link formatting fixes

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

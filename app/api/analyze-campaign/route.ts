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
    console.log('💬 User Feedback:', userFeedback || 'No feedback provided')

    // Use optimized versions if available, otherwise use original
    const messagesToAnalyze = messages.map((m: any) => ({
      ...m,
      content: m.isOptimized ? m.content : m.originalContent
    }))

    const analysisPrompt = `You are an expert email campaign strategist. Analyze this complete email sequence for campaign coherence and generate specific feedback for each message.

CAMPAIGN SIGNAL (Primary Reason for Outreach):
"${signal}"

SEQUENCE TO ANALYZE:
${messagesToAnalyze.map((m: any, i: number) => 
  `Message ${i+1} (${m.type}, Day ${m.daysLater}):\n${m.content}\n`
).join('\n---\n')}

USER FEEDBACK: ${userFeedback || 'No specific feedback provided'}

CAMPAIGN ANALYSIS TASKS:
1. CRITICAL: Verify that the campaign signal "${signal}" is properly integrated and referenced throughout the sequence
2. Check that each message builds on the signal story arc and maintains connection to the original outreach reason
3. CRITICAL: Identify repetitive phrases, stats, or customer examples across messages - especially look for:
   - Identical or near-identical signal integration phrases (e.g., "As a CEO with a decade of experience" appearing in multiple emails)
   - Same opening patterns or structures
   - Repeated statistics or customer examples
   - Identical value propositions or pain point references
   - CRITICAL: Repetitive pain point phrases (e.g., "steep learning curve" appearing in multiple emails)
   - Same pain point descriptions across multiple messages
4. Check for varied opening approaches and value propositions
5. Ensure proper story arc progression and signal integration
6. Verify tone consistency with persona
7. Look for opportunities to improve campaign flow and coherence
8. Ensure each message has unique value and doesn't repeat previous content
9. Check for proper spacing and timing in the sequence
10. Verify that each message builds on the previous one appropriately
11. Check for formatting consistency (bold text, links, merge fields)
12. Ensure proper use of context items and customer examples
13. Verify CTA variety and effectiveness
14. Check for proper use of gift card language and demo requests
15. CRITICAL: If user feedback is provided, analyze it carefully and apply it ONLY to the appropriate message(s) in the sequence
16. For user feedback about specific content (like "say X in the last message"), apply that feedback ONLY to the relevant message, not all messages
17. Use user feedback to inform the overall campaign analysis and create targeted, specific feedback for individual messages
18. CRITICAL: Flag any messages that use identical or nearly identical phrasing for the same concept - this creates robotic, repetitive feel

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
- CRITICAL: Prioritize signal integration - ensure each message properly references and builds on the campaign signal "${signal}"
- Be specific about what needs to change in each message
- Prioritize feedback based on impact (high/medium/low)
- Focus on campaign coherence, not individual message quality
- Suggest concrete improvements, not vague recommendations
- Consider the user's feedback when provided
- Include formatting consistency feedback when relevant
- Suggest specific context items or customer examples to vary
- Recommend specific CTA improvements or link formatting fixes
- Ensure the signal story arc is maintained throughout the entire sequence
- CRITICAL: For repetitive signal integration, provide specific alternative phrasings:
  * If signal is about "decades of experience", suggest variations like: "With your background in...", "Given your tenure...", "Having led through...", "Your experience navigating...", "In your role as...", "With your track record..."
  * If signal is about specific pain points, vary how you reference them across messages
  * CRITICAL: For repetitive pain point phrases, provide specific alternative phrasings:
    - Instead of "steep learning curve" → suggest "complex processes", "new systems to master", "ramping up quickly", "getting up to speed", "learning the ropes"
    - Instead of "time-consuming" → suggest "takes forever", "eats up hours", "slows everything down", "bogs down the process"
    - Instead of "overwhelming" → suggest "a lot to take in", "information overload", "feels like drinking from a firehose", "can be daunting"
  * If signal is about company growth/challenges, use different angles and phrasings
- CRITICAL: Flag HIGH priority for any message that uses identical phrasing to previous messages for the same concept
- Provide specific alternative phrasings and approaches for each repetitive element identified

USER FEEDBACK INTEGRATION RULES:
- CRITICAL: Analyze user feedback carefully to determine which specific message(s) it applies to
- If user feedback mentions "last message", "final message", "last email", etc., apply it ONLY to the final message in the sequence (this is message${messagesToAnalyze.length} in a ${messagesToAnalyze.length}-message sequence)
- If user feedback mentions "first message", "opening", "initial", etc., apply it ONLY to the first message
- If user feedback mentions "middle messages", "follow-up", etc., apply it to the appropriate middle messages
- If user feedback is general (like "make tone more urgent"), consider how it applies to each message individually
- NEVER apply specific content feedback (like "say X") to all messages - only to the relevant message(s)
- Use user feedback to inform the overall campaign analysis and create targeted feedback for individual messages
- If user feedback is about a specific message position, create feedback ONLY for that message position
- IMPORTANT: This sequence has ${messagesToAnalyze.length} messages total, so "last message" refers to message${messagesToAnalyze.length}

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
    },
    "message7": {
      "feedback": "Specific improvements needed for this message",
      "priority": "high|medium|low",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "message8": {
      "feedback": "Specific improvements needed for this message",
      "priority": "high|medium|low",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "message9": {
      "feedback": "Specific improvements needed for this message",
      "priority": "high|medium|low",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    },
    "message10": {
      "feedback": "Specific improvements needed for this message",
      "priority": "high|medium|low",
      "suggestions": ["specific suggestion 1", "specific suggestion 2"]
    }
  }
}

IMPORTANT: This sequence has ${messagesToAnalyze.length} messages total. You MUST provide feedback for ALL ${messagesToAnalyze.length} messages in the feedbackPlan object. 
- If there are more than 10 messages, continue the pattern with message11, message12, etc.
- If there are fewer than 10 messages, only include the messages that exist (e.g., if there are 5 messages, only include message1 through message5)
- CRITICAL: Always provide feedback for the exact number of messages in this sequence: ${messagesToAnalyze.length} messages

CRITICAL: Return ONLY the JSON object, no other text. The response must be parseable as JSON.`

    const analysis = await generateText({
      model: openai('gpt-5'),
      prompt: analysisPrompt
    })

    console.log('✅ Campaign analysis complete')

    const campaignPlan = JSON.parse(analysis.text)
    
    // Validate that we have feedback for all messages
    const expectedMessageCount = messagesToAnalyze.length
    const actualFeedbackCount = Object.keys(campaignPlan.feedbackPlan || {}).length
    
    console.log(`📊 Feedback validation: Expected ${expectedMessageCount} messages, got feedback for ${actualFeedbackCount} messages`)
    
    if (actualFeedbackCount < expectedMessageCount) {
      console.warn(`⚠️ Warning: Missing feedback for ${expectedMessageCount - actualFeedbackCount} messages`)
    }
    
    return NextResponse.json({ campaignPlan })

  } catch (error) {
    console.error('Error analyzing campaign:', error)
    return NextResponse.json(
      { error: 'Failed to analyze campaign' },
      { status: 500 }
    )
  }
}

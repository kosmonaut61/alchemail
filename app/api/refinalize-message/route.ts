import { NextRequest, NextResponse } from 'next/server'
import { generateWithGPT5 } from '@/lib/openai-models'

export async function POST(request: NextRequest) {
  try {
    const { 
      messageId, 
      messageContent, 
      messageType, 
      signal, 
      persona, 
      painPoints, 
      contextItems,
      allFinalizedMessages // The entire campaign context
    } = await request.json()

    if (!messageId || !messageContent || !messageType || !signal || !persona) {
      return NextResponse.json(
        { error: 'Message ID, content, type, signal, and persona are required' },
        { status: 400 }
      )
    }

    // Get persona definition
    const { PERSONA_DEFINITIONS } = await import('@/lib/personas')
    const personaData = PERSONA_DEFINITIONS.find(p => p.id === persona)
    
    if (!personaData) {
      return NextResponse.json(
        { error: 'Invalid persona selected' },
        { status: 400 }
      )
    }

    console.log(`🔄 Re-finalizing ${messageType} message: ${messageId}`)
    console.log('👤 Persona:', personaData.label)

    // Get context for the message
    const contextText = contextItems && contextItems.length > 0 
      ? contextItems.map((item: any) => `${item.content}`).join('\n')
      : ''

    // Create a summary of all other messages to avoid repetition
    const otherMessages = allFinalizedMessages
      .filter((msg: any) => msg.id !== messageId)
      .map((msg: any, index: number) => `Message ${index + 1} (${msg.type}, Day ${msg.daysLater}): ${msg.content}`)
      .join('\n\n')

    const refinalizePrompt = `You are an expert email and LinkedIn message re-finalizer. You are re-finalizing a single message from a complete campaign while maintaining awareness of all other messages to avoid repetitive phrases and patterns.

CRITICAL: This is a RE-FINALIZATION process, not optimization. You are applying the same finalization logic that was used for the original campaign, but with enhanced awareness of repetitive patterns across the entire campaign.

ORIGINAL MESSAGE TO RE-FINALIZE:
${messageContent}

MESSAGE TYPE: ${messageType}
SIGNAL: ${signal}
PERSONA: ${personaData.seniority} in ${personaData.department}
PAIN POINTS: ${painPoints?.join(', ') || 'Not specified'}

CONTEXT ITEMS:
${contextText}

ALL OTHER MESSAGES IN CAMPAIGN (for repetition avoidance):
${otherMessages}

CRITICAL REPETITION AVOIDANCE RULES:
1. **ANALYZE OTHER MESSAGES FIRST**: Before re-finalizing, identify phrases, patterns, and structures used in other messages
2. **AVOID REPETITIVE PHRASES**: Do not use any phrases that appear in other messages - scan the entire campaign for repeated language
3. **VARY OPENING APPROACHES**: Use a completely different opening style than other messages - analyze how other messages start and choose a different approach
4. **VARY SIGNAL INTEGRATION**: Reference the signal differently than other messages - find new ways to connect to the signal
5. **VARY PAIN POINT REFERENCES**: Use different ways to reference pain points than other messages
6. **VARY STATISTICS/EXAMPLES**: Use different customer examples or statistics than other messages
7. **VARY CTA LANGUAGE**: Use different call-to-action phrasing than other messages

RE-FINALIZATION GUIDELINES:
1. **MAINTAIN CAMPAIGN COHERENCE**: Keep the same overall message purpose and signal integration
2. **ENHANCE UNIQUENESS**: Make this message distinctly different from others in the campaign
3. **PRESERVE CORE CONTENT**: Keep the essential value proposition and context items
4. **IMPROVE VARIETY**: Use different language patterns, sentence structures, and approaches
5. **MAINTAIN PERSONA TONE**: Keep the appropriate tone for ${personaData.seniority} in ${personaData.department}
6. **PRESERVE FORMATTING**: Maintain proper merge fields, links, and structure
7. **ENSURE NATURAL FLOW**: Make the message feel natural and conversational
8. **STRATEGIC BOLD ANALYSIS**: Re-evaluate the entire message to determine the most impactful places for bold formatting - don't just preserve existing bold, but strategically place it where it will have the greatest visual impact and engagement

SPECIFIC IMPROVEMENTS TO APPLY:
- Use different opening approaches than other messages
- Vary the signal integration style
- Use different pain point descriptions
- Include different customer examples or statistics
- Use varied CTA language
- Apply different sentence structures and flow
- Use different transition phrases and connectors
- RE-ANALYZE AND OPTIMIZE BOLD FORMATTING: Re-evaluate the entire message to determine where bold formatting would be most impactful - focus on key statistics, company names, value propositions, and the most compelling statements

FORMATTING REQUIREMENTS:
- Preserve all merge fields exactly: {{contact.first_name}}, {{account.processed_company_name_for_email}}, etc.
- Maintain Apollo link format: [text](https://app.apollo.io/#/meet/managed-meetings/{{sender_meeting_alias}}/n9l-1si-q4y/30-min)
- CRITICAL: STRATEGIC BOLD FORMATTING: Re-analyze the message content to strategically apply **bold formatting** to the most impactful elements:
  * Prioritize key statistics and numbers (e.g., "saved $6M", "cut costs by 18%")
  * Highlight company names and success stories (e.g., "Dollar Tree", "Golden State Foods")
  * Emphasize value propositions and benefits (e.g., "faster procurement", "reduced costs")
  * Bold compelling statements that drive engagement
  * Use 2-3 strategic bold sections maximum for optimal impact
  * Bold complete thoughts, not fragments - ensure the whole meaningful phrase is bolded
- Keep proper markdown formatting for bold text: **text**
- Maintain proper line breaks and paragraph structure
- Preserve case study links with exact URLs from context
- REMOVE EM DASHES: Replace all em dashes (—) with regular hyphens (-) or rephrase the sentence

QUALITY STANDARDS:
- 100-150 words for emails, under 100 words for LinkedIn
- 5th grade reading level
- Natural, conversational tone
- Clear value proposition
- Strong, specific call-to-action
- No repetitive phrases from other campaign messages

Return the re-finalized message with the same format as the original, but with enhanced variety and uniqueness compared to other messages in the campaign.`

    const refinalizedContent = await generateWithGPT5(refinalizePrompt, 'gpt-4o')

    if (!refinalizedContent) {
      throw new Error('No content generated from re-finalization')
    }

    console.log('✅ Message re-finalized successfully')

    return NextResponse.json({
      success: true,
      refinalizedContent,
      messageId
    })

  } catch (error) {
    console.error('Re-finalization failed:', error)
    return NextResponse.json(
      { 
        error: 'Re-finalization failed', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

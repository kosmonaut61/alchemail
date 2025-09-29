import { NextRequest, NextResponse } from 'next/server'
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"
import { formatVariablesForPrompt } from '@/lib/dynamic-variables'
import { formatSamplesForPrompt } from '@/lib/email-samples'

export async function POST(request: NextRequest) {
  try {
    const { messages, feedbackPlan, signal, persona, painPoints, contextItems } = await request.json()

    if (!messages || !feedbackPlan) {
      return NextResponse.json(
        { error: 'Messages and feedback plan are required' },
        { status: 400 }
      )
    }

    console.log(`🔧 Applying campaign feedback to ${messages.length} messages`)

    // Process all messages in parallel with their specific feedback
    const feedbackPromises = messages.map(async (message: any, index: number) => {
      const messageKey = `message${index + 1}`
      const feedback = feedbackPlan[messageKey]
      
      if (!feedback) {
        console.log(`📝 Message ${index + 1}: No feedback provided, keeping as-is`)
        return { ...message, isCampaignFinalized: true }
      }
      
      console.log(`🔧 Message ${index + 1}: Applying ${feedback.priority} priority feedback`)
      
      const editPrompt = `You are an expert email and LinkedIn message optimizer specializing in B2B outreach. Apply this specific feedback to improve this message for campaign coherence while maintaining all formatting standards.

ORIGINAL MESSAGE:
${message.content}

FEEDBACK TO APPLY:
${feedback.feedback}

SPECIFIC SUGGESTIONS:
${feedback.suggestions.join('\n')}

CONTEXT:
- Message Type: ${message.type}
- Target Persona: ${persona}
- Signal: ${signal}
- Pain Points: ${painPoints?.join(', ') || 'Not specified'}

AVAILABLE CONTEXT FOR ENHANCEMENT (use strategically - focus on 1-2 primary items):
${contextItems && contextItems.length > 0 
  ? contextItems.map((item: any) => `- ${item.title}: ${item.content}`).join('\n')
  : 'No additional context provided'
}

CRITICAL FORMATTING RULES:
1. REMOVE EM DASHES: Replace all em dashes (—) with regular hyphens (-) or rephrase the sentence - em dashes are an AI tell that should be avoided
2. BOLD KEY CONTEXT ITEMS: Use **bold formatting** to highlight 2-3 complete thoughts or phrases that contain the most impactful context items - bold entire meaningful phrases including company names, statistics, and value propositions (like "**Golden State Foods cut freight costs by 18%**" or "**Dollar Tree saved $6M**") - ensure the whole thought is bolded, not just fragments
3. USE APOLLO ROLE FIELDS: When referring to someone's role or title, use Apollo merge fields like {{contact.title}} or {{contact.job_title}} instead of generic terms like "your role" or "your position" - this personalizes the message with their actual job title
4. USE ACTUAL URLs: When referencing resources like videos, case studies, or other materials, use the EXACT URLs provided in the context repository - do NOT make up or create fake URLs - if a context item has a URL field, use that exact URL, not a made-up one
5. GIFT CARD LANGUAGE: If mentioning gift card compensation, ALWAYS use "up to $X" language - never promise the full amount. Example: "up to $500 gift card for your time" not "$500 gift card". Frame it as compensation for their valuable time, not an incentive to meet. The gift card is applicable to a demo. Do not reference a specific amount of time required to participate in a demo to be eligible. Keep the gift card as a secondary thought in the call to action. We are primarily trying to have an initial conversation to see if they are eligible for a demo and compensation.
6. DEMO REQUESTS: When asking for time, use "quick chat" language rather than time-boxed demos. Mention the compensation separately after the chat request
7. WRITE COHESIVE SENTENCES: Rewrite choppy, fragmented sentences into smooth, natural flowing statements that feel like a cohesive thought - avoid breaking up natural flow with unnecessary pauses or fragments - make it read like natural conversation, not bullet points
8. MAKE SURE THERE IS LESS THAN 3 ADVERBS in the message
9. KEEP SENTENCES NATURALLY FLOWING - don't force them to be too short if it makes them choppy
10. MAKE SURE THERE ARE NATURAL LINE BREAKS in the message
11. MAKE SURE THE MESSAGE IS AT A 5TH GRADE READING LEVEL
12. PRESERVE the original's personality and warmth - don't strip out human elements
13. CRITICAL: PRESERVE email references and conversation context - if the original mentions "the email I sent" or "following up on", KEEP those references
14. PRESERVE the original's conversation flow and relationship context - don't make follow-up messages sound like cold outreach
15. USE CUSTOMER QUOTES from available context to add credibility and emotional connection
16. VARY the content structure - don't use the same pattern as other messages
17. INCORPORATE different statistics and examples from the context repository
18. CRITICAL: Focus on 1-2 PRIMARY context items - avoid overwhelming recipients with too many examples, stats, or customer names
19. BE SELECTIVE with context - use 1-2 key stats/quote per message, not everything
20. KEEP messages concise and scannable - don't overwhelm with too many numbers
21. REPLACE ASSUMPTIONS WITH QUESTIONS: Instead of "I noticed you're focusing on..." say "Are you focusing on...?"
22. Turn presumptive statements into questions to avoid assumptions
23. PRESERVE CUSTOMER LISTS: If the original message mentions companies from customer lists (e.g., Honda, Bridgestone from Automotive Customers), KEEP them in the optimized version
24. ENHANCE CUSTOMER EXAMPLES: Don't remove customer list companies - instead, make them more compelling and relevant
25. MAINTAIN CONTEXT DIVERSITY: Preserve the variety of customer examples from different context items
26. AVOID CONTEXT OVERLOAD: Don't add more context items than the original message - focus on enhancing what's already there

Call-to-Action (CTA) Rules:
- NATURAL LINK INTEGRATION: Weave links naturally into sentences, not as entire sentence links
- Link only 2-4 key words in the middle of sentences, not entire phrases
- Make the link feel like a natural part of the conversation flow
- CRITICAL: Never show URLs as plain text - always wrap them in markdown link format [text](url)
- LINK TYPE RULES:
  * For MEETING/CALL requests: Use Apollo URL: [schedule a call](https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min)
  * For CASE STUDY sharing: Use ONLY actual case study URLs from context:
    - [Dollar Tree case study](https://www.emergemarket.com/resource/dollar-tree-study)
    - [Golden State Foods case study](https://www.emergemarket.com/resource/golden-state-foods-case-study)
    - [EZRack case study](https://www.emergemarket.com/resource/ezrack-case-study)
    - [Pepsi case study](https://www.emergemarket.com/resource/pepsi-bottling-case-study)
    - [Premier Carrier Program case study](https://www.emergemarket.com/resource/premier-carrier-case-study)
    - [DBIN case study](https://www.emergemarket.com/resource/dynamic-book-it-now-case-study)
  * For DEMO/PRESENTATION: Use Apollo URL: [book a demo](https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min)
- Examples of NATURAL link integration with correct URLs:
  * "Want to [schedule a quick chat](https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min) to explore this further?"
  * "I can [share the Dollar Tree case study](https://www.emergemarket.com/resource/dollar-tree-study) with you."
  * "Would you like me to [send the Golden State Foods case study](https://www.emergemarket.com/resource/golden-state-foods-case-study) or [book a quick chat](https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min)?"
- AVOID: Entire sentence links like "[Would you be open to a quick chat to explore this further?](url)"

MERGE FIELD FORMATTING:
- Use dynamic variables for personalization (see list below)
- Always preserve merge field syntax exactly: {{variable.name}}
- Do NOT modify or break merge field formatting
- You can add new merge fields for personalization where appropriate
- CRITICAL: When referring to someone's role/title, use Apollo merge fields like {{contact.title}} or {{contact.job_title}} instead of generic terms like "your role" or "your position"
- CRITICAL: When referencing resources with URLs, use the EXACT URLs from the context repository - do NOT create fake or made-up URLs

COHESIVE WRITING REQUIREMENTS:
- Rewrite choppy, fragmented sentences into smooth, natural flowing statements
- Create cohesive thoughts that flow together naturally - avoid unnecessary pauses or fragments
- Make it read like natural conversation, not bullet points or choppy statements
- Match the persona's tone profile while maintaining smooth sentence flow

${formatVariablesForPrompt()}

For emails:
- Keep subject lines under 50 characters
- Use proper email formatting with clear sections
- Include strong value proposition early
- End with clear, specific call-to-action
- Keep emails concise (100-150 words max)
- Do NOT add signatures, sign-offs, or contact information
- Make messages longer if they need to be to be between 100-150 words

For LinkedIn messages:
- Keep under 100 words
- Start with personal connection or value
- Be conversational but professional
- End with clear next steps
- Do NOT add signatures, sign-offs, or contact information
- Do NOT make messages longer than the original

CRITICAL: Do NOT add signatures, contact information, or make messages longer. Keep the same length or shorter than the original. Return the optimized message with the same format as the original. Focus on improvements that will increase open rates, response rates, and engagement.

Return ONLY the improved message content, no explanations or additional text.`

      try {
        const editedContent = await generateText({
          model: openai('gpt-5'),
          messages: [
            {
              role: 'system',
              content: 'You are an expert B2B message optimizer with advanced AI capabilities. You specialize in creating highly engaging, persuasive messages that drive responses and conversions. Always preserve merge field syntax ({{variable.name}}) exactly as provided. CRITICAL: Use ONLY the exact URLs provided in the context repository - do NOT create fake or made-up URLs. Rewrite choppy, fragmented sentences into smooth, natural flowing statements that feel cohesive. Do NOT add signatures, contact information, or make messages longer than the original. Apply campaign feedback while maintaining all formatting standards and message quality.'
            },
            {
              role: 'user',
              content: editPrompt
            }
          ],
          temperature: 0.7,
          topP: 0.9,
          frequencyPenalty: 0.1,
          presencePenalty: 0.1
        })
        
        console.log(`✅ Message ${index + 1}: Feedback applied successfully`)
        
        return {
          ...message,
          content: editedContent.text,
          isCampaignFinalized: true,
          campaignFeedback: feedback
        }
      } catch (error) {
        console.error(`❌ Message ${index + 1}: Failed to apply feedback:`, error)
        // Return original message if feedback application fails
        return {
          ...message,
          isCampaignFinalized: true,
          campaignFeedback: feedback,
          feedbackError: true
        }
      }
    })
    
    const finalizedMessages = await Promise.all(feedbackPromises)
    
    // Count successful vs failed applications
    const successful = finalizedMessages.filter(m => !m.feedbackError).length
    const failed = finalizedMessages.filter(m => m.feedbackError).length
    
    console.log(`📊 Campaign finalization complete: ${successful} successful, ${failed} failed`)
    
    return NextResponse.json({ 
      finalizedMessages,
      stats: { successful, failed, total: finalizedMessages.length }
    })

  } catch (error) {
    console.error('Error applying campaign feedback:', error)
    return NextResponse.json(
      { error: 'Failed to apply campaign feedback' },
      { status: 500 }
    )
  }
}

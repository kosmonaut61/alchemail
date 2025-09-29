import { NextRequest, NextResponse } from 'next/server'
import { openai } from "@ai-sdk/openai"
import { generateText } from "ai"

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
      
      const editPrompt = `You are an expert email optimizer. Apply this specific feedback to improve this message for campaign coherence.

ORIGINAL MESSAGE:
${message.content}

FEEDBACK TO APPLY:
${feedback.feedback}

SPECIFIC SUGGESTIONS:
${feedback.suggestions.join('\n')}

OPTIMIZATION REQUIREMENTS:
1. Apply the feedback while maintaining the message's core purpose and quality
2. Preserve the persona alignment and tone
3. Keep the signal integration intact
4. Maintain proper formatting and structure
5. Ensure the message flows naturally with the campaign
6. Don't change the fundamental approach, just improve based on feedback
7. Keep the same length and style as the original
8. Preserve any merge fields, links, or specific formatting

Return ONLY the improved message content, no explanations or additional text.`

      try {
        const editedContent = await generateText({
          model: openai('gpt-5'),
          prompt: editPrompt
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

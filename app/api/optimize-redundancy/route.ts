import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

export async function POST(request: NextRequest) {
  try {
    const { messages, signal, persona, painPoints, contextItems } = await request.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required' },
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

    console.log(`🔍 Running Optimo redundancy cleanup for ${messages.length} messages`)
    console.log('👤 Persona:', personaData.label)

    // Build context items string
    const contextItemsString = contextItems && contextItems.length > 0 
      ? contextItems.map((item: any) => `${item.title}: ${item.content}`).join('\n')
      : ''

    const redundancyPrompt = `You are an expert message redundancy detector and optimizer. Your task is to analyze a complete campaign of optimized messages and eliminate repetitive language, redundant phrases, and similar patterns while maintaining each message's unique value and purpose.

CAMPAIGN MESSAGES TO ANALYZE:
${messages.map((msg: any, index: number) => `
MESSAGE ${index + 1} (${msg.type.toUpperCase()}):
${msg.content}
`).join('\n')}

PERSONA CONTEXT:
- Persona: ${personaData.label}
- Signal: ${signal}
- Pain Points: ${painPoints?.join(', ') || 'Not specified'}

AVAILABLE CONTEXT ITEMS:
${contextItemsString}

REDUNDANCY DETECTION & ELIMINATION RULES:

1. **Repetitive Opening Patterns**: 
   - Look for similar opening structures across messages
   - Vary opening approaches (question, statement, story, direct value)
   - Avoid repetitive phrases like "As an account executive you must be stressed about..."

2. **Redundant Value Propositions**:
   - Identify similar value statements across messages
   - Ensure each message has a unique value angle
   - Vary the way benefits are presented

3. **Overused Phrases & Language**:
   - Eliminate repetitive connector phrases
   - Vary signal acknowledgments
   - Remove overused words like "move", "moves", "smart move", "good step"
   - Avoid repetitive phrases like "building an internal case"

4. **Similar Call-to-Action Patterns**:
   - Vary CTA approaches and language
   - Use different urgency levels
   - Mix meeting requests with resource sharing

5. **Redundant Context Usage**:
   - Ensure different customer examples across messages
   - Vary statistics and case studies used
   - Avoid repeating the same success stories

OPTIMIZATION GUIDELINES:

- **PRESERVE** each message's core purpose and unique value
- **MAINTAIN** the warm, conversational tone
- **KEEP** merge field syntax exactly: {{variable.name}}
- **PRESERVE** all URLs and links exactly as provided
- **ENSURE** each message remains distinct and valuable
- **VARY** language patterns while maintaining natural flow
- **ELIMINATE** only true redundancy, not legitimate repetition for emphasis

CONTEXT DIVERSITY REQUIREMENTS:
- Use different customer examples from the context repository
- Vary statistics and success stories across messages
- Ensure each message references different context items
- Maintain variety in opening approaches and structures

OUTPUT FORMAT:
Return the optimized messages in the exact same JSON format as input, with each message's content updated to eliminate redundancy while preserving its unique value and purpose.

CRITICAL: Do NOT make messages longer. Keep the same length or shorter. Focus only on eliminating redundancy and varying language patterns.`

    console.log('\n' + '='.repeat(80))
    console.log('🤖 OPENAI API CALL - REDUNDANCY OPTIMIZATION (OPTIMO)')
    console.log('='.repeat(80))
    console.log('📧 MODEL: gpt-5')
    console.log('🎯 PURPOSE: Eliminate redundancy across campaign messages')
    console.log('📝 MESSAGE COUNT:', messages.length)
    console.log('📏 PROMPT LENGTH:', redundancyPrompt.length, 'characters')
    console.log('\n📝 COMPLETE PROMPT:')
    console.log('-'.repeat(60))
    console.log(redundancyPrompt)
    console.log('-'.repeat(60))
    console.log('='.repeat(80) + '\n')

    const { text } = await generateText({
      model: openai('gpt-5'),
      messages: [
        {
          role: 'system',
          content: 'You are an expert message redundancy optimizer. Analyze campaign messages and eliminate repetitive language while preserving each message\'s unique value. Always preserve merge field syntax ({{variable.name}}) exactly as provided. Use ONLY exact URLs from context. Focus on varying language patterns and eliminating true redundancy.'
        },
        {
          role: 'user',
          content: redundancyPrompt
        }
      ],
      temperature: 0.7,
      topP: 0.9,
      frequencyPenalty: 0.2,
      presencePenalty: 0.2
    })

    console.log('\n' + '='.repeat(80))
    console.log('✅ OPENAI API RESPONSE - REDUNDANCY OPTIMIZATION (OPTIMO)')
    console.log('='.repeat(80))
    console.log('📧 MODEL: gpt-5')
    console.log('📝 MESSAGE COUNT:', messages.length)
    console.log('📏 RESPONSE LENGTH:', text.length, 'characters')
    console.log('\n📝 COMPLETE RESPONSE:')
    console.log('-'.repeat(60))
    console.log(text)
    console.log('-'.repeat(60))
    console.log('='.repeat(80) + '\n')

    // Parse the response - expect JSON array of messages
    let optimizedMessages
    try {
      optimizedMessages = JSON.parse(text)
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError)
      throw new Error('Invalid JSON response from AI model')
    }

    if (!Array.isArray(optimizedMessages) || optimizedMessages.length !== messages.length) {
      throw new Error('Response format invalid - expected array of messages')
    }

    console.log('✅ Optimo redundancy optimization successful')
    console.log('📄 Optimized messages count:', optimizedMessages.length)

    return NextResponse.json({
      success: true,
      optimizedMessages,
      originalMessageCount: messages.length,
      optimizations: [
        'Eliminated repetitive opening patterns',
        'Varied value proposition presentations',
        'Removed overused phrases and language',
        'Diversified call-to-action approaches',
        'Ensured context diversity across messages',
        'Maintained unique value for each message'
      ]
    })

  } catch (error) {
    console.error('❌ Error in Optimo redundancy optimization:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to optimize message redundancy',
        details: 'Please try again'
      },
      { status: 500 }
    )
  }
}

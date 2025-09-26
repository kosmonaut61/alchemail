import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'

async function getContextForOptimizer(signal: string, personaData: any, painPoints: string[]) {
  const { CONTEXT_REPOSITORY } = await import('@/lib/context-repository')
  
  // Get relevant context based on signal and persona
  const signalLower = signal.toLowerCase()
  const keywords = signalLower.split(/\s+/).filter(word => word.length > 3)
  
  // Find relevant context items
  const relevantItems = CONTEXT_REPOSITORY.filter(item => {
    const itemKeywords = (item.keywords || []).map(k => k.toLowerCase())
    const itemContent = item.content.toLowerCase()
    
    // Check if any keywords match
    const keywordMatch = keywords.some(keyword => 
      itemKeywords.includes(keyword) || itemContent.includes(keyword)
    )
    
    // Check if persona-specific
    if (item.persona) {
      return item.persona === personaData.id
    }
    
    return keywordMatch
  })
  
  // If no relevant items found, get some general ones
  if (relevantItems.length === 0) {
    return CONTEXT_REPOSITORY.slice(0, 5).map(item => 
      `${item.title}: ${item.content}`
    ).join('\n')
  }
  
  return relevantItems.map(item => 
    `${item.title}: ${item.content}`
  ).join('\n')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 TURBO API - Request body:', JSON.stringify(body, null, 2))
    
    const { messages, signal, persona, painPoints, contextItems } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('❌ TURBO API - Invalid messages array:', messages)
      return NextResponse.json(
        { error: 'Messages array is required and must be non-empty' },
        { status: 400 }
      )
    }

    if (!signal || !persona) {
      console.error('❌ TURBO API - Missing required fields:', { signal, persona })
      return NextResponse.json(
        { error: 'Signal and persona are required' },
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

    console.log(`🔍 Running Turbo redundancy cleanup for ${messages.length} messages`)
    console.log('👤 Persona:', personaData.label)

    // Build context items string - use provided context or auto-detect
    const contextItemsString = contextItems && contextItems.length > 0 
      ? contextItems.map((item: any) => `${item.title}: ${item.content}`).join('\n')
      : await getContextForOptimizer(signal, personaData, painPoints)

    const redundancyPrompt = `You are an expert message redundancy detector and optimizer. Your task is to analyze a complete campaign of optimized messages and eliminate repetitive language, redundant phrases, and similar patterns while maintaining each message's unique value and purpose.

CAMPAIGN MESSAGES TO ANALYZE:
${messages.map((msg: any, index: number) => `
MESSAGE ${index + 1} (ID: ${msg.id}, TYPE: ${msg.type.toUpperCase()}):
${msg.content}
`).join('\n')}

PERSONA CONTEXT:
- Persona: ${personaData.label}
- Signal: ${signal}
- Pain Points: ${painPoints?.join(', ') || 'Not specified'}

AVAILABLE CONTEXT ITEMS:
${contextItemsString}

CUSTOMER LIST ITEMS AVAILABLE:
${contextItems && contextItems.length > 0 
  ? contextItems.filter((item: any) => item.category === 'customer').map((item: any) => `- ${item.title}: ${item.content}`).join('\n')
  : (await getContextForOptimizer(signal, personaData, painPoints)).split('\n').filter(line => line.includes('Customers')).join('\n')
}

IMPORTANT: If there are customer list items above, PRESERVE and ENHANCE companies from those lists instead of removing them.

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
   - **PRESERVE** existing CTA variety - don't make all CTAs identical
   - **MAINTAIN** different CTA structures across messages
   - **KEEP** original CTA language - don't standardize to "quick chat"

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

BOLD FORMATTING PRESERVATION (CRITICAL):
- **PRESERVE ALL BOLD FORMATTING** exactly as provided in input messages
- **DO NOT REMOVE** any existing **bold** formatting
- **DO NOT MODIFY** any existing **bold** formatting
- **ENHANCE** by adding **bold** to key phrases, statistics, and value propositions that are not already bolded
- **MAINTAIN** all **bold** text for company names, statistics, and important points
- **ENSURE** key information remains visually emphasized with **bold** formatting

PERSONALIZATION PRESERVATION (CRITICAL):
- **PRESERVE** persona-specific language and tone (e.g., "steep learning curve", "early in your finance career")
- **MAINTAIN** personal touches and conversational connectors
- **KEEP** original personalization elements that make messages feel human
- **PRESERVE** relationship context and conversation flow
- **MAINTAIN** the warm, approachable tone of the original messages
- **AVOID** making messages too generic or corporate

CONTEXT DIVERSITY REQUIREMENTS:
- Use different customer examples from the context repository
- Vary statistics and success stories across messages
- Ensure each message references different context items
- Maintain variety in opening approaches and structures

OUTPUT FORMAT:
You MUST return ONLY a valid JSON array with the exact same structure as the input messages. Each message should have the same id, type, and updated content.

Example format (use the EXACT IDs from the input messages):
[
  {
    "id": "email-3-5",
    "type": "email", 
    "content": "optimized content here"
  },
  {
    "id": "linkedin-2-1",
    "type": "linkedin",
    "content": "optimized content here"
  }
]

CRITICAL REQUIREMENTS:
- Return ONLY the JSON array, no other text
- Use the EXACT same IDs as the input messages (e.g., "email-3-5", "linkedin-2-1")
- Use the EXACT same types as the input messages
- Do NOT make messages longer. Keep the same length or shorter
- Focus only on eliminating redundancy and varying language patterns
- Preserve all merge fields exactly: {{contact.first_name}}, {{contact.title}}, etc.
- Preserve all URLs exactly as provided
- **CRITICAL**: PRESERVE ALL BOLD FORMATTING (**text**) exactly as provided - DO NOT remove any bold formatting
- **CRITICAL**: ENHANCE bold formatting by adding **bold** to key phrases, statistics, and value propositions
- **CRITICAL**: PRESERVE CTA variety - don't make all CTAs identical or standardize to "quick chat"
- **CRITICAL**: Maintain natural link integration within sentences
- **CRITICAL**: Enhance visual formatting to make key information stand out`

    console.log('\n' + '='.repeat(80))
    console.log('🤖 OPENAI API CALL - REDUNDANCY OPTIMIZATION (TURBO)')
    console.log('='.repeat(80))
    console.log('📧 MODEL: gpt-5 (Turbo Redundancy Cleanup)')
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
          content: 'You are an expert message redundancy optimizer. Analyze campaign messages and eliminate repetitive language while preserving each message\'s unique value. Always preserve merge field syntax ({{variable.name}}) exactly as provided. Use ONLY exact URLs from context. Focus on varying language patterns and eliminating true redundancy. CRITICAL: You must return ONLY a valid JSON array with the exact same structure as the input messages. Use the EXACT same IDs and types as the input messages. Do not include any explanatory text or formatting outside the JSON array. CRITICAL: PRESERVE ALL BOLD FORMATTING (**text**) exactly as provided in the input messages. Do NOT remove or modify any bold formatting. CRITICAL: ENHANCE bold formatting by adding **bold** to key phrases, statistics, and value propositions that are not already bolded. CRITICAL: PRESERVE CTA variety - don\'t make all CTAs identical or standardize to "quick chat". CRITICAL: PRESERVE persona-specific language and personalization elements that make messages feel human.'
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
      // Try to parse as JSON first
      optimizedMessages = JSON.parse(text)
    } catch (parseError) {
      console.error('❌ Failed to parse JSON response:', parseError)
      console.error('❌ Raw response text:', text)
      
      // If JSON parsing fails, try to extract JSON from the text
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        try {
          optimizedMessages = JSON.parse(jsonMatch[0])
        } catch (secondParseError) {
          console.error('❌ Failed to parse extracted JSON:', secondParseError)
          throw new Error('Invalid JSON response from AI model')
        }
      } else {
        throw new Error('No valid JSON array found in response')
      }
    }

    // Handle case where GPT-5 returns an object instead of array
    if (!Array.isArray(optimizedMessages)) {
      console.warn('⚠️ GPT-5 returned object instead of array, attempting to convert...')
      
      // Try to convert object to array format
      if (typeof optimizedMessages === 'object' && optimizedMessages !== null) {
        const convertedMessages = []
        for (const [key, value] of Object.entries(optimizedMessages)) {
          // Extract ID from key like "MESSAGE 1 (EMAIL)" or use original message ID
          const messageIndex = parseInt(key.match(/\d+/)?.[0] || '0') - 1
          const originalMessage = messages[messageIndex]
          
          if (originalMessage && typeof value === 'string') {
            convertedMessages.push({
              id: originalMessage.id,
              type: originalMessage.type,
              content: value
            })
          }
        }
        
        if (convertedMessages.length === messages.length) {
          optimizedMessages = convertedMessages
          console.log('✅ Successfully converted object response to array format')
        }
      }
    }

    if (!Array.isArray(optimizedMessages) || optimizedMessages.length !== messages.length) {
      console.error('❌ Invalid response format:', {
        isArray: Array.isArray(optimizedMessages),
        length: optimizedMessages?.length,
        expectedLength: messages.length,
        response: optimizedMessages
      })
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

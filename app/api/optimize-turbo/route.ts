import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { PERSONA_DEFINITIONS } from '@/lib/personas'

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
    
    const { message, editPlan, signal, persona, painPoints, contextItems } = body

    if (!message || !editPlan) {
      console.error('❌ TURBO API - Missing required fields:', { message, editPlan })
      return NextResponse.json(
        { error: 'Message and editPlan are required' },
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

    const personaData = PERSONA_DEFINITIONS.find(p => p.id === persona)
    if (!personaData) {
      console.error('❌ TURBO API - Invalid persona:', persona)
      return NextResponse.json(
        { error: 'Invalid persona selected' },
        { status: 400 }
      )
    }

    console.log(`🔍 Running Turbo edit application for message ${message.id}`)
    console.log('👤 Persona:', personaData.label)

    // Build context items string - use provided context or auto-detect
    const contextItemsString = contextItems && contextItems.length > 0 
      ? contextItems.map((item: any) => `${item.title}: ${item.content}`).join('\n')
      : await getContextForOptimizer(signal, personaData, painPoints)

    const editPrompt = `You are an expert message editor. Apply the specific edits from the edit plan to optimize this message while preserving personalization and variety.

CAMPAIGN CONTEXT:
- Signal: ${signal}
- Target Persona: ${personaData.label}
- Persona Description: ${personaData.description}

CONTEXT ITEMS AVAILABLE:
${contextItemsString}

CUSTOMER LIST ITEMS AVAILABLE:
${contextItemsString.includes('Customer') || contextItemsString.includes('Company') ? 
  contextItemsString.split('\n').filter(item => 
    item.toLowerCase().includes('customer') || 
    item.toLowerCase().includes('company') ||
    item.toLowerCase().includes('list')
  ).join('\n') : 'No customer list items provided'}

MESSAGE TO EDIT:
ID: ${message.id}
TYPE: ${message.type.toUpperCase()}
CONTENT:
${message.content}

EDIT PLAN FOR THIS MESSAGE:
${JSON.stringify(editPlan, null, 2)}

EDIT APPLICATION TASK:
Apply the specific edits from the edit plan while ensuring:

1. **Bold Formatting Preservation**:
   - **PRESERVE ALL BOLD FORMATTING** exactly as provided
   - **ENHANCE** by adding **bold** to key phrases, statistics, and value propositions
   - **MAINTAIN** all **bold** text for company names, statistics, and important points

2. **Personalization Preservation**:
   - **PRESERVE** persona-specific language and tone
   - **MAINTAIN** personal touches and conversational connectors
   - **KEEP** original personalization elements that make messages feel human
   - **MAINTAIN** the warm, approachable tone

3. **CTA Variety**:
   - **PRESERVE** existing CTA variety - don't make it identical to other messages
   - **MAINTAIN** the specific CTA approach specified in the edit plan
   - **KEEP** original CTA language unless specifically instructed to change

4. **Context Usage**:
   - **USE** the specific context items mentioned in the edit plan
   - **ENHANCE** references to customer examples and statistics
   - **PRESERVE** and enhance companies from customer lists

CRITICAL REQUIREMENTS:
- **PRESERVE** all merge fields exactly: {{contact.first_name}}, {{contact.title}}, etc.
- **PRESERVE** all URLs exactly as provided
- **APPLY** all specific edits from the edit plan
- **MAINTAIN** natural flow and readability
- **ENSURE** the message feels human and personalized

RESPONSE FORMAT:
Return a JSON object with this exact structure:
{
  "id": "${message.id}",
  "type": "${message.type}",
  "content": "Edited message content here..."
}

CRITICAL: Return ONLY the JSON object. No explanatory text or formatting outside the JSON.`

    console.log('\n' + '='.repeat(80))
    console.log('🤖 OPENAI API CALL - TURBO EDIT APPLICATION')
    console.log('='.repeat(80))
    console.log('📧 MODEL: gpt-5 (Turbo Edit Application)')
    console.log('🎯 PURPOSE: Apply specific edits to individual message')
    console.log('📝 MESSAGE ID:', message.id)
    console.log('📏 PROMPT LENGTH:', editPrompt.length, 'characters')
    console.log('\n📝 COMPLETE PROMPT:')
    console.log('-'.repeat(60))
    console.log(editPrompt)
    console.log('-'.repeat(60))
    console.log('='.repeat(80) + '\n')

    const { text } = await generateText({
      model: openai('gpt-5'),
      messages: [
        {
          role: 'system',
          content: 'You are an expert message editor. Apply specific edits to optimize messages while preserving personalization and variety. CRITICAL: You must return ONLY a valid JSON object with the exact structure specified. Do not include any explanatory text or formatting outside the JSON object.'
        },
        {
          role: 'user',
          content: editPrompt
        }
      ],
      temperature: 0.3,
      maxTokens: 2000
    })

    console.log('\n📊 TURBO EDIT RESPONSE:')
    console.log('-'.repeat(60))
    console.log(text)
    console.log('-'.repeat(60))

    // Parse the JSON response
    let editedMessage
    try {
      editedMessage = JSON.parse(text)
    } catch (parseError) {
      console.error('❌ TURBO API - JSON parse error:', parseError)
      console.error('Raw response:', text)
      return NextResponse.json(
        { error: 'Invalid JSON response from AI model' },
        { status: 500 }
      )
    }

    // Validate the response structure
    if (!editedMessage.id || !editedMessage.type || !editedMessage.content) {
      console.error('❌ TURBO API - Invalid response structure:', editedMessage)
      return NextResponse.json(
        { error: 'Invalid response structure from AI model' },
        { status: 500 }
      )
    }

    console.log('✅ TURBO API - Successfully applied edits to message')
    console.log('📝 Edited message ID:', editedMessage.id)

    return NextResponse.json({
      success: true,
      editedMessage: editedMessage,
      model: 'gpt-5'
    })

  } catch (error) {
    console.error('❌ TURBO API - Error:', error)
    return NextResponse.json(
      { error: 'Internal server error during Turbo edit application' },
      { status: 500 }
    )
  }
}
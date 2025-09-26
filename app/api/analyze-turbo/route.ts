import { NextRequest, NextResponse } from 'next/server'
import { generateText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { PERSONA_DEFINITIONS } from '@/lib/personas'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('🔍 TURBO ANALYSIS API - Request body:', JSON.stringify(body, null, 2))
    
    const { messages, signal, persona, painPoints, contextItems } = body

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      console.error('❌ TURBO ANALYSIS API - Invalid messages array:', messages)
      return NextResponse.json(
        { error: 'Messages array is required and must be non-empty' },
        { status: 400 }
      )
    }

    if (!signal || !persona) {
      console.error('❌ TURBO ANALYSIS API - Missing required fields:', { signal, persona })
      return NextResponse.json(
        { error: 'Signal and persona are required' },
        { status: 400 }
      )
    }

    const personaData = PERSONA_DEFINITIONS.find(p => p.id === persona)
    if (!personaData) {
      console.error('❌ TURBO ANALYSIS API - Invalid persona:', persona)
      return NextResponse.json(
        { error: 'Invalid persona selected' },
        { status: 400 }
      )
    }

    console.log(`🔍 Running Turbo analysis for ${messages.length} messages`)
    console.log('👤 Persona:', personaData.label)

    // Build context items string - use provided context or auto-detect
    const contextItemsString = contextItems && contextItems.length > 0 
      ? contextItems.map((item: any) => `${item.title}: ${item.content}`).join('\n')
      : 'No specific context items provided'

    // Auto-detect context if none provided
    const getContextForOptimizer = () => {
      if (contextItems && contextItems.length > 0) {
        return contextItems.map((item: any) => `${item.title}: ${item.content}`).join('\n')
      }
      
      // Auto-detect context based on signal and persona
      const contextItems = []
      
      // Add pain points if available
      if (painPoints && painPoints.length > 0) {
        contextItems.push(`Pain Points: ${painPoints.join(', ')}`)
      }
      
      // Add persona-specific context
      contextItems.push(`Target Persona: ${personaData.label}`)
      contextItems.push(`Signal: ${signal}`)
      
      return contextItems.join('\n')
    }

    const analysisPrompt = `You are an expert message sequence analyst. Analyze this campaign sequence and create a detailed edit plan to eliminate redundancy while preserving personalization and variety.

CAMPAIGN CONTEXT:
- Signal: ${signal}
- Target Persona: ${personaData.label}
- Persona Description: ${personaData.description}

CONTEXT ITEMS AVAILABLE:
${getContextForOptimizer()}

CUSTOMER LIST ITEMS AVAILABLE:
${contextItemsString.includes('Customer') || contextItemsString.includes('Company') ? 
  contextItemsString.split('\n').filter(item => 
    item.toLowerCase().includes('customer') || 
    item.toLowerCase().includes('company') ||
    item.toLowerCase().includes('list')
  ).join('\n') : 'No customer list items provided'}

CAMPAIGN MESSAGES TO ANALYZE:
${messages.map((msg, index) => 
  `MESSAGE ${index + 1} (ID: ${msg.id}, TYPE: ${msg.type.toUpperCase()}):
${msg.content}

---`
).join('\n')}

ANALYSIS TASK:
Analyze the entire sequence and identify:
1. **Redundant Language Patterns**: Repeated phrases, similar openings, overused words
2. **CTA Variety Issues**: Similar call-to-action approaches across messages
3. **Context Usage Redundancy**: Repeated customer examples or statistics
4. **Personalization Opportunities**: Areas where persona-specific language could be enhanced
5. **Formatting Inconsistencies**: Bold formatting that could be improved

CREATE EDIT PLAN:
For each message, provide specific, actionable edits that will:
- Eliminate redundancy while preserving personalization
- Maintain CTA variety and effectiveness
- Preserve all bold formatting and enhance where appropriate
- Use different context items across messages
- Keep the warm, human tone

CRITICAL REQUIREMENTS:
- **PRESERVE ALL BOLD FORMATTING** exactly as provided
- **ENHANCE** bold formatting by adding **bold** to key phrases, statistics, and value propositions
- **PRESERVE CTA variety** - don't make all CTAs identical
- **MAINTAIN** persona-specific language and personal touches
- **VARY** language patterns while keeping natural flow
- **USE** different customer examples and statistics across messages

RESPONSE FORMAT:
Return a JSON object with this exact structure:
{
  "analysis": {
    "redundancyIssues": ["List of specific redundancy issues found"],
    "ctaVarietyIssues": ["List of CTA variety issues"],
    "contextUsageIssues": ["List of context usage redundancy"],
    "personalizationOpportunities": ["List of personalization enhancement opportunities"]
  },
  "editPlan": [
    {
      "messageId": "exact-message-id",
      "specificEdits": [
        "Specific edit instruction 1",
        "Specific edit instruction 2"
      ],
      "contextItemsToUse": ["List of specific context items to reference"],
      "ctaApproach": "Specific CTA approach to use",
      "personalizationElements": ["Specific personalization elements to maintain/enhance"]
    }
  ]
}

Example format:
{
  "analysis": {
    "redundancyIssues": ["Repeated use of 'quick chat' in 3 messages", "Similar opening patterns in messages 1 and 3"],
    "ctaVarietyIssues": ["All messages use meeting request CTAs", "Lack of variety in urgency levels"],
    "contextUsageIssues": ["Same customer example used in 2 messages", "Repeated statistics"],
    "personalizationOpportunities": ["Could enhance persona-specific language in message 2", "Add more personal touches to message 4"]
  },
  "editPlan": [
    {
      "messageId": "email-1-2",
      "specificEdits": [
        "Change opening from 'Hey' to 'Hi' to vary greeting patterns",
        "Replace 'quick chat' with 'brief call' to avoid redundancy",
        "Add bold formatting to key statistic: '**18%** cost reduction'"
      ],
      "contextItemsToUse": ["Golden State Foods example", "Freight cost statistics"],
      "ctaApproach": "Meeting request with specific time frame",
      "personalizationElements": ["Maintain 'steep learning curve' language", "Keep personal tone"]
    }
  ]
}

CRITICAL: Return ONLY the JSON object. No explanatory text or formatting outside the JSON.`

    console.log('\n' + '='.repeat(80))
    console.log('🤖 OPENAI API CALL - TURBO ANALYSIS')
    console.log('='.repeat(80))
    console.log('📧 MODEL: gpt-5 (Turbo Analysis)')
    console.log('🎯 PURPOSE: Analyze sequence and create edit plan')
    console.log('📝 MESSAGE COUNT:', messages.length)
    console.log('📏 PROMPT LENGTH:', analysisPrompt.length, 'characters')
    console.log('\n📝 COMPLETE PROMPT:')
    console.log('-'.repeat(60))
    console.log(analysisPrompt)
    console.log('-'.repeat(60))

    const { text } = await generateText({
      model: openai('gpt-5'),
      messages: [
        {
          role: 'system',
          content: 'You are an expert message sequence analyst. Analyze campaign sequences and create detailed edit plans to eliminate redundancy while preserving personalization and variety. CRITICAL: You must return ONLY a valid JSON object with the exact structure specified. Do not include any explanatory text or formatting outside the JSON object.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      maxTokens: 4000
    })

    console.log('\n📊 TURBO ANALYSIS RESPONSE:')
    console.log('-'.repeat(60))
    console.log(text)
    console.log('-'.repeat(60))

    // Parse the JSON response
    let analysisData
    try {
      analysisData = JSON.parse(text)
    } catch (parseError) {
      console.error('❌ TURBO ANALYSIS API - JSON parse error:', parseError)
      console.error('Raw response:', text)
      return NextResponse.json(
        { error: 'Invalid JSON response from AI model' },
        { status: 500 }
      )
    }

    // Validate the response structure
    if (!analysisData.analysis || !analysisData.editPlan || !Array.isArray(analysisData.editPlan)) {
      console.error('❌ TURBO ANALYSIS API - Invalid response structure:', analysisData)
      return NextResponse.json(
        { error: 'Invalid response structure from AI model' },
        { status: 500 }
      )
    }

    console.log('✅ TURBO ANALYSIS API - Successfully generated edit plan')
    console.log('📊 Analysis issues found:', analysisData.analysis)
    console.log('📝 Edit plan items:', analysisData.editPlan.length)

    return NextResponse.json({
      success: true,
      analysis: analysisData.analysis,
      editPlan: analysisData.editPlan,
      model: 'gpt-5'
    })

  } catch (error) {
    console.error('❌ TURBO ANALYSIS API - Error:', error)
    return NextResponse.json(
      { error: 'Internal server error during Turbo analysis' },
      { status: 500 }
    )
  }
}

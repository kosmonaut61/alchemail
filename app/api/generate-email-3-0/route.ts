import { NextRequest, NextResponse } from 'next/server'
import { runWorkflow } from '@/lib/workflow-3-0'

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    console.log('🚀 ===== ALCHEMAIL 3.0 WORKFLOW CALL =====')
    console.log('📝 Query:', query.substring(0, 100) + (query.length > 100 ? '...' : ''))

    // Call the workflow with the query
    const result = await runWorkflow({
      input_as_text: query
    })

    console.log('✅ Workflow completed')
    console.log('📋 Result type:', typeof result)
    console.log('📋 Result keys:', result ? Object.keys(result) : 'null')

    // Extract email content from the workflow result
    // The workflow should return the campaignWriterResult which contains the messages
    let emailContent = ''
    let messages: any[] = []

    console.log('📋 Full result:', JSON.stringify(result, null, 2))

    // The workflow returns the result from withTrace, which should contain campaignWriterResult
    // Check various possible result structures
    if (result && typeof result === 'object') {
      // Check if result has messages directly
      if (Array.isArray(result.messages)) {
        messages = result.messages
      } 
      // Check if result has campaignWriterResult
      else if (result.campaignWriterResult) {
        const campaignResult = result.campaignWriterResult
        console.log('📋 Found campaignWriterResult:', JSON.stringify(campaignResult, null, 2))
        
        if (campaignResult.output_text) {
          try {
            const parsed = JSON.parse(campaignResult.output_text)
            console.log('📋 Parsed output_text:', JSON.stringify(parsed, null, 2))
            if (parsed.messages && Array.isArray(parsed.messages)) {
              messages = parsed.messages
            } else if (parsed.success && parsed.messages) {
              messages = parsed.messages
            } else {
              emailContent = campaignResult.output_text
            }
          } catch (e) {
            console.log('📋 Could not parse output_text as JSON, using as string')
            emailContent = campaignResult.output_text
          }
        } else if (campaignResult.output_parsed) {
          console.log('📋 Found output_parsed:', JSON.stringify(campaignResult.output_parsed, null, 2))
          if (campaignResult.output_parsed.messages && Array.isArray(campaignResult.output_parsed.messages)) {
            messages = campaignResult.output_parsed.messages
          } else if (campaignResult.output_parsed.success && campaignResult.output_parsed.messages) {
            messages = campaignResult.output_parsed.messages
          } else {
            emailContent = JSON.stringify(campaignResult.output_parsed, null, 2)
          }
        }
      }
      // Check for direct output fields
      else if (result.output_text) {
        try {
          const parsed = JSON.parse(result.output_text)
          if (parsed.messages && Array.isArray(parsed.messages)) {
            messages = parsed.messages
          } else {
            emailContent = result.output_text
          }
        } catch {
          emailContent = result.output_text
        }
      } else if (result.output_parsed) {
        if (result.output_parsed.messages && Array.isArray(result.output_parsed.messages)) {
          messages = result.output_parsed.messages
        } else {
          emailContent = JSON.stringify(result.output_parsed, null, 2)
        }
      } else {
        // Fallback: stringify the whole result for debugging
        emailContent = JSON.stringify(result, null, 2)
      }
    } else if (typeof result === 'string') {
      emailContent = result
    }

    // If we have messages, format them for display
    if (messages.length > 0) {
      console.log(`📧 Found ${messages.length} messages`)
      // For now, just take the first email message's content
      const firstEmail = messages.find(m => m.type === 'email')
      if (firstEmail && firstEmail.content) {
        emailContent = firstEmail.content
      } else if (messages[0] && messages[0].content) {
        emailContent = messages[0].content
      } else {
        // Format all messages
        emailContent = messages.map((msg, idx) => {
          if (msg.content) {
            return `Email ${idx + 1}:\n${msg.content}`
          }
          return JSON.stringify(msg, null, 2)
        }).join('\n\n---\n\n')
      }
    }

    if (!emailContent) {
      console.error('❌ No email content found in workflow output')
      console.log('📋 Full result object:', JSON.stringify(result, null, 2))
      throw new Error('No email content returned from workflow. Check the workflow output format.')
    }

    console.log('📧 Email content length:', emailContent.length)
    console.log('📄 Email content preview:', emailContent.substring(0, 200) + '...')

    return NextResponse.json({
      success: true,
      content: emailContent,
      messages: messages.length > 0 ? messages : undefined,
    })

  } catch (error) {
    console.error('❌ Error in Alchemail 3.0 workflow:', error)
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to generate email',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

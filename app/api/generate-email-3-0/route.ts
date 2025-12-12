import { NextRequest, NextResponse } from 'next/server'
import { OpenAI } from 'openai'

const WORKFLOW_ID = 'wf_693c77f188cc8190823a200bf9ad277600f80275a4c4acbd'

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
    console.log('🔗 Workflow ID:', WORKFLOW_ID)

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    let emailContent = ''
    let run: any = null

    try {
      // Try the workflows API (beta)
      const workflowRun = await openai.beta.workflows.runs.create({
        workflow_id: WORKFLOW_ID,
        input: {
          query: query,
        },
      })

      console.log('✅ Workflow run created:', workflowRun.id)
      run = workflowRun

      // Poll for completion
      let attempts = 0
      const maxAttempts = 60 // 5 minutes max (5 second intervals)

      while (run.status === 'queued' || run.status === 'in_progress') {
        if (attempts >= maxAttempts) {
          throw new Error('Workflow execution timeout')
        }

        await new Promise(resolve => setTimeout(resolve, 5000)) // Wait 5 seconds

        run = await openai.beta.workflows.runs.retrieve({
          workflow_id: WORKFLOW_ID,
          run_id: run.id,
        })

        attempts++
        console.log(`⏳ Attempt ${attempts}: Status = ${run.status}`)
      }

      if (run.status === 'failed') {
        console.error('❌ Workflow failed:', JSON.stringify(run, null, 2))
        throw new Error('Workflow execution failed')
      }

      console.log('✅ Workflow completed:', run.status)
      console.log('📋 Full run object:', JSON.stringify(run, null, 2))

    } catch (apiError: any) {
      // If workflows API doesn't exist or fails, log the error
      console.error('❌ Workflow API error:', apiError)
      
      // Check if it's a method not found error
      if (apiError.message?.includes('workflows') || apiError.code === 'method_not_found') {
        throw new Error('Workflows API not available. Please ensure you are using a compatible OpenAI SDK version.')
      }
      
      throw apiError
    }

    // Extract the output from the workflow run
    // The output structure depends on your workflow
    if (run.output) {
      // Try to extract email content from various possible output formats
      if (typeof run.output === 'string') {
        emailContent = run.output
      } else if (run.output.email) {
        emailContent = run.output.email
      } else if (run.output.content) {
        emailContent = run.output.content
      } else if (run.output.text) {
        emailContent = run.output.text
      } else if (run.output.message) {
        emailContent = run.output.message
      } else if (run.output.result) {
        emailContent = typeof run.output.result === 'string' 
          ? run.output.result 
          : JSON.stringify(run.output.result, null, 2)
      } else {
        // If output is an object, try to stringify it or find the email field
        emailContent = JSON.stringify(run.output, null, 2)
      }
    } else if (run.result) {
      // Some workflows return result directly
      emailContent = typeof run.result === 'string' 
        ? run.result 
        : JSON.stringify(run.result, null, 2)
    } else {
      // Fallback: check the steps for output
      if (run.steps && run.steps.length > 0) {
        const lastStep = run.steps[run.steps.length - 1]
        if (lastStep.output) {
          emailContent = typeof lastStep.output === 'string' 
            ? lastStep.output 
            : JSON.stringify(lastStep.output, null, 2)
        } else if (lastStep.result) {
          emailContent = typeof lastStep.result === 'string' 
            ? lastStep.result 
            : JSON.stringify(lastStep.result, null, 2)
        }
      }
    }

    if (!emailContent) {
      console.error('❌ No email content found in workflow output')
      console.log('📋 Full run object:', JSON.stringify(run, null, 2))
      throw new Error('No email content returned from workflow. Check the workflow output format.')
    }

    console.log('📧 Email content length:', emailContent.length)
    console.log('📄 Email content preview:', emailContent.substring(0, 200) + '...')

    return NextResponse.json({
      success: true,
      content: emailContent,
      runId: run.id,
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


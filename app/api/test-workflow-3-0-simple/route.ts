import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 ===== SIMPLE TEST WORKFLOW 3.0 =====')
    
    const testResults: any = {
      timestamp: new Date().toISOString(),
      steps: [],
      errors: [],
      success: false
    }

    // Step 1: Check if OpenAI API key is set
    testResults.steps.push({
      step: 1,
      name: 'Check OpenAI API Key',
      status: 'checking'
    })

    if (!process.env.OPENAI_API_KEY) {
      testResults.errors.push('OPENAI_API_KEY is not set')
      testResults.steps[testResults.steps.length - 1].status = 'failed'
      return NextResponse.json(testResults, { status: 500 })
    }

    testResults.steps[testResults.steps.length - 1].status = 'passed'
    testResults.steps[testResults.steps.length - 1].details = `API key found (length: ${process.env.OPENAI_API_KEY.length})`

    // Step 2: Try to import @openai/agents
    testResults.steps.push({
      step: 2,
      name: 'Import @openai/agents',
      status: 'checking'
    })

    try {
      const agentsModule = await import('@openai/agents')
      const exports = {
        Runner: typeof agentsModule.Runner !== 'undefined',
        Agent: typeof agentsModule.Agent !== 'undefined',
        withTrace: typeof agentsModule.withTrace !== 'undefined',
        fileSearchTool: typeof agentsModule.fileSearchTool !== 'undefined',
        webSearchTool: typeof agentsModule.webSearchTool !== 'undefined',
      }
      
      testResults.steps[testResults.steps.length - 1].status = 'passed'
      testResults.steps[testResults.steps.length - 1].details = exports
    } catch (agentsError: any) {
      testResults.errors.push(`Failed to import @openai/agents: ${agentsError.message}`)
      testResults.steps[testResults.steps.length - 1].status = 'failed'
      testResults.steps[testResults.steps.length - 1].error = agentsError.message
      testResults.steps[testResults.steps.length - 1].stack = agentsError.stack
      return NextResponse.json(testResults, { status: 500 })
    }

    // Step 3: Try to import the workflow module (without executing)
    testResults.steps.push({
      step: 3,
      name: 'Import Workflow Module',
      status: 'checking'
    })

    try {
      const workflowModule = await import('@/lib/workflow-3-0')
      const hasRunWorkflow = typeof workflowModule.runWorkflow !== 'undefined'
      
      testResults.steps[testResults.steps.length - 1].status = 'passed'
      testResults.steps[testResults.steps.length - 1].details = {
        runWorkflow: hasRunWorkflow,
        runWorkflowType: hasRunWorkflow ? typeof workflowModule.runWorkflow : 'undefined'
      }
    } catch (importError: any) {
      testResults.errors.push(`Failed to import workflow: ${importError.message}`)
      testResults.steps[testResults.steps.length - 1].status = 'failed'
      testResults.steps[testResults.steps.length - 1].error = importError.message
      testResults.steps[testResults.steps.length - 1].stack = importError.stack
      return NextResponse.json(testResults, { status: 500 })
    }

    // Step 4: Check if we can create a simple agent (without running)
    testResults.steps.push({
      step: 4,
      name: 'Test Agent Creation',
      status: 'checking'
    })

    try {
      const { Agent } = await import('@openai/agents')
      const { z } = await import('zod')
      
      const TestSchema = z.object({ test: z.string() })
      
      const testAgent = new Agent({
        name: "Test Agent",
        instructions: "You are a test agent",
        model: "gpt-4o-mini",
        outputType: TestSchema,
      })
      
      testResults.steps[testResults.steps.length - 1].status = 'passed'
      testResults.steps[testResults.steps.length - 1].details = {
        agentCreated: true,
        agentName: testAgent.name
      }
    } catch (agentError: any) {
      testResults.errors.push(`Failed to create test agent: ${agentError.message}`)
      testResults.steps[testResults.steps.length - 1].status = 'failed'
      testResults.steps[testResults.steps.length - 1].error = agentError.message
      testResults.steps[testResults.steps.length - 1].stack = agentError.stack
    }

    testResults.success = testResults.errors.length === 0

    return NextResponse.json(testResults, { 
      status: testResults.success ? 200 : 500 
    })

  } catch (error) {
    console.error('🧪 Simple test error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}


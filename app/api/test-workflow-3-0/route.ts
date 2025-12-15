import { NextRequest, NextResponse } from 'next/server'

async function runTests(testQuery?: string) {
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
    testResults.errors.push('OPENAI_API_KEY is not set in environment variables')
    testResults.steps[testResults.steps.length - 1].status = 'failed'
    return testResults
  }

  testResults.steps[testResults.steps.length - 1].status = 'passed'
  testResults.steps[testResults.steps.length - 1].details = 'API key found (length: ' + process.env.OPENAI_API_KEY.length + ')'

  // Step 2: Try to import the workflow
  testResults.steps.push({
    step: 2,
    name: 'Import Workflow',
    status: 'checking'
  })

  let runWorkflow: any
  try {
    const workflowModule = await import('@/lib/workflow-3-0')
    runWorkflow = workflowModule.runWorkflow
    
    if (!runWorkflow || typeof runWorkflow !== 'function') {
      throw new Error('runWorkflow is not a function')
    }
    
    testResults.steps[testResults.steps.length - 1].status = 'passed'
    testResults.steps[testResults.steps.length - 1].details = 'Workflow imported successfully'
  } catch (importError: any) {
    testResults.errors.push(`Failed to import workflow: ${importError.message}`)
    testResults.steps[testResults.steps.length - 1].status = 'failed'
    testResults.steps[testResults.steps.length - 1].error = importError.message
    testResults.steps[testResults.steps.length - 1].stack = importError.stack
    return testResults
  }

  // Step 3: Try to import @openai/agents
  testResults.steps.push({
    step: 3,
    name: 'Check @openai/agents Package',
    status: 'checking'
  })

  try {
    const agentsModule = await import('@openai/agents')
    const hasRunner = typeof agentsModule.Runner !== 'undefined'
    const hasAgent = typeof agentsModule.Agent !== 'undefined'
    const hasWithTrace = typeof agentsModule.withTrace !== 'undefined'
    
    testResults.steps[testResults.steps.length - 1].status = 'passed'
    testResults.steps[testResults.steps.length - 1].details = {
      Runner: hasRunner,
      Agent: hasAgent,
      withTrace: hasWithTrace
    }
  } catch (agentsError: any) {
    testResults.errors.push(`Failed to import @openai/agents: ${agentsError.message}`)
    testResults.steps[testResults.steps.length - 1].status = 'failed'
    testResults.steps[testResults.steps.length - 1].error = agentsError.message
    return testResults
  }

  // Step 4: Try to execute workflow with a simple test query
  testResults.steps.push({
    step: 4,
    name: 'Execute Workflow (Test Query)',
    status: 'checking'
  })

  const queryToUse = testQuery || "CEO at a mid-sized logistics company"
    
  try {
    console.log('🧪 Executing workflow with test query:', queryToUse)
    
    const startTime = Date.now()
    const result = await runWorkflow({
      input_as_text: queryToUse
    })
    const duration = Date.now() - startTime

    console.log('🧪 Workflow completed in', duration, 'ms')
    console.log('🧪 Result type:', typeof result)
    console.log('🧪 Result:', JSON.stringify(result, null, 2))

    testResults.steps[testResults.steps.length - 1].status = 'passed'
    testResults.steps[testResults.steps.length - 1].details = {
      duration: `${duration}ms`,
      resultType: typeof result,
      resultKeys: result && typeof result === 'object' ? Object.keys(result) : 'not an object',
      resultPreview: result ? JSON.stringify(result).substring(0, 500) : 'null'
    }
    testResults.workflowResult = result
    testResults.success = true

  } catch (execError: any) {
    testResults.errors.push(`Workflow execution failed: ${execError.message}`)
    testResults.steps[testResults.steps.length - 1].status = 'failed'
    testResults.steps[testResults.steps.length - 1].error = execError.message
    testResults.steps[testResults.steps.length - 1].stack = execError.stack
    
    console.error('🧪 Workflow execution error:', execError)
  }

  return testResults
}

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 ===== TEST WORKFLOW 3.0 (GET) =====')
    const testResults = await runTests()
    return NextResponse.json(testResults, { 
      status: testResults.success ? 200 : 500 
    })
  } catch (error) {
    console.error('🧪 Test endpoint error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 ===== TEST WORKFLOW 3.0 (POST) =====')
    const { query } = await request.json()
    const testQuery = query || undefined
    const testResults = await runTests(testQuery)
    return NextResponse.json(testResults, { 
      status: testResults.success ? 200 : 500 
    })
  } catch (error) {
    console.error('🧪 Test endpoint error:', error)
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const results: any = {
    step: 'Import Test',
    errors: [],
    success: false
  }

  try {
    console.log('🧪 Testing direct import...')
    
    // Test 1: Import @openai/agents
    try {
      const agents = await import('@openai/agents')
      results.agentsImport = 'success'
      results.agentsExports = Object.keys(agents)
    } catch (e: any) {
      results.agentsImport = 'failed'
      results.errors.push(`Agents import: ${e.message}`)
      return NextResponse.json(results, { status: 500 })
    }

    // Test 2: Import zod
    try {
      const zod = await import('zod')
      results.zodImport = 'success'
    } catch (e: any) {
      results.zodImport = 'failed'
      results.errors.push(`Zod import: ${e.message}`)
      return NextResponse.json(results, { status: 500 })
    }

    // Test 3: Try to import the workflow implementation file
    console.log('🧪 Attempting to import workflow-3-0-impl...')
    const startTime = Date.now()
    
    try {
      const workflowImpl = await import('@/lib/workflow-3-0-impl')
      const duration = Date.now() - startTime
      
      results.workflowImplImport = 'success'
      results.importDuration = `${duration}ms`
      results.workflowExports = Object.keys(workflowImpl)
      results.hasRunWorkflow = typeof workflowImpl.runWorkflow !== 'undefined'
      
      console.log('✅ Workflow import completed in', duration, 'ms')
    } catch (e: any) {
      const duration = Date.now() - startTime
      results.workflowImplImport = 'failed'
      results.importDuration = `${duration}ms`
      results.errors.push(`Workflow impl import: ${e.message}`)
      results.errorStack = e.stack
      return NextResponse.json(results, { status: 500 })
    }

    // Test 4: Try to import the re-export wrapper
    console.log('🧪 Attempting to import workflow-3-0 wrapper...')
    const wrapperStartTime = Date.now()
    
    try {
      const workflowWrapper = await import('@/lib/workflow-3-0')
      const wrapperDuration = Date.now() - wrapperStartTime
      
      results.workflowWrapperImport = 'success'
      results.wrapperImportDuration = `${wrapperDuration}ms`
      results.wrapperExports = Object.keys(workflowWrapper)
      
      console.log('✅ Workflow wrapper import completed in', wrapperDuration, 'ms')
    } catch (e: any) {
      const wrapperDuration = Date.now() - wrapperStartTime
      results.workflowWrapperImport = 'failed'
      results.wrapperImportDuration = `${wrapperDuration}ms`
      results.errors.push(`Workflow wrapper import: ${e.message}`)
      results.errorStack = e.stack
      return NextResponse.json(results, { status: 500 })
    }

    results.success = true
    return NextResponse.json(results, { status: 200 })

  } catch (error: any) {
    results.errors.push(`Unexpected error: ${error.message}`)
    results.errorStack = error.stack
    return NextResponse.json(results, { status: 500 })
  }
}


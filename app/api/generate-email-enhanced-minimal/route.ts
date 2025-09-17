import { NextRequest, NextResponse } from "next/server";
import { getPreamble } from "@/lib/preamble";
import { getPersonaById } from "@/lib/personas";
import { getEmailSamplesByPersona } from "@/lib/email-samples";
import { generateWithGPT5, generateWithGPT5Responses } from "@/lib/openai-models";

// Local function (copied from main API route)
function buildDynamicContext(contextItems: any[]): string {
  if (!contextItems || contextItems.length === 0) {
    return ""
  }
  return "Dynamic context would be built here"
}

export async function POST(request: NextRequest) {
  console.log('🚀 MINIMAL POST handler called')
  
  try {
    console.log('📝 Parsing request...')
    const { persona, signal, painPoints, contextItems, enableQA = false, model = "gpt-5" } = await request.json()
    console.log('✅ Request parsed successfully')
    
    console.log('📖 Testing getPreamble...')
    const preamble = await getPreamble()
    console.log('✅ getPreamble completed')
    
    console.log('🔧 Testing buildDynamicContext...')
    const dynamicContext = buildDynamicContext(contextItems || [])
    console.log('✅ buildDynamicContext completed')
    
    console.log('👤 Testing getPersonaById...')
    const selectedPersona = getPersonaById(persona)
    console.log('✅ getPersonaById completed')
    
    console.log('📧 Testing getEmailSamplesByPersona...')
    const samples = getEmailSamplesByPersona(persona)
    console.log('✅ getEmailSamplesByPersona completed')
    
    console.log('🤖 Testing generateWithGPT5Responses...')
    const testPrompt = "Write a simple test email"
    const gpt5Response = await generateWithGPT5Responses(testPrompt, model)
    console.log('✅ generateWithGPT5Responses completed')
    
    console.log('📊 Request data:', { persona, signal, painPoints, contextItems, enableQA, model })
    console.log('📏 Preamble length:', preamble.length)
    console.log('📏 Dynamic context length:', dynamicContext.length)
    console.log('👤 Persona found:', !!selectedPersona)
    console.log('📧 Samples found:', !!samples)
    console.log('🤖 GPT-5 response length:', gpt5Response.length)
    
    return NextResponse.json({ 
      success: true,
      message: "Minimal API with ALL imports and GPT-5 working!",
      data: { persona, signal, painPoints, contextItems, enableQA, model },
      preambleLength: preamble.length,
      dynamicContextLength: dynamicContext.length,
      personaFound: !!selectedPersona,
      samplesFound: !!samples,
      gpt5ResponseLength: gpt5Response.length
    })
    
  } catch (error) {
    console.error('❌ Minimal API Error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }, { status: 500 })
  }
}

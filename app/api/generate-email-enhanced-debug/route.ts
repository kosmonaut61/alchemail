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
  console.log('🚀 DEBUG POST handler called')
  
  try {
    console.log('📝 Parsing request...')
    const { persona, signal, painPoints, contextItems, enableQA = false, model = "gpt-5" } = await request.json()
    console.log('✅ Request parsed successfully')
    
    console.log('📖 Getting preamble...')
    const preamble = await getPreamble()
    console.log('✅ Preamble loaded')
    
    console.log('🔧 Building dynamic context...')
    const dynamicContext = buildDynamicContext(contextItems || [])
    console.log('✅ Dynamic context built')
    
    console.log('👤 Getting persona info...')
    const selectedPersona = getPersonaById(persona)
    console.log('✅ Persona info retrieved')
    
    console.log('📧 Getting email samples...')
    const samples = getEmailSamplesByPersona(persona)
    console.log('✅ Email samples retrieved')
    
    console.log('📝 Building prompt...')
    const prompt = `Generate a professional email about: ${signal} for persona: ${persona}`
    console.log('✅ Prompt built')
    
    console.log('🤖 Calling GPT-5...')
    const initialEmail = await generateWithGPT5Responses(prompt, model)
    console.log('✅ GPT-5 response received')
    
    return NextResponse.json({ 
      success: true,
      message: "DEBUG API working with GPT-5!",
      data: { 
        persona, 
        signal, 
        painPoints, 
        contextItems, 
        enableQA, 
        model,
        preambleLength: preamble.length,
        dynamicContextLength: dynamicContext.length,
        personaFound: !!selectedPersona,
        samplesFound: !!samples,
        emailLength: initialEmail.length
      },
      email: initialEmail
    })
    
  } catch (error) {
    console.error('❌ DEBUG API Error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error occurred" 
    }, { status: 500 })
  }
}

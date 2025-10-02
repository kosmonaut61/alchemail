import { NextRequest, NextResponse } from "next/server";
import { runWithGpt5 } from "@/lib/cursor-gpt5-switcher";
import { getPersonaById } from "@/lib/personas";
import { getPreamble } from "@/lib/preamble";
import { analyzeEmailQuality, autoFixEmail } from "@/lib/email-qa";

// Build dynamic context from selected items
function buildDynamicContext(contextItems: any[]) {
  if (!contextItems || contextItems.length === 0) {
    return "No specific context items selected.";
  }

  let context = "RELEVANT CONTEXT:\n";
  
  contextItems.forEach((item, index) => {
    context += `\n${index + 1}. ${item.type}: ${item.name}\n`;
    if (item.description) {
      context += `   Description: ${item.description}\n`;
    }
    if (item.value) {
      context += `   Value: ${item.value}\n`;
    }
  });

  return context;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      persona, 
      signal, 
      painPoints, 
      contextItems, 
      linkedInCount = 0,
      enableQA = true, 
      model = "gpt-5" 
    } = body;

    console.log('🚀 ===== PARALLEL GENERATION START =====');
    console.log('📝 Request:', { persona, signal, painPoints: painPoints?.length, contextItems: contextItems?.length, enableQA, model });

    // Get persona context
    const selectedPersona = getPersonaById(persona);
    if (!selectedPersona) {
      return NextResponse.json({ error: "Invalid persona" }, { status: 400 });
    }

    const personaContext = `PERSONA CONTEXT:
- Role: ${selectedPersona.seniority} in ${selectedPersona.department}
- Pain Points: ${selectedPersona.painPoints.join(", ")}
- Tone: ${selectedPersona.toneProfile}
- Keywords: ${selectedPersona.keywords.join(", ")}`;

    // Build dynamic context
    const dynamicContext = buildDynamicContext(contextItems);

    // Get preamble
    const preamble = getPreamble();

    console.log('🎯 Starting Phase 1: Sequential Generation of Messages...');

    // PHASE 1: Generate messages sequentially to avoid timeouts
    console.log('📧 Generating Email 1...');
    const email1 = await generateEmail1({ persona, signal, painPoints, dynamicContext, personaContext, preamble, selectedPersona });
    
    console.log('📧 Generating Email 2...');
    const email2 = await generateEmail2({ persona, signal, painPoints, dynamicContext, personaContext, preamble, selectedPersona });
    
    console.log('📧 Generating Email 3...');
    const email3 = await generateEmail3({ persona, signal, painPoints, dynamicContext, personaContext, preamble, selectedPersona });
    
    console.log('📧 Generating Email 4...');
    const email4 = await generateEmail4({ persona, signal, painPoints, dynamicContext, personaContext, preamble, selectedPersona });
    
    let linkedin1 = '';
    let linkedin2 = '';
    
    if (linkedInCount > 0) {
      console.log('💼 Generating LinkedIn 1...');
      linkedin1 = await generateLinkedIn1({ persona, signal, painPoints, dynamicContext, personaContext, preamble, selectedPersona });
      
      if (linkedInCount > 1) {
        console.log('💼 Generating LinkedIn 2...');
        linkedin2 = await generateLinkedIn2({ persona, signal, painPoints, dynamicContext, personaContext, preamble, selectedPersona });
      }
    }

    console.log('✅ Phase 1 Complete: All messages generated sequentially');

    // PHASE 2: Create sequence flow plan
    console.log('🎯 Starting Phase 2: Creating Sequence Flow Plan...');
    const flowPlan = await createSequenceFlowPlan({ email1, email2, email3, email4, linkedin1, linkedin2, signal });
    
    console.log('✅ Phase 2 Complete: Sequence flow plan created');

    // PHASE 3: QA each message individually with gpt-5-mini (if enabled)
    let qaResults = {};
    if (enableQA) {
      console.log('🎯 Starting Phase 3: Sequential QA with gpt-5-mini...');
      
      console.log('🔍 QA\'ing Email 1...');
      const qa1 = await qaMessage("Email 1", email1);
      
      console.log('🔍 QA\'ing Email 2...');
      const qa2 = await qaMessage("Email 2", email2);
      
      console.log('🔍 QA\'ing Email 3...');
      const qa3 = await qaMessage("Email 3", email3);
      
      console.log('🔍 QA\'ing Email 4...');
      const qa4 = await qaMessage("Email 4", email4);
      
      if (linkedInCount > 0) {
        console.log('🔍 QA\'ing LinkedIn 1...');
        const qa5 = await qaMessage("LinkedIn 1", linkedin1);
        
        if (linkedInCount > 1) {
          console.log('🔍 QA\'ing LinkedIn 2...');
          const qa6 = await qaMessage("LinkedIn 2", linkedin2);
        }
      }
      
      qaResults = {
        email1: qa1,
        email2: qa2,
        email3: qa3,
        email4: qa4,
        ...(linkedInCount > 0 && { linkedin1: qa5 }),
        ...(linkedInCount > 1 && { linkedin2: qa6 })
      };

      console.log('✅ Phase 3 Complete: All messages QA\'d sequentially');
    }

    // Combine results
    const fullSequence = `Campaign Name: ${signal}

${email1}

${email2}

${email3}

${email4}

${linkedInCount > 0 ? `LinkedIn Message 1: ${linkedin1}

` : ''}${linkedInCount > 1 ? `LinkedIn Message 2: ${linkedin2}

` : ''}`;

    const response = {
      email: fullSequence,
      parallel: true,
      phases: {
        phase1: "Sequential generation with gpt-5-nano",
        phase2: "Sequence flow planning", 
        phase3: enableQA ? "Sequential QA with gpt-5-mini" : "QA skipped"
      },
      flowPlan,
      qaResults,
      generationTime: Date.now()
    };

    console.log('🎉 ===== PARALLEL GENERATION COMPLETE =====');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Parallel generation error:', error);
    return NextResponse.json(
      { error: "Failed to generate parallel email sequence", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Individual email generators with STRICT rules
async function generateEmail1({ persona, signal, painPoints, dynamicContext, personaContext, preamble, selectedPersona }: any) {
  const prompt = `${preamble}

${dynamicContext}

${personaContext}

SIGNAL: ${signal}

PAIN POINTS: ${painPoints?.join(', ') || 'Not specified'}

CRITICAL: This email must reference and build on this signal. Create a compelling story that connects the signal to their pain points.

SUPPORTING GUIDELINES:
1. Use conversational, friendly tone that fits the signal context
2. Address pain points that align with the signal: ${painPoints.join(", ")}
3. Match the persona context: ${selectedPersona?.seniority} in ${selectedPersona?.department}
4. Make it sound like a real person wrote it, not marketing copy
5. EVERY EMAIL MUST HAVE AN APOLLO LINK CTA that flows naturally in the sentence
6. Be creative and compelling - focus on the signal story first

Generate EMAIL 1 (Day 0) following these STRICT rules:
- 95-150 words total (aim for 120-140 words)
- Max 15 words per sentence
- Max 4 sentences per paragraph  
- 3-4 paragraphs total
- ONE clear quantified result only (not multiple stats)
- Natural Apollo CTA link: [CTA text](https://app.apollo.io/#/meet/managed-meetings/{{sender_meeting_alias}}/n9l-1si-q4y/30-min)
- No signature block - email ends at CTA
- Plain text only, no formatting
- Subject line: 1-5 words, under 40 characters, mobile-friendly
- Grade 5 reading level or lower
- Create curiosity and engagement
- NO duplicate CTAs

Subject: [1-5 words, under 40 chars, mobile-friendly]

[Write the actual email content here - conversational, addresses pain points, includes ONE social proof stat, ends with natural Apollo CTA]`;

  console.log('📧 Generating Email 1 with gpt-5-nano...');
  const result = await runWithGpt5(prompt);
  console.log('✅ Email 1 generated successfully');
  return result.text;
}

async function generateEmail2({ persona, signal, painPoints, dynamicContext, personaContext, preamble, selectedPersona }: any) {
  const prompt = `${preamble}

${dynamicContext}

${personaContext}

SIGNAL: ${signal}

PAIN POINTS: ${painPoints?.join(', ') || 'Not specified'}

CRITICAL: This follow-up email must reference and build on this signal. Create a cohesive story arc.

SUPPORTING GUIDELINES:
1. Use conversational, friendly tone that fits the signal context
2. Address pain points that align with the signal: ${painPoints.join(", ")}
3. Match the persona context: ${selectedPersona?.seniority} in ${selectedPersona?.department}
4. Make it sound like a real person wrote it, not marketing copy
5. EVERY EMAIL MUST HAVE AN APOLLO LINK CTA that flows naturally in the sentence
6. Be creative and compelling - focus on the signal story first

Generate EMAIL 2 (Day 3) following these STRICT rules:
- 95-150 words total (aim for 120-140 words)
- Max 15 words per sentence
- Max 4 sentences per paragraph  
- 3-4 paragraphs total
- ONE clear quantified result only (not multiple stats)
- Natural Apollo CTA link: [CTA text](https://app.apollo.io/#/meet/managed-meetings/{{sender_meeting_alias}}/n9l-1si-q4y/30-min)
- No signature block - email ends at CTA
- Plain text only, no formatting
- Subject line: 1-5 words, under 40 characters, mobile-friendly
- Grade 5 reading level or lower
- Create curiosity and engagement
- NO duplicate CTAs
- First sentence acknowledges it's a follow-up

Subject: [1-5 words, under 40 chars, mobile-friendly]

[Write the actual email content here - follow-up, different angle on pain point, includes ONE social proof stat, ends with natural Apollo CTA]`;

  console.log('📧 Generating Email 2 with gpt-5-nano...');
  const result = await runWithGpt5(prompt);
  console.log('✅ Email 2 generated successfully');
  return result.text;
}

async function generateEmail3({ persona, signal, painPoints, dynamicContext, personaContext, preamble, selectedPersona }: any) {
  const prompt = `${preamble}

${dynamicContext}

${personaContext}

SIGNAL: ${signal}

PAIN POINTS: ${painPoints?.join(', ') || 'Not specified'}

CRITICAL: This follow-up email must reference and build on this signal. Create a cohesive story arc.

SUPPORTING GUIDELINES:
1. Use conversational, friendly tone that fits the signal context
2. Address pain points that align with the signal: ${painPoints.join(", ")}
3. Match the persona context: ${selectedPersona?.seniority} in ${selectedPersona?.department}
4. Make it sound like a real person wrote it, not marketing copy
5. EVERY EMAIL MUST HAVE AN APOLLO LINK CTA that flows naturally in the sentence
6. Be creative and compelling - focus on the signal story first

Generate EMAIL 3 (Day 7) following these STRICT rules:
- 95-150 words total (aim for 120-140 words)
- Max 15 words per sentence
- Max 4 sentences per paragraph  
- 3-4 paragraphs total
- ONE clear quantified result only (not multiple stats)
- Natural Apollo CTA link: [CTA text](https://app.apollo.io/#/meet/managed-meetings/{{sender_meeting_alias}}/n9l-1si-q4y/30-min)
- No signature block - email ends at CTA
- Plain text only, no formatting
- Subject line: 1-5 words, under 40 characters, mobile-friendly
- Grade 5 reading level or lower
- Create curiosity and engagement
- NO duplicate CTAs
- Address objections or deeper value proposition

Subject: [1-5 words, under 40 chars, mobile-friendly]

[Write the actual email content here - address objections, deeper value proposition, includes ONE social proof stat, ends with natural Apollo CTA]`;

  console.log('📧 Generating Email 3 with gpt-5-nano...');
  const result = await runWithGpt5(prompt);
  console.log('✅ Email 3 generated successfully');
  return result.text;
}

async function generateEmail4({ persona, signal, painPoints, dynamicContext, personaContext, preamble, selectedPersona }: any) {
  const prompt = `${preamble}

${dynamicContext}

${personaContext}

SIGNAL: ${signal}

PAIN POINTS: ${painPoints?.join(', ') || 'Not specified'}

CRITICAL: This final follow-up email must reference and build on this signal. Create a cohesive story arc.

SUPPORTING GUIDELINES:
1. Use conversational, friendly tone that fits the signal context
2. Address pain points that align with the signal: ${painPoints.join(", ")}
3. Match the persona context: ${selectedPersona?.seniority} in ${selectedPersona?.department}
4. Make it sound like a real person wrote it, not marketing copy
5. EVERY EMAIL MUST HAVE AN APOLLO LINK CTA that flows naturally in the sentence
6. Be creative and compelling - focus on the signal story first

Generate EMAIL 4 (Day 11) following these STRICT rules:
- 95-150 words total (aim for 120-140 words)
- Max 15 words per sentence
- Max 4 sentences per paragraph  
- 3-4 paragraphs total
- ONE clear quantified result only (not multiple stats)
- Natural Apollo CTA link: [CTA text](https://app.apollo.io/#/meet/managed-meetings/{{sender_meeting_alias}}/n9l-1si-q4y/30-min)
- No signature block - email ends at CTA
- Plain text only, no formatting
- Subject line: 1-5 words, under 40 characters, mobile-friendly
- Grade 5 reading level or lower
- Create curiosity and engagement
- NO duplicate CTAs
- Final follow-up with urgency/next steps

Subject: [1-5 words, under 40 chars, mobile-friendly]

[Write the actual email content here - final follow-up, urgency/next steps, includes ONE social proof stat, ends with natural Apollo CTA]`;

  console.log('📧 Generating Email 4 with gpt-5-nano...');
  const result = await runWithGpt5(prompt);
  console.log('✅ Email 4 generated successfully');
  return result.text;
}

async function generateLinkedIn1({ persona, signal, painPoints, dynamicContext, personaContext, preamble, selectedPersona }: any) {
  const prompt = `${preamble}

${dynamicContext}

${personaContext}

SIGNAL: ${signal}

PAIN POINTS: ${painPoints?.join(', ') || 'Not specified'}

Generate LINKEDIN MESSAGE 1 (Day 1) following these rules:
- Brief, personalized message
- References the signal
- Includes soft CTA
- Under 100 words
- Conversational tone

[Write the actual LinkedIn message content here]`;

  console.log('💼 Generating LinkedIn 1 with gpt-5-nano...');
  const result = await runWithGpt5(prompt);
  console.log('✅ LinkedIn 1 generated successfully');
  return result.text;
}

async function generateLinkedIn2({ persona, signal, painPoints, dynamicContext, personaContext, preamble, selectedPersona }: any) {
  const prompt = `${preamble}

${dynamicContext}

${personaContext}

SIGNAL: ${signal}

PAIN POINTS: ${painPoints?.join(', ') || 'Not specified'}

Generate LINKEDIN MESSAGE 2 (Day 5) following these rules:
- Brief follow-up message
- References previous touchpoints
- Includes soft CTA
- Under 100 words
- Conversational tone

[Write the actual LinkedIn message content here]`;

  console.log('💼 Generating LinkedIn 2 with gpt-5-nano...');
  const result = await runWithGpt5(prompt);
  console.log('✅ LinkedIn 2 generated successfully');
  return result.text;
}

// Create sequence flow plan
async function createSequenceFlowPlan({ email1, email2, email3, email4, linkedin1, linkedin2, signal }: any) {
  const prompt = `Review these 6 messages and create a flow plan to ensure they work together as a cohesive sequence:

EMAIL 1: ${email1}

EMAIL 2: ${email2}

EMAIL 3: ${email3}

EMAIL 4: ${email4}

LINKEDIN 1: ${linkedin1}

LINKEDIN 2: ${linkedin2}

SIGNAL: ${signal}

Create a flow plan that:
1. Ensures each message builds on the previous one
2. Maintains consistent signal integration
3. Creates a logical progression
4. Avoids repetition
5. Builds urgency appropriately

Provide specific recommendations for any messages that need adjustment to flow better.`;

  console.log('📋 Creating sequence flow plan...');
  const result = await runWithGpt5(prompt);
  console.log('✅ Sequence flow plan created');
  return result.text;
}

// QA individual message with gpt-5-mini
async function qaMessage(messageType: string, content: string) {
  try {
    console.log(`🔍 QA'ing ${messageType} with gpt-5-mini...`);
    
    // Use gpt-5-mini for QA (faster than gpt-5, better than gpt-5-nano)
    const analysis = await analyzeEmailQuality(content, "gpt-5-mini");
    
    let optimizedContent = content;
    let fixesApplied: string[] = [];
    
    if (analysis.score < 90) {
      console.log(`🔧 Auto-fixing ${messageType} (score: ${analysis.score})...`);
      const fixResult = await autoFixEmail(content, analysis.issues, "gpt-5-mini");
      optimizedContent = fixResult.optimizedEmail;
      fixesApplied = fixResult.fixesApplied;
    }
    
    console.log(`✅ ${messageType} QA complete (score: ${analysis.score})`);
    
    return {
      original: content,
      optimized: optimizedContent,
      qualityReport: analysis,
      fixesApplied,
      score: analysis.score
    };
  } catch (error) {
    console.error(`❌ QA failed for ${messageType}:`, error);
    return {
      original: content,
      optimized: content,
      qualityReport: null,
      fixesApplied: [],
      score: 0,
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

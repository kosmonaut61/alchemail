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
      enableQA = true, 
      model = "gpt-5" 
    } = body;

    console.log('🚀 ===== STRATEGIC GENERATION START =====');
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

    // PHASE 1: Create Strategic Sequence Plan
    console.log('🎯 Phase 1: Creating Strategic Sequence Plan...');
    const sequencePlan = await createSequencePlan({ 
      signal, 
      persona: selectedPersona, 
      painPoints, 
      dynamicContext, 
      personaContext 
    });
    
    console.log('✅ Phase 1 Complete: Sequence plan created');

    // PHASE 2: Generate Initial Messages (Sequential)
    console.log('🎯 Phase 2: Generating Initial Messages...');
    
    const email1 = await generateInitialMessage("email1", sequencePlan, { signal, personaContext, dynamicContext, preamble });
    const email2 = await generateInitialMessage("email2", sequencePlan, { signal, personaContext, dynamicContext, preamble });
    const email3 = await generateInitialMessage("email3", sequencePlan, { signal, personaContext, dynamicContext, preamble });
    const email4 = await generateInitialMessage("email4", sequencePlan, { signal, personaContext, dynamicContext, preamble });
    const linkedin1 = await generateInitialMessage("linkedin1", sequencePlan, { signal, personaContext, dynamicContext, preamble });
    const linkedin2 = await generateInitialMessage("linkedin2", sequencePlan, { signal, personaContext, dynamicContext, preamble });

    console.log('✅ Phase 2 Complete: All initial messages generated');

    // PHASE 3: QA & Polish (Sequential)
    let qaResults = {};
    if (enableQA) {
      console.log('🎯 Phase 3: QA & Polish with gpt-5-mini...');
      
      const qa1 = await qaAndPolish("Email 1", email1, sequencePlan);
      const qa2 = await qaAndPolish("Email 2", email2, sequencePlan);
      const qa3 = await qaAndPolish("Email 3", email3, sequencePlan);
      const qa4 = await qaAndPolish("Email 4", email4, sequencePlan);
      const qa5 = await qaAndPolish("LinkedIn 1", linkedin1, sequencePlan);
      const qa6 = await qaAndPolish("LinkedIn 2", linkedin2, sequencePlan);
      
      qaResults = {
        email1: qa1,
        email2: qa2,
        email3: qa3,
        email4: qa4,
        linkedin1: qa5,
        linkedin2: qa6
      };

      console.log('✅ Phase 3 Complete: All messages QA\'d and polished');
    }

    // Combine results
    const fullSequence = `Campaign Name: ${signal}

${email1}

${email2}

${email3}

${email4}

LinkedIn Message 1: ${linkedin1}

LinkedIn Message 2: ${linkedin2}`;

    const response = {
      email: fullSequence,
      strategic: true,
      sequencePlan,
      qaResults,
      phases: {
        phase1: "Strategic sequence planning with gpt-5-nano",
        phase2: "Initial message generation with gpt-5-nano", 
        phase3: enableQA ? "QA & polish with gpt-5-mini" : "QA skipped"
      },
      generationTime: Date.now()
    };

    console.log('🎉 ===== STRATEGIC GENERATION COMPLETE =====');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Strategic generation error:', error);
    return NextResponse.json(
      { error: "Failed to generate strategic email sequence", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// PHASE 1: Create Strategic Sequence Plan
async function createSequencePlan({ signal, persona, painPoints, dynamicContext, personaContext }: any) {
  const prompt = `Create a strategic sequence plan for this email campaign:

SIGNAL: ${signal}
PERSONA: ${persona.seniority} in ${persona.department}
PAIN POINTS: ${painPoints?.join(', ') || 'Not specified'}
CONTEXT: ${dynamicContext}

CRITICAL REQUIREMENTS:
1. The signal is the MOST IMPORTANT element - every email and LinkedIn message must be SOLELY FOCUSED on the signal
2. Create a cohesive story arc where each message builds on the previous one
3. Each message should reference the signal in the opening and weave it throughout
4. Plan different social proof/stats for each message (don't repeat the same case study)
5. Ensure the sequence feels natural and personalized, not robotic

Create a JSON plan with this structure:
{
  "campaignTheme": "Brief theme that ties everything together",
  "signalIntegration": "How the signal will be woven throughout each message",
  "storyArc": "How each message builds on the previous one",
  "messages": {
    "email1": {
      "purpose": "What this email accomplishes",
      "signalFocus": "How this email focuses on the signal",
      "socialProof": "Specific social proof/stat for this email",
      "tone": "Tone and approach for this email"
    },
    "email2": {
      "purpose": "What this email accomplishes",
      "signalFocus": "How this email focuses on the signal", 
      "socialProof": "Different social proof/stat for this email",
      "tone": "Tone and approach for this email"
    },
    "email3": {
      "purpose": "What this email accomplishes",
      "signalFocus": "How this email focuses on the signal",
      "socialProof": "Different social proof/stat for this email", 
      "tone": "Tone and approach for this email"
    },
    "email4": {
      "purpose": "What this email accomplishes",
      "signalFocus": "How this email focuses on the signal",
      "socialProof": "Different social proof/stat for this email",
      "tone": "Tone and approach for this email"
    },
    "linkedin1": {
      "purpose": "What this LinkedIn message accomplishes",
      "signalFocus": "How this message focuses on the signal",
      "socialProof": "Different social proof/stat for this message",
      "tone": "Tone and approach for this message"
    },
    "linkedin2": {
      "purpose": "What this LinkedIn message accomplishes", 
      "signalFocus": "How this message focuses on the signal",
      "socialProof": "Different social proof/stat for this message",
      "tone": "Tone and approach for this message"
    }
  }
}

Return ONLY the JSON object, no other text.`;

  console.log('📋 Creating strategic sequence plan...');
  const result = await runWithGpt5(prompt);
  console.log('✅ Sequence plan created');
  
  try {
    return JSON.parse(result.text);
  } catch (error) {
    console.error('❌ Failed to parse sequence plan JSON:', error);
    // Fallback to a basic plan
    return {
      campaignTheme: "Follow-up campaign based on signal",
      signalIntegration: "Each message references the signal",
      storyArc: "Progressive follow-up sequence",
      messages: {
        email1: { purpose: "Initial outreach", signalFocus: "Reference signal", socialProof: "Client success story", tone: "Conversational" },
        email2: { purpose: "Follow-up", signalFocus: "Reference signal", socialProof: "Different client story", tone: "Conversational" },
        email3: { purpose: "Value proposition", signalFocus: "Reference signal", socialProof: "Another client story", tone: "Conversational" },
        email4: { purpose: "Final follow-up", signalFocus: "Reference signal", socialProof: "Final client story", tone: "Conversational" },
        linkedin1: { purpose: "Soft touch", signalFocus: "Reference signal", socialProof: "Brief success mention", tone: "Professional" },
        linkedin2: { purpose: "Follow-up touch", signalFocus: "Reference signal", socialProof: "Brief success mention", tone: "Professional" }
      }
    };
  }
}

// PHASE 2: Generate Initial Message
async function generateInitialMessage(messageType: string, sequencePlan: any, { signal, personaContext, dynamicContext, preamble }: any) {
  const messagePlan = sequencePlan.messages[messageType];
  
  const prompt = `${preamble}

${dynamicContext}

${personaContext}

SIGNAL: ${signal}

SEQUENCE PLAN:
- Campaign Theme: ${sequencePlan.campaignTheme}
- Signal Integration: ${sequencePlan.signalIntegration}
- Story Arc: ${sequencePlan.storyArc}

MESSAGE PLAN FOR ${messageType.toUpperCase()}:
- Purpose: ${messagePlan.purpose}
- Signal Focus: ${messagePlan.signalFocus}
- Social Proof: ${messagePlan.socialProof}
- Tone: ${messagePlan.tone}

CRITICAL REQUIREMENTS:
1. This message must be SOLELY FOCUSED on the signal - it's the most important part
2. Reference the signal in the opening and weave it throughout
3. Use the specific social proof provided: ${messagePlan.socialProof}
4. Match the tone: ${messagePlan.tone}
5. Make it feel natural and personalized, not robotic
6. Create a cohesive story that builds on the sequence plan

Generate ${messageType.toUpperCase()} following these rules:
- 95-100 words total
- Max 15 words per sentence
- Max 3 sentences per paragraph
- 2-3 paragraphs total
- Natural Apollo CTA link: [CTA text](https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min)
- CRITICAL: Apollo links MUST use {{sender.meeting_alias}} (with underscore) - NEVER use {{sender.meeting.alias}} (with dot)
- No signature block - email ends at CTA
- Plain text only, no formatting except for the Apollo CTA link
- Subject line: 1-5 words, under 40 characters, mobile-friendly
- Grade 5 reading level or lower
- Create curiosity and engagement
- NO duplicate CTAs
- Call to action should be in the middle of a sentence, not at the end and a blue hyperlink to the Apollo Link

Subject: [1-5 words, under 40 chars, mobile-friendly]

[Write the actual message content here - Focus on the signal, natural and personalized, includes the specific social proof, ends with natural Apollo CTA]`;

  console.log(`📧 Generating initial ${messageType}...`);
  const result = await runWithGpt5(prompt);
  console.log(`✅ Initial ${messageType} generated`);
  return result.text;
}

// PHASE 3: QA & Polish
async function qaAndPolish(messageType: string, content: string, sequencePlan: any) {
  try {
    console.log(`🔍 QA'ing and polishing ${messageType}...`);
    
    // First, analyze the message
    const analysis = await analyzeEmailQuality(content, "operations_middle_management", ["cost", "efficiency"], "gpt-5-mini");
    
    // Then create a comprehensive polish prompt
    const polishPrompt = `Polish this ${messageType} to meet all quality standards:

ORIGINAL MESSAGE:
${content}

SEQUENCE PLAN CONTEXT:
- Campaign Theme: ${sequencePlan.campaignTheme}
- Signal Integration: ${sequencePlan.signalIntegration}
- Story Arc: ${sequencePlan.storyArc}

QUALITY ISSUES FOUND:
${analysis.issues?.map(issue => `- ${issue.type}: ${issue.message}`).join('\n') || 'None'}

POLISH REQUIREMENTS:
1. Fix subject length: 1-5 words, under 40 characters, mobile-friendly
2. Fix message length: 20-100 words total
3. Add natural line breaks between paragraphs
4. Format CTA links properly: [CTA text](https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min)
   CRITICAL: Apollo links MUST use {{sender.meeting_alias}} (with underscore) - NEVER use {{sender.meeting.alias}} (with dot)
5. Ensure 5th grade reading level or lower
6. Limit to 3 adverbs maximum
7. Verify social proof is included and relevant
8. Check for cohesive story flow with sequence plan
9. Ensure signal is prominently featured
10. Make language natural and conversational, not robotic
11. Remove any duplicate CTAs
12. Ensure proper greeting (Hi [name], or Hey [name],)
13. Remove all em dashes (—) and replace with regular hyphens (-) or rephrase the sentence

Return the polished message with the same structure (Subject: and content).`;

    const polishResult = await runWithGpt5(polishPrompt);
    
    console.log(`✅ ${messageType} polished (score: ${analysis.score})`);
    
    return {
      original: content,
      optimized: polishResult.text,
      qualityReport: analysis,
      fixesApplied: analysis.issues?.map(issue => issue.suggestion) || [],
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

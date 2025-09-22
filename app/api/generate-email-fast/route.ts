import { NextRequest, NextResponse } from "next/server";
import { runWithGpt5 } from "@/lib/cursor-gpt5-switcher";
import { getPersonaById } from "@/lib/personas";
import { getPreamble } from "@/lib/preamble";

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
      enableQA = false, 
      model = "gpt-5" 
    } = body;

    console.log('🚀 ===== FAST GENERATION START =====');
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

    // Generate the full sequence in one call (fastest approach)
    const prompt = `${preamble}

${dynamicContext}

${personaContext}

SIGNAL: ${signal}

PAIN POINTS: ${painPoints?.join(', ') || 'Not specified'}

CRITICAL: EVERY email and LinkedIn message must reference and build on this signal. Create a cohesive story arc where the signal is the connecting thread throughout the entire campaign. Don't let the signal fade after the first email - it should be the reason you're reaching out in every communication.

SUPPORTING GUIDELINES:
1. Use conversational, friendly tone that fits the signal context
2. Address pain points that align with the signal: ${painPoints.join(", ")}
3. Match the persona context: ${selectedPersona?.seniority} in ${selectedPersona?.department}
4. Make it sound like a real person wrote it, not marketing copy
5. EVERY EMAIL MUST HAVE AN APOLLO LINK CTA that flows naturally in the sentence - can be anywhere in the email, format as [CTA text](https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min)
6. Be creative and compelling - focus on the signal story first, word count will be optimized later

Generate a complete email sequence following these rules:
- 95-150 words per email
- Max 15 words per sentence
- Max 4 sentences per paragraph  
- 3-4 paragraphs total per email
- ONE clear quantified result only (not multiple stats)
- Natural Apollo CTA link: [CTA text](https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min)
- No signature block - email ends at CTA
- Plain text only, no formatting
- Subject line: 1-5 words, under 40 characters, mobile-friendly
- Grade 5 reading level or lower
- Create curiosity and engagement
- NO duplicate CTAs
- Each email should reference the signal in the opening
- Each email should have different social proof/stats
- Create a cohesive story arc where each email builds on the previous one

Generate the complete sequence:

Campaign Name: [Brief campaign name based on signal]

EMAIL 1 (Day 0):
Subject: [Subject line that references the signal]

[Write the actual email content here - not advice about how to write it. Make it conversational, address their pain points, include social proof, and end with a natural Apollo CTA link]

EMAIL 2 (Day 3):
Subject: [Subject line that references the signal]

[Write the actual email content here - follow up on the signal, different social proof, natural Apollo CTA]

EMAIL 3 (Day 7):
Subject: [Subject line that references the signal]

[Write the actual email content here - continue the signal story, different social proof, natural Apollo CTA]

EMAIL 4 (Day 11):
Subject: [Subject line that references the signal]

[Write the actual email content here - final follow up on the signal, different social proof, natural Apollo CTA]

LINKEDIN MESSAGE 1 (Day 1):
[Write the actual LinkedIn message content here - brief, personalized, references the signal, includes soft CTA]

LINKEDIN MESSAGE 2 (Day 5):
[Write the actual LinkedIn message content here - brief follow up, references the signal, includes soft CTA]`;

    console.log('📧 Generating complete sequence with gpt-5-nano...');
    const result = await runWithGpt5(prompt);
    console.log('✅ Sequence generated successfully');

    const response = {
      email: result.text,
      fast: true,
      phases: {
        phase1: "Complete sequence generation with gpt-5-nano (single call)"
      },
      generationTime: Date.now()
    };

    console.log('🎉 ===== FAST GENERATION COMPLETE =====');
    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Fast generation error:', error);
    return NextResponse.json(
      { error: "Failed to generate fast email sequence", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}




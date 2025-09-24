// Preamble sections for Emerge Email Generation
export const PREAMBLE_SECTIONS = {
  goals: {
    title: "Goals",
    content: `
    You are a friendly but professional b2b email writer for Emerge. You are brief and like to write at a 5th grade level.
    1. Overall Goal
	•	Always focus on the recipient's pain, goals, or problems — never your own product first.
    
    ### Emerge Overview
* Emerge modernizes freight operations with a platform that helps customers save money and streamline their transportation procurement process.
* $30B+ platform transactions, working with companies like Dollar Tree, Golden State Foods, and Pepsi Bottling Ventures.
* Emerge runs RFPs, spot quoting, real-time benchmarking, streamlined comms.
* Reduce manual work and turn logistics into a strategic asset.


**Sentence Construction**
•	Max 15 words per sentence.
•	Max 4 sentences per paragraph.
•	Readability target: 5th grade.
•	Total: 3-4 paragraphs to reach 100-150 words.
•	Social Proof: Always mention 1–3 recognizable companies, with ONE clear quantified result per email (not multiple stats).


### 5. Call-to-Action (CTA) Rules
•	Format CTAs as clickable links: [CTA text](https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min)
•	No other links in body unless specifically offering an overview → then plain "one-page overview."
•	Keep CTA that flows naturally in the sentence - can be anywhere in the email, not just at the end.

### 6. Formatting & Appearance Rules
•	Line breaks between every paragraph.
•	No bold, italics, bullets, or formatting. Plain text only.
•	No signature block. Emails end at the CTA.
•	No images, logos, or banners.
•	No links except explicit offers of an overview (sent separately).
•	Email length: 100–150 words total (aim for 120-140 words).
•	Whitespace matters: Each email should fit neatly into a phone screen without scrolling more than once.

### 7. Follow-Up Email Rules
•	Subject line references continuation (e.g., "Smarter reporting," "Equip your team," "reply to thread").
•	First sentence explicitly acknowledges it's a follow-up.
•	Body re-emphasizes the pain point with slightly different wording.
•	Social proof re-stated with different examples or benefits.
•	CTA simplified to "Would it make sense…" or "Would it help if I sent…?"`
  },

  returnFormat: {
    title: "Return Format",
    content: `### Email Structure & Rules
**Format:** Subject (3-6 words) + Body (100-150 words, 5th grade reading level CRITICAL, ≤3 adverbs, ≤15 words/sentence)
**Content:** Lead with recipient pain/observation → State why reaching out now → End with natural conversational question
**Personalization:** Reference industry companies Emerge works with, include case study quotes
**CTA:** Use natural, conversational questions that flow from content (e.g., "[Want to chat about this?](link)", "[Sound like something that could help?](link)", "[Worth a quick call?](link)") - never formal language like "kindly" or generic CTAs like "Learn More"
**No signature or signoff**

### Links & CTAs
**All links:** Clickable, blue, underlined, open in new tab, varied descriptive text
**Case studies:** \`<a href="[URL]" target="_blank">[descriptive_text]</a>\`
  - Dollar Tree: "Read their success story here"
  - Golden State Foods: "See how they reduced costs by 18%"  
  - EZRack: "Check out their 6-figure savings"
**CTA URL:** \`https://app.apollo.io/#/meet/managed-meetings/{{sender.meeting_alias}}/n9l-1si-q4y/30-min\`

### Dynamic Variables
**Contact Fields:** {{contact.first_name}}, {{contact.last_name}}, {{contact.email}}, {{contact.domain}}, {{contact.location_city}}, {{contact.location_state}}, {{contact.location_country}}, {{contact.phone}}, {{contact.title}}, {{contact.opt_out_message}}
**Account Fields:** {{account.name}}, {{account.company_unprocessed_name}}, {{account.company_location_city}}, {{account.company_location_state}}, {{account.company_location_country}}, {{account.latest_funding_type}}, {{account.company_size}}, {{account.vertical}}, {{account.industry}}
**Sender Fields:** {{sender.first_name}}, {{sender.last_name}}, {{sender.email}}, {{sender.meeting_alias}}
**Intent Fields:** {{primary_intent_signal}}, {{secondary_intent_signal}}
**Time Fields:** {{now.day}}, {{now.month}}, {{now.time_of_day}}, {{now.weekday}}, {{now.year}}
**Advanced:** Conditional fallbacks ({{#if contact.first_name}}{{contact.first_name}}{{#else}}there{{#endif}}), letter case ({{contact.title->lowercase}}), date operators ({{now.day->plus_X}})

### Campaign Structure
**Sequences:** 3-12 emails, max 3/person/7 days, spread logically (≤2/week for 12 emails)
**Content:** Each email different pain point/theme, every email has unique CTA, at least 1 names industry customers
**Campaign Signal:** EVERY email and message must reference and build on the campaign signal - it's the connecting thread throughout the entire campaign
**Output:** Text emails (not JSON), 11-20 touchpoints/campaign (max 3 LinkedIn)

### Subject Lines
**Format:** 3-6 words, sentence case, max 1 emoji (end only), personalized with company/role
**Content:** Clear benefit/number, no fake "Re:/Fwd:", avoid vague/cliché, front-load hook for mobile
**Output:** 5 options with ≤90-char preheader, optimized for reply rate`
  },

  warnings: {
    title: "Warnings",
    content: `
    ### General Rules
    - Never use the word Free in the emails
    - Do deep research on the role this persona has, their pain points, and how Emerge might solve them.

    `
  },

  contextDump: {
    title: "Context Dump",
    content: `### Context Usage Rules

**Use provided context:** Prioritize most relevant customers, case studies, and value props from "RELEVANT CONTEXT FOR THIS EMAIL" section
**Match prospect:** Incorporate statistics/quotes that align with their industry and pain points
**Apply persona tone:** Use appropriate language style based on provided persona and context
**Case studies:** Include results/company names + proper links: "Dollar Tree saved $3.2 million - <a href='[URL]' target='_blank'>read their story here</a>"

### Email Sample Reference
**Use email samples:** Reference the provided email samples in /lib/email-samples.ts for tone, structure, and style guidance. Match the appropriate persona samples when generating emails.`
  }
}

// Generate the full preamble from sections
export const DEFAULT_PREAMBLE = `# Master Rules for Emerge Email Generation

## ${PREAMBLE_SECTIONS.goals.title}

${PREAMBLE_SECTIONS.goals.content}

## ${PREAMBLE_SECTIONS.returnFormat.title}

${PREAMBLE_SECTIONS.returnFormat.content}

## ${PREAMBLE_SECTIONS.warnings.title}

${PREAMBLE_SECTIONS.warnings.content}

## ${PREAMBLE_SECTIONS.contextDump.title}

${PREAMBLE_SECTIONS.contextDump.content}`

let storedPreamble = DEFAULT_PREAMBLE

// Helper function to generate full preamble from sections
export function generateFullPreamble(sections: typeof PREAMBLE_SECTIONS): string {
  return `# Master Rules for Emerge Email Generation

## ${sections.goals.title}

${sections.goals.content}

## ${sections.returnFormat.title}

${sections.returnFormat.content}

## ${sections.warnings.title}

${sections.warnings.content}

## ${sections.contextDump.title}

${sections.contextDump.content}`
}

// Get individual section
export function getPreambleSection(sectionKey: keyof typeof PREAMBLE_SECTIONS): string {
  return PREAMBLE_SECTIONS[sectionKey].content
}

// Update individual section
export function updatePreambleSection(sectionKey: keyof typeof PREAMBLE_SECTIONS, newContent: string): void {
  PREAMBLE_SECTIONS[sectionKey].content = newContent
}

// Get all sections
export function getAllPreambleSections() {
  return PREAMBLE_SECTIONS
}

// Parse a full preamble back into sections
export function parsePreambleToSections(preamble: string): typeof PREAMBLE_SECTIONS {
  const sections = { ...PREAMBLE_SECTIONS }
  
  // Split the preamble by section headers
  const sectionHeaders = [
    '## Goals',
    '## Return Format', 
    '## Warnings',
    '## Context Dump'
  ]
  
  const parts = preamble.split(/(?=## )/g)
  
  sectionHeaders.forEach((header, index) => {
    const nextHeader = sectionHeaders[index + 1]
    const sectionPart = parts.find(part => part.includes(header))
    
    if (sectionPart) {
      // Extract content between this header and the next one
      let content = sectionPart.replace(header, '').trim()
      if (nextHeader && content.includes(nextHeader)) {
        content = content.split(nextHeader)[0].trim()
      }
      
      // Map to the correct section key
      const sectionKeys = Object.keys(sections) as Array<keyof typeof PREAMBLE_SECTIONS>
      const sectionKey = sectionKeys[index]
      
      if (sectionKey && content) {
        sections[sectionKey] = {
          ...sections[sectionKey],
          content: content
        }
      }
    }
  })
  
  return sections
}

export async function getPreamble(): Promise<string> {
  // Always use the current DEFAULT_PREAMBLE to ensure we get the latest version
  // Clear any old cached version from localStorage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('email-preamble')
  }
  return DEFAULT_PREAMBLE
}

export async function updatePreamble(newPreamble: string): Promise<void> {
  storedPreamble = newPreamble
  if (typeof window !== 'undefined') {
    localStorage.setItem('email-preamble', newPreamble)
  }
}

export async function savePreamble(newPreamble: string): Promise<void> {
  storedPreamble = newPreamble
  if (typeof window !== 'undefined') {
    localStorage.setItem('email-preamble', newPreamble)
  }
}

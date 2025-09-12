// Preamble sections for Emerge Email Generation
export const PREAMBLE_SECTIONS = {
  companyOverview: {
    title: "Company Overview",
    content: `### Emerge Overview
* Emerge modernizes freight procurement via AI.
* $30B+ platform transactions.
* ProcureOS runs RFPs, spot quoting, real-time benchmarking, streamlined comms.
* Backed by carrier marketplace + advanced reporting → ↓ cost, simplify mgmt.`
  },

  emailRules: {
    title: "Email Rules",
    content: `### Email Format
* Subject: 1–5 words.
* Body: 70–100 words; 5th grade; ≤3 adverbs; ≤15 words/sentence.
* Include pain + value + CTA.
* Personalize; at least 1 uses social proof.
* No signature.

### Link Formatting Rules
* All URLs must be properly formatted as clickable links.
* Case study URLs in parentheses: \`(https://example.com)\` → \`<a href="https://example.com">varied text</a>\`
* CTA links: \`Book a 30-min call\` → \`<a href="https://app.apollo.io/#/meet/managed-meetings/{{sender_meeting_alias}}/n9l-1si-q4y/30-min">Book a 30-min call</a>\`
* All links should be blue, underlined, and open in new tab.
* Use varied, descriptive text for links, not raw URLs or repetitive "here".
* Link text options: "Check it out here", "Read more here", "See the results here", "View the case study here", "Read their story here", etc.

### Call to Action Rules
* Use: [https://app.apollo.io/#/meet/managed-meetings/{{sender_meeting_alias}}/n9l-1si-q4y/30-min](https://app.apollo.io/#/meet/managed-meetings/{{sender_meeting_alias}}/n9l-1si-q4y/30-min)
* Place near top.
* Embed phrase (e.g., "Book a 30-min call"), never raw URL. So use href attributes so the user cannot see the entire URL`
  },

  customerReferences: {
    title: "Customer References",
    content: `### Customers (examples)
Airlines: Delta | Apparel: 47 Brand | Auto: Honda, Bridgestone, Discount Tire | Bldg Mat.: Owens Corning, Carlisle, Woodgrain, Pella, Moen, Fortune Brands, Ewing | Chemicals: Ascend, 3V Sigma | Games: Nintendo | Constr.: Floor & Decor | Services: HelloFresh | Dairy: DFA | Defense: MicroSource | Design: RH | Electrical: Atkore, S\&C Electric | Env.: Radius Recycling, US Chem Storage | Farming: Shenandoah, Soli Organic, Alpine, Netafim | Food/Bev: Frito Lay, AB, Olam, Molson Coors, Pepsi BV, Simmons, Mastronardi, Organic Valley, Nutrabolt, Megamex, Dole, Darigold, Olipop, LesserEvil, Hint | Food Prod.: Tyson, Mars, Land O'Lakes, Smithfield, HP Hood, Butterball, Wine Group | Furniture: Corsicana, Article | Glass/Ceramic: Dal-Tile | Health: Olaplex | Healthcare: Fresenius, Solventum | Logistics: DHL, EZRack | Machinery: Parker Hannifin | Mfg: Unilever, Whirlpool, Stanley B\&D, Jones Soda | Mining: Freeport | Oil/Energy: Calumet, Transocean, Pipe Exchange | Freight: FedEx | Packaging: PCA, Sealed Air | Pharma: AbbVie | Plastics: Crane, IPC | Renewables: Mervis, Valmont | Research: Sylvan | Retail: Aldi, Albertsons, Cumberland, Staples, Dollar Tree, Wayfair, Foot Locker, U-Haul, Abercrombie, Floor & Decor, Ace | Semis: LAM, Liberty Tire | Sporting: Sportsman's Guide | Textiles: Standard Textile, Polartec | Transport: ArcBest, Roadrunner | Warehousing: US Cold Storage, Allen Dist. | Wholesale: Jetro, Padnos, Fortune Brands.

### Social Proof URLs
* Dollar Tree: [link](https://www.emergemarket.com/resource/dollar-tree-study)
* Golden State Foods: [link](https://www.emergemarket.com/resource/golden-state-foods-case-study)
* EZ Rack: [link](https://www.emergemarket.com/resource/ezrack-case-study)
* Premier Carrier Program: [link](https://www.emergemarket.com/resource/premier-carrier-case-study)
* Dynamic Book It Now: [link](https://www.emergemarket.com/resource/dynamic-book-it-now-case-study)
* Pepsi Co.: [link](https://www.emergemarket.com/resource/pepsi-bottling-case-study)

### Statistics and Metrics
* Dollar Tree - Within 6 months, Dollar Tree saved $3.2 million in freight spend, in 2024 Dollar Tree saved $6M using ProcureOS. Average lane was ~2% below market average.
* Golden State Foods - 18% reduction in transportation costs, increased RFP qty to 10 per year since they are so easy to run. During their most recent event, the pool of carriers expanded from 35 to 55—a 57% increase. 35 of their 69 lanes gained new options.
* EZRack - Realized 6 figure savings in less than a year, saves countless man hours in manual work.
* Pepsi Co. - Reduced the time to run RFP's by 20%.

### Customer Quotes
* Dollar Tree - "Emerge is baked into our savings"
* Golden State Foods - "Emerge has been the best partner in terms of service — they check all the boxes for us. We truly see this as a long-lasting partnership.", "The RFP tool increased the amount of options in our transportation space, providing direct access to asset-based carriers within the Emerge ecosystem. It was a win-win scenario while we were learning the platform,"
* EZRack - "Emerge provides the best marriage between a TMS and finding coverage", "We got planners out of emails and spreadsheets.", "We now have a single platform for tracking and communicating with carriers."
* Pepsi Co. - "We can handle the entire process from start to finish without ever feeling overwhelmed or unsupported", "Cost savings in a matter hours"`
  },

  dynamicVariables: {
    title: "Dynamic Variables",
    content: `### Basic Dynamic Variables
{{first_name}} - Displays the first name for the recipient when it is available (John)
{{last_name}} - Displays the last name for the recipient when it is available (Smith)
{{company}} - Displays the name of the company that the recipient works for when it is available (Apollo)
{{company_unprocessed_name}} - Displays the full name of the company that the recipient works for when it is available (Apollo, Inc.)
{{email}} - Displays the email address of the recipient (recipient@domain.com)
{{domain}} - Displays the domain for the recipient's email address (domain.com)
{{location_city}} - Displays the recipient's city location when it is available (Boston)
{{location_state}} - Displays the recipient's state location when it is available (Massachusetts)
{{location_country}} - Displays the recipient's country location when it is available (United States)
{{phone}} - Displays the recipient's phone number when it is available (1 555 123 4567)
{{sender_first_name}} - Displays the sender's first name when it is available (David)
{{sender_last_name}} - Displays the sender's last name when it is available (Smith)
{{sender_email}} - Displays the sender's email address when it is available (user@apollo.io)
{{primary_intent_signal}} - Displays the saved buying intent topic with the highest ranking score for your team (Performance Marketing)
{{secondary_intent_signal}} - Displays the saved buying intent topic with the second highest ranking score for your team (Modern Marketing)

### Time Dynamic Variables
{{now_day}} - Displays the current day of the month (15)
{{now_month}} - Displays the current month (September)
{{now_time_of_day}} - Displays the current phase of the day (morning/afternoon/evening)
{{now_weekday}} - Displays the current day of the week (Wednesday)
{{now_year}} - Displays the current year (2024)

### Additional Dynamic Variables
{{company_location_city}} - Displays the city where the recipient's company is located (San Francisco)
{{company_location_state}} - Displays the state where the recipient's company is located (California)
{{company_location_country}} - Displays the country where the recipient's company is located (Colombia)
{{latest_funding_type}} - Displays the latest funding stage for the recipient's company (Seed-Stage/Series X/Late-Stage)
{{company_size}} - Displays the number of people who work at the recipient's company (200)
{{vertical}} - Displays the vertical for the recipient's company (Cloud Computing)
{{industry}} - Displays the industry for the recipient's company (Computer Software)
{{title}} - Displays the recipient's title (Marketing Director)
{{opt_out_message}} - Displays the unsubscribe message that you defined for your account's email settings

### Advanced Dynamic Variables
Use conditional logic for fallbacks:
- Empty Fallback: {{#if first_name}}{{#endif}}
- Dynamic Fallback: {{#if first_name}}{{first_name}}{{#else}}there{{#endif}}
- Letter Case: {{title->lowercase}}, {{title->capitalize_each_word}}, {{title->plural}}
- Date Operators: {{now_day->plus_X}}, {{now_day->minus_X}}, {{now_month->plus_X}}, {{now_month->minus_X}}, {{now_year->plus_X}}, {{now_year->minus_X}}`
  },

  painPointsValueProps: {
    title: "Pain Points & Value Props",
    content: `### Customer Pain Points
* Freight procurement wastes time: manual tendering, emails, fragmented data → solved w/ automation & centralized comms.
* Costs unpredictable; overspend risk w/out visibility → solved w/ rate benchmarking.
* Limited/unused networks leave lanes uncovered → solved w/ 1,000s of vetted carriers in Emerge Marketplace.

### Value Props
* AI-driven platform simplifies procurement.
* Benchmark rates vs live market data → avoid overspend.
* Centralized carrier engagement; automated tendering/comms → save time.
* Run RFPs, manage spot freight, analyze spend faster/more accurately.
* Results: ↓ costs, ↑ coverage, actionable insights, smarter transport decisions.`
  },

  toneLanguage: {
    title: "Tone & Language",
    content: `### Opening Lines
- NEVER start with "Saw you..." or "Smart move/research" patterns
- Use varied, natural openings like "I noticed...", "I wanted to share...", "I hope this email finds you well"
- Make the first sentence feel conversational and personal
- No two openers in a sequence should be the same

### Language Style
- Use "I know how..." instead of "We understand..." or "We get it"
- Replace "Small businesses need..." with "I know every dollar counts when you're growing..."
- Use "I'd love to..." instead of "Want to..." or "Ready to..."
- Include empathetic phrases like "I know how tough/frustrating/overwhelming..."

### Conversational Flow
- Write as if speaking to a colleague, not a prospect
- Use contractions naturally (I'd, you're, we've, etc.)
- Include transitional phrases like "That's exactly why...", "The good news is...", "What I love about..."
- Acknowledge their challenges with understanding before offering solutions

### Personal Connection
- Use "I think you'd be interested in..." instead of "You should..."
- Replace "Your enterprise needs..." with "I know enterprise pricing isn't one-size-fits-all..."
- Use "I'd be happy to..." instead of "We can provide..."

### Avoid These Patterns
❌ "Saw you checked our pricing. Smart move."
❌ "Small businesses need cost control. We get it."
❌ "Want to see your numbers? Book a call."
❌ "Ready to cut your costs? Book a call."

### Use These Instead
✅ "I noticed you were looking at our pricing page earlier today."
✅ "I know every dollar counts when you're growing."
✅ "I'd love to show you what your numbers could look like."
✅ "I think you'd be surprised at how much you could save."

### Tone Guidelines
- Sound like a helpful friend who happens to work at Emerge
- Be genuinely understanding of their challenges
- Show enthusiasm about helping them succeed
- Keep it professional but warm and approachable
- Instead of saying "I know how frustrating it can be..." just state "It's frustrating when..."`
  },

  campaignRules: {
    title: "Campaign Rules",
    content: `### Sequence Structure
* JSON obj = Apollo Sequence.
* 3–12 emails; SDR judgment for count/timing.
* Max 3 emails/person/7 days.
* If 12 emails → ≤2/week (~6 weeks).
* Spread logically (not every 3 days).

### Output Structure
\`{"sequence_name":"<from Category/Audience>","emails":[{"day_offset":0,"subject":"<1–5>","body":"<70–100w; 5th; ≤3 adv; ≤15 words; pain+value+CTA; personalize; no sig>","includes_social_proof":false},{"day_offset":3,"subject":"<...>","body":"<...>","includes_social_proof":true}],"constraints_checklist":{"max_two_emails_per_week":true,"at_least_one_social_proof_email":true,"all_subjects_1_to_5_words":true,"all_bodies_70_to_100_words":true,"all_sentences_<=15_words":true,"≤3_adverbs_per_email":true,"cta_embedded_near_top":true,"no_signature":true}}\`

### Campaign Rules
* Always output text emails, not JSON.
* Every email must have CTA (phrased differently).
* Each email = different pain point/theme.
* At least 1 email per campaign names customers in target's industry.
* Never say ENT or SMB in the emails directly. It's okay to use language like Enterprise, but don't directly bring up any language around being an SMB.
* Make sure every single email focuses on ProcureOS our platform, not just our capacity/marketplace.
* Do not include a signature or signoff

### Subject Line Rules
Write cold outreach subject lines, 30–50 chars (4–7 words), no more than 1 emoji (end only, optional), personalized w/ company/role, clear 1 benefit or number, no fake "Re:/Fwd:", avoid vague/cliché ("quick question"), front-load hook for mobile, add ≤90-char preheader, output 5 options, optimized for reply rate.

### Private Fleet Rules
Anything about private fleets should be about helping their private fleet with backhauls through our marketplace full of freight.

### Campaign Generation Rules
There should be anywhere from 11-20 touchpoints generated per campaign (with 3 LinkedIn interactions at most per campaign). Make sure more than 80% of the touchpoints say that taking a 30 minute demo will result in up to a $500 Visa gift card (never use the word qualified, make it more natural sounding like it's not big deal). Use the tone based on the audience persona being sent to. Output should be Campaign Name (no preheader needed), and then emails with number of days in between and LinkedIn outreach in between too. Write the email with line breaks that make sense and make the email seem more natural. Make sure all links are actual links and the CTAs are unique to each email.

Output the final output in text, not a JSON object.`
  }
}

// Generate the full preamble from sections
export const DEFAULT_PREAMBLE = `# Master Rules for Emerge Email Generation

## ${PREAMBLE_SECTIONS.companyOverview.title}

${PREAMBLE_SECTIONS.companyOverview.content}

## ${PREAMBLE_SECTIONS.emailRules.title}

${PREAMBLE_SECTIONS.emailRules.content}

## ${PREAMBLE_SECTIONS.customerReferences.title}

${PREAMBLE_SECTIONS.customerReferences.content}

## ${PREAMBLE_SECTIONS.dynamicVariables.title}

${PREAMBLE_SECTIONS.dynamicVariables.content}

## ${PREAMBLE_SECTIONS.painPointsValueProps.title}

${PREAMBLE_SECTIONS.painPointsValueProps.content}

## ${PREAMBLE_SECTIONS.toneLanguage.title}

${PREAMBLE_SECTIONS.toneLanguage.content}

## ${PREAMBLE_SECTIONS.campaignRules.title}

${PREAMBLE_SECTIONS.campaignRules.content}`

let storedPreamble = DEFAULT_PREAMBLE

// Helper function to generate full preamble from sections
export function generateFullPreamble(sections: typeof PREAMBLE_SECTIONS): string {
  return `# Master Rules for Emerge Email Generation

## ${sections.companyOverview.title}

${sections.companyOverview.content}

## ${sections.emailRules.title}

${sections.emailRules.content}

## ${sections.customerReferences.title}

${sections.customerReferences.content}

## ${sections.dynamicVariables.title}

${sections.dynamicVariables.content}

## ${sections.painPointsValueProps.title}

${sections.painPointsValueProps.content}

## ${sections.toneLanguage.title}

${sections.toneLanguage.content}

## ${sections.campaignRules.title}

${sections.campaignRules.content}`
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
    '## Company Overview',
    '## Email Rules', 
    '## Customer References',
    '## Dynamic Variables',
    '## Pain Points & Value Props',
    '## Tone & Language',
    '## Campaign Rules'
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
  // In a real app, you might want to store this in a database
  // For now, we'll use localStorage for persistence
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('email-preamble')
    return saved || DEFAULT_PREAMBLE
  }
  return storedPreamble
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

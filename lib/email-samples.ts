// Email samples for different personas to guide AI email generation
export const EMAIL_SAMPLES = {
  newCFOs: {
    persona: "New CFOs looking to make an impact",
    emails: [
      {
        subject: "Congrats on your new role!",
        body: `Hey {{contact.first_name}},

Congrats on your new role as CFO at {{account.name}}!

I know you're driving impact, so I'll keep this short. Transportation costs rise during uncertain times. With Emerge, CFOs gain control of freight spend. Dollar Tree saved $3.2M+ in 6 months using our software. We had them up and running in under 2 hours.

Interested in learning how we can help {{account.name}} achieve similar results?`
      },
      {
        subject: "Smarter freight reporting for Finance",
        body: `Hi {{contact.first_name}},

I wanted to follow up on my previous note. Many new CFOs I speak with say transportation costs can feel like a black box – difficult to compare and impossible to control.

That's why Finance and Operations leaders at Albertsons, Ace Hardware, and AB InBev use Emerge. Our reporting and benchmarking tools give them real-time visibility, so they know market rates and never risk overpaying on freight.

Would it make sense to connect for 20 minutes to explore if {{account.name}} could benefit too?`
      }
    ]
  },

  vpTransportation: {
    persona: "VP of Transportation that's growing their team",
    emails: [
      {
        subject: "Empower your growing team",
        body: `Hi {{contact.first_name}},

I saw you're growing your transportation team at {{account.name}}. Many VPs say the real challenge isn't hiring – it's finding the right people and keeping them engaged under pressure to deliver fast.

That's why transportation leaders use Emerge. Our platform and real-time reporting help new hires ramp up quickly while giving existing team members the support they need to hit their targets.

Would it make sense to connect to explore how {{account.name}} could empower its team with the right tools?`
      },
      {
        subject: "Equip your growing team",
        body: `Hi {{contact.first_name}},

I wanted to follow up on my note. When transportation teams are growing, leaders tell me their biggest hurdle is making sure new hires ramp up quick and existing staff stay engaged.

That's why many VPs turn to modern platforms like Emerge. Teams love the ease of use, real-time reporting, and automation – because it cuts manual work and helps them deliver faster.

Would it be worth a quick chat to explore if {{account.name}} could equip its growing team with tools they'll love?`
      }
    ]
  },

  logisticsIntern: {
    persona: "Intern in logistics department",
    emails: [
      {
        subject: "Stand out during your internship",
        body: `Hey {{contact.first_name}}, congrats on the internship at {{account.name}}!

Internships are a chance to show initiative. Many interns I meet say it's tough to prove impact when most of their work is manual tasks like rate entry, shipment tracking, or invoice matching.

One way to stand out is by bringing your manager a solution.

With Emerge's software, those manual tasks get automated. Best part? No complicated IT setup required.

Should I send you a short overview to pitch to your manager?`
      },
      {
        subject: "reply to thread",
        body: `Hi {{contact.first_name}}, just following up here.

The best part about Emerge is that getting set up takes less than a day. That means you could bring your manager a ready-to-go project idea without waiting on IT resources.

Interns who show initiative like this often get noticed and open doors for full-time opportunities. Helping your team automate manual work could be the project that sets you apart.

Would it help if I sent you a one-page overview to share with your manager?`
      }
    ]
  }
}

// Helper function to get email samples by persona
export function getEmailSamplesByPersona(personaName: string) {
  const normalizedPersona = personaName.toLowerCase().replace(/\s+/g, '')
  
  if (normalizedPersona.includes('cfo') || normalizedPersona.includes('finance')) {
    return EMAIL_SAMPLES.newCFOs
  }
  
  if (normalizedPersona.includes('vp') && normalizedPersona.includes('transportation')) {
    return EMAIL_SAMPLES.vpTransportation
  }
  
  if (normalizedPersona.includes('intern') || normalizedPersona.includes('internship')) {
    return EMAIL_SAMPLES.logisticsIntern
  }
  
  return null
}

// Helper function to get all available personas
export function getAllPersonas() {
  return Object.keys(EMAIL_SAMPLES).map(key => ({
    key,
    persona: EMAIL_SAMPLES[key as keyof typeof EMAIL_SAMPLES].persona
  }))
}

// Helper function to format samples for AI prompt
export function formatSamplesForPrompt(personaName?: string) {
  if (personaName) {
    const samples = getEmailSamplesByPersona(personaName)
    if (samples) {
      return `## Email Samples for ${samples.persona}\n\n` + 
        samples.emails.map((email, index) => 
          `**Email ${index + 1}**\nSubject: ${email.subject}\n\n${email.body}\n`
        ).join('\n---\n\n')
    }
  }
  
  // Return all samples if no specific persona
  return Object.entries(EMAIL_SAMPLES).map(([key, data]) => 
    `## ${data.persona}\n\n` +
    data.emails.map((email, index) => 
      `**Email ${index + 1}**\nSubject: ${email.subject}\n\n${email.body}\n`
    ).join('\n---\n\n')
  ).join('\n')
}

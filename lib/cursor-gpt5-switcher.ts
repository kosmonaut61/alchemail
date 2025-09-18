import OpenAI from "openai";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/** Return your available GPT-5 models, sorted fastest -> slowest */
async function getGpt5Models() {
  const all = await client.models.list();
  const names = all.data.map(m => m.id);
  const candidates = ["gpt-5-nano", "gpt-5-mini", "gpt-5"]; // Start with fastest
  return candidates.filter(name => names.includes(name));
}

/** Try each model in order until one succeeds */
export async function runWithGpt5(prompt: string) {
  const available = await getGpt5Models();
  if (available.length === 0) {
    throw new Error("No GPT-5 variants available to your API key.");
  }

  for (const model of available) {
    try {
      const resp = await client.responses.create({
        model,
        input: [
          { role: "system", content: "You are a concise, accurate assistant." },
          { role: "user", content: prompt }
        ],
      });
      return { model, text: resp.output_text };
    } catch (err) {
      console.warn(`Model ${model} failed:`, (err as any)?.message);
      // continue to next candidate
    }
  }
  throw new Error("All GPT-5 variants failed.");
}

import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

// Map friendly names → real API IDs
const MODEL_MAP: Record<string, string> = {
  "gpt-5": "gpt-5",            // latest, most capable
  "gpt-5-mini": "gpt-5-mini",  // balanced
  "gpt-5-nano": "gpt-5o-nano", // fastest (must use gpt-5o-nano, not gpt-5-nano)
  "gpt-4o": "gpt-4o",          // fallback
  "gpt-4o-mini": "gpt-4o-mini", // fallback mini
};

export async function generateWithGPT5(prompt: string, model: string = "gpt-5") {
  const modelId = MODEL_MAP[model] || "gpt-5";

  try {
    console.log(`Attempting to use model: ${modelId}`);
    
    // GPT-5 models don't support temperature parameter in AI SDK either
    const isGPT5 = modelId.startsWith('gpt-5');
    const generateParams: any = {
      model: openai(modelId),
      prompt,
      maxTokens: 800
    };
    
    // Only add temperature for non-GPT-5 models
    if (!isGPT5) {
      generateParams.temperature = 0.3;
    }
    
    const result = await generateText(generateParams);

    console.log(`Successfully generated text with model: ${modelId}`);
    return result.text;
  } catch (error) {
    console.error(`Error with model ${modelId}:`, error);
    
    // If GPT-5 fails, fallback to GPT-4o
    if (modelId.startsWith('gpt-5')) {
      console.log('Falling back to GPT-4o...');
      try {
        const fallbackResult = await generateText({
          model: openai("gpt-4o"),
          prompt,
          maxTokens: 800,
          temperature: 0.3
        });
        return fallbackResult.text;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
        throw new Error(`Both ${modelId} and fallback failed: ${fallbackError}`);
      }
    }
    
    throw error;
  }
}

// Alternative function using direct OpenAI client for GPT-5
export async function generateWithOpenAIDirect(prompt: string, model: string = "gpt-5") {
  try {
    const { OpenAI } = await import('openai');
    const openaiClient = new OpenAI();
    
    console.log(`Using direct OpenAI client with model: ${model}`);
    
    // GPT-5 models don't support temperature parameter
    const isGPT5 = model.startsWith('gpt-5');
    const requestParams: any = {
      model: model,
      messages: [{ role: "user", content: prompt }],
      max_completion_tokens: 800
    };
    
    // Only add temperature for non-GPT-5 models
    if (!isGPT5) {
      requestParams.temperature = 0.3;
    }
    
    const response = await openaiClient.chat.completions.create(requestParams);
    
    console.log(`Direct OpenAI client succeeded with model: ${model}`);
    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error(`Direct OpenAI client failed with model ${model}:`, error);
    
    // Fallback to AI SDK
    console.log('Falling back to AI SDK with GPT-4o...');
    return generateWithGPT5(prompt, "gpt-4o");
  }
}

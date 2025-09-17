import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

// Map friendly names → real API IDs
const MODEL_MAP: Record<string, string> = {
  "gpt-5": "gpt-5",            // latest, most capable
  "gpt-5-mini": "gpt-5-mini",  // balanced
  "gpt-5-nano": "gpt-5-nano",  // fastest
  "gpt-4o": "gpt-4o",          // fallback
  "gpt-4o-mini": "gpt-4o-mini", // fallback mini
};

export async function generateWithGPT5(prompt: string, model: string = "gpt-5") {
  const modelId = MODEL_MAP[model] || "gpt-5";

  try {
    console.log(`[GPT-5] Using model: ${modelId}`);
    console.log(`[GPT-5] Prompt length: ${prompt.length} characters`);

    // Use the exact same pattern as the working chatbot
    const { text, usage, finishReason } = await generateText({
      model: openai(modelId, {
        apiKey: process.env.OPENAI_API_KEY,
      }),
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      maxTokens: 2000,
      temperature: 0.7,
      topP: 0.9,
      frequencyPenalty: 0.1,
      presencePenalty: 0.1,
    });

    console.log(`[GPT-5] Response generated successfully, usage:`, usage);
    return text;
  } catch (error) {
    console.error(`[GPT-5] Error with model ${modelId}:`, error);
    
    // If GPT-5 fails, fallback to GPT-4o
    if (modelId.startsWith('gpt-5')) {
      console.log('[GPT-5] Falling back to GPT-4o...');
      try {
        const { text } = await generateText({
          model: openai("gpt-4o", {
            apiKey: process.env.OPENAI_API_KEY,
          }),
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          maxTokens: 2000,
          temperature: 0.7,
        });
        console.log(`[GPT-5] Fallback successful with GPT-4o`);
        return text;
      } catch (fallbackError) {
        console.error('[GPT-5] Fallback also failed:', fallbackError);
        throw new Error(`Both ${modelId} and fallback failed: ${fallbackError}`);
      }
    }
    
    throw error;
  }
}

// GPT-5 specific function using the Responses API
export async function generateWithGPT5Responses(prompt: string, model: string = "gpt-5") {
  try {
    console.log(`\n🚀 ===== GPT-5 RESPONSES API START =====`);
    console.log(`📧 Model: ${model}`);
    console.log(`📏 Prompt Length: ${prompt.length} characters`);
    console.log(`📄 Prompt Preview (first 300 chars):`);
    console.log('─'.repeat(60));
    console.log(prompt.substring(0, 300) + (prompt.length > 300 ? '...' : ''));
    console.log('─'.repeat(60));
    
    const { OpenAI } = await import('openai');
    const openaiClient = new OpenAI();
    
    // Use the Responses API for GPT-5 models with proper input format
    const requestParams: any = {
      model: model,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: prompt
            }
          ]
        }
      ],
      reasoning: { effort: "minimal" }, // Use minimal reasoning for faster responses
      text: { 
        verbosity: "low"        // Use low verbosity for faster responses
      }
    };
    
    console.log(`🔧 GPT-5 Parameters:`, {
      model: model,
      reasoning: "minimal",
      verbosity: "low",
      promptLength: prompt.length,
      inputFormat: "responses_api"
    });
    
    console.log(`🚀 Sending to GPT-5 Responses API...`);
    
    // Add a timeout for the GPT-5 API call
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('GPT-5 API timeout')), 30000) // 30 second timeout
    });
    
    const response = await Promise.race([
      openaiClient.responses.create(requestParams),
      timeoutPromise
    ]);
    
    const responseText = response.output_text || "";
    
    console.log(`✅ GPT-5 Responses API succeeded with ${model}`);
    console.log(`📊 Response length: ${responseText.length} characters`);
    console.log(`📄 Response preview (first 200 chars):`);
    console.log('─'.repeat(60));
    console.log(responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
    console.log('─'.repeat(60));
    console.log(`🚀 ===== GPT-5 RESPONSES API END =====\n`);
    
    return responseText;
  } catch (error) {
    console.error(`❌ GPT-5 Responses API failed with model ${model}:`, error);
    
    // Fallback to Chat Completions API
    console.log('🔄 Falling back to Chat Completions API...');
    return generateWithOpenAIDirect(prompt, model);
  }
}

// Alternative function using direct OpenAI client for GPT-5 (Chat Completions API)
export async function generateWithOpenAIDirect(prompt: string, model: string = "gpt-5") {
  try {
    console.log(`\n🔗 ===== DIRECT OPENAI CLIENT START =====`);
    console.log(`📧 Model: ${model}`);
    console.log(`📏 Prompt Length: ${prompt.length} characters`);
    console.log(`📄 Prompt Preview (first 300 chars):`);
    console.log('─'.repeat(60));
    console.log(prompt.substring(0, 300) + (prompt.length > 300 ? '...' : ''));
    console.log('─'.repeat(60));
    
    const { OpenAI } = await import('openai');
    const openaiClient = new OpenAI();
    
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
    
    console.log(`🔧 Parameters:`, {
      model: model,
      max_completion_tokens: 800,
      temperature: isGPT5 ? 'not supported' : 0.3,
      promptLength: prompt.length,
      messageCount: 1
    });
    
    console.log(`🚀 Sending to OpenAI API...`);
    const response = await openaiClient.chat.completions.create(requestParams);
    
    const responseText = response.choices[0]?.message?.content || "";
    
    console.log(`✅ Direct OpenAI client succeeded with ${model}`);
    console.log(`📊 Response length: ${responseText.length} characters`);
    console.log(`📄 Response preview (first 200 chars):`);
    console.log('─'.repeat(60));
    console.log(responseText.substring(0, 200) + (responseText.length > 200 ? '...' : ''));
    console.log('─'.repeat(60));
    console.log(`🔗 ===== DIRECT OPENAI CLIENT END =====\n`);
    
    return responseText;
  } catch (error) {
    console.error(`❌ Direct OpenAI client failed with model ${model}:`, error);
    
    // Fallback to AI SDK with GPT-4o (avoiding circular dependency)
    console.log('🔄 Falling back to AI SDK with GPT-4o...');
    const { text } = await generateText({
      model: openai("gpt-4o", {
        apiKey: process.env.OPENAI_API_KEY,
      }),
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      maxTokens: 2000,
      temperature: 0.7,
    });
    return text;
  }
}

// Generic AI formatting service using Groq, Gemini, or Local LLM (Ollama)
// Usage: set your API key in the environment (e.g., process.env.GROQ_API_KEY or process.env.GEMINI_API_KEY)
// For local LLM (Ollama): set LOCAL_LLM_ENDPOINT (default: http://localhost:11434) and optionally LOCAL_LLM_MODEL (default: llama3.2:latest)
// provider: 'groq' | 'gemini' | 'local'

export type AIProvider = 'groq' | 'gemini' | 'local';

interface AIFormattingOptions {
  provider: AIProvider;
  systemPrompt: string;
  userPrompt: string;
  // Optionally allow model selection
  model?: string;
}

/**
 * Formats the user prompt based on the system prompt using the selected AI provider.
 * No business logic is hardcoded; all instructions come from the prompts.
 */
export async function aiFormat({ provider, systemPrompt, userPrompt, model }: AIFormattingOptions): Promise<string> {
  if (provider === 'groq') {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('Missing GROQ_API_KEY in environment');
    // Default model for Groq (can be overridden)
    const groqModel = model || 'llama3-8b-8192';
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: groqModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Groq API error: ${error}`);
    }
    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || '';
  } else if (provider === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Missing GEMINI_API_KEY in environment');
    // Default model for Gemini (can be overridden)
    const geminiModel = model || 'gemini-pro';
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          { role: 'system', parts: [{ text: systemPrompt }] },
          { role: 'user', parts: [{ text: userPrompt }] },
        ],
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${error}`);
    }
    const data = await response.json();
    // Gemini's response structure may vary; adjust as needed
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
  } else if (provider === 'local') {
    // Local LLM using Ollama native API format
    const endpoint = process.env.LOCAL_LLM_ENDPOINT || 'http://localhost:11434';
    if (!endpoint) throw new Error('Missing LOCAL_LLM_ENDPOINT in environment');
    // Default model for local LLM (can be overridden)
    const localModel = model || process.env.LOCAL_LLM_MODEL || 'llama3.2:latest';
    const url = endpoint.endsWith('/api/generate') 
      ? endpoint 
      : `${endpoint}/api/generate`;
    
    // Combine system and user prompts for Ollama format
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: localModel,
        prompt: combinedPrompt,
        stream: false,
      }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Local LLM API error: ${error}`);
    }
    const data = await response.json();
    return data.response?.trim() || '';
  } else {
    throw new Error('Unsupported AI provider');
  }
}

// Example usage (uncomment to test in a Node.js environment):
// (async () => {
//   const formatted = await aiFormat({
//     provider: 'groq',
//     systemPrompt: 'Format the following text as a professional email.',
//     userPrompt: 'hey, can you send me the report?',
//   });
//   console.log(formatted);
// })();

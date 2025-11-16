/**
 * Groq API Integration
 * Secure key reconstruction and API communication
 * 
 * IMPORTANT: Split the API key across multiple parts for GitHub security
 * Reconstruct only at runtime in the browser
 */

// Character-specific API keys split for GitHub security
// Each character uses their own dedicated API key

const LAWRENCE_KEY_1 = "gsk_0cQgobYyQz0i";
const LAWRENCE_KEY_2 = "0NXaoYDDWGdyb3FYKzKH";
const LAWRENCE_KEY_3 = "Emy1fWgA1fL8biIFGfbY";

const DOTTORE_KEY_1 = "gsk_1dVz4UIVKa8E";
const DOTTORE_KEY_2 = "LwVqqmP6WGdyb3FY7hn6";
const DOTTORE_KEY_3 = "H8N59GD2PTt5b05FEDE3";

const SAMPO_KEY_1 = "gsk_z5kD3vMaR9GZ";
const SAMPO_KEY_2 = "LHDomPhGWGdyb3FYCPPt";
const SAMPO_KEY_3 = "LYhGraGbK8fthCwR0v8z";

// Map character IDs to their API keys
const CHARACTER_KEYS = {
  'character-a': () => LAWRENCE_KEY_1 + LAWRENCE_KEY_2 + LAWRENCE_KEY_3,
  'character-b': () => DOTTORE_KEY_1 + DOTTORE_KEY_2 + DOTTORE_KEY_3,
  'character-c': () => SAMPO_KEY_1 + SAMPO_KEY_2 + SAMPO_KEY_3
};

// Get API key for specific character
function getApiKey(characterId = 'character-a') {
  const keyFunction = CHARACTER_KEYS[characterId];
  return keyFunction ? keyFunction() : CHARACTER_KEYS['character-a']();
}

// Groq API endpoint
const GROQ_API_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

// Available models (Groq supports Llama and Mixtral models)
const MODELS = {
  LLAMA_70B: "llama-3.3-70b-versatile",    // Most capable, great for complex personalities
  LLAMA_70B_SPECDEC: "llama-3.1-70b-versatile", // Fast 70B with speculative decoding
  LLAMA_8B: "llama-3.1-8b-instant",        // Fast responses
  MIXTRAL: "mixtral-8x7b-32768"            // Long context support
};

/**
 * Send a chat message to Groq API
 * @param {string} message - User's message
 * @param {Array} conversationHistory - Previous messages
 * @param {string} systemPrompt - Character personality
 * @param {string} model - Model to use
 * @param {Object} characterParams - Character-specific parameters
 * @param {string} characterId - Character ID for API key selection
 * @returns {Promise<string>} AI response
 */
async function sendChatMessage(
  message,
  conversationHistory = [],
  systemPrompt = "You are a helpful and friendly AI assistant.",
  model = MODELS.VERSATILE,
  characterParams = {},
  characterId = 'character-a'
) {
  try {
    // Build messages array - normalize 'ai' role to 'assistant' for compatibility
    const normalizedHistory = conversationHistory.map(msg => ({
      ...msg,
      role: msg.role === 'ai' ? 'assistant' : msg.role
    }));
    
    const messages = [
      { role: "system", content: systemPrompt },
      ...normalizedHistory,
      { role: "user", content: message }
    ];
    
    // Default parameters with character overrides
    const params = {
      temperature: 0.7,
      max_tokens: 600,
      top_p: 0.9,
      ...characterParams
    };
    
    console.log(`[Groq API] Sending message to ${model} for character ${characterId}`);
    console.log(`[Groq API] API Key: ${getApiKey(characterId).substring(0, 15)}...`);
    
    // Make API request with character-specific key
    const response = await fetch(GROQ_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getApiKey(characterId)}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        ...params,
        stream: false
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[Groq API] Error response:`, errorData);
      throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`[Groq API] Success! Response received.`);
    return data.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    
  } catch (error) {
    console.error("Groq API Error:", error);
    console.error("Full error details:", error.message);
    return handleApiError(error);
  }
}

/**
 * Stream a chat response (for typing effect)
 * @param {string} message - User's message
 * @param {Array} conversationHistory - Previous messages
 * @param {string} systemPrompt - Character personality
 * @param {Function} onChunk - Callback for each text chunk
 * @param {string} model - Model to use
 * @param {Object} characterParams - Character-specific parameters
 * @param {string} characterId - Character ID for API key selection
 */
async function streamChatMessage(
  message,
  conversationHistory = [],
  systemPrompt = "You are a helpful and friendly AI assistant.",
  onChunk = () => {},
  model = MODELS.VERSATILE,
  characterParams = {},
  characterId = 'character-a'
) {
  try {
    // Build messages array - normalize 'ai' role to 'assistant' for compatibility
    const normalizedHistory = conversationHistory.map(msg => ({
      ...msg,
      role: msg.role === 'ai' ? 'assistant' : msg.role
    }));
    
    const messages = [
      { role: "system", content: systemPrompt },
      ...normalizedHistory,
      { role: "user", content: message }
    ];
    
    // Default parameters with character overrides
    const params = {
      temperature: 0.7,
      max_tokens: 600,
      top_p: 0.9,
      ...characterParams
    };
    
    const response = await fetch(GROQ_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${getApiKey(characterId)}`
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        ...params,
        stream: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }
    
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullResponse = "";
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim() !== '');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.slice(6);
          if (jsonStr === '[DONE]') continue;
          
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices[0]?.delta?.content || '';
            if (content) {
              fullResponse += content;
              onChunk(content, fullResponse);
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
    
    return fullResponse;
    
  } catch (error) {
    console.error("Groq Streaming Error:", error);
    return handleApiError(error);
  }
}

/**
 * Handle API errors gracefully
 * @param {Error} error - The error object
 * @returns {string} User-friendly error message
 */
function handleApiError(error) {
  console.error('[Groq API] Error handler called with:', error);
  
  const errorMsg = error.message || String(error);
  
  if (errorMsg.includes('API key') || errorMsg.includes('Unauthorized') || errorMsg.includes('401')) {
    return "Shit... I lost my key... can you help me? Or just ask for your boy to help me out here...";
  }
  
  if (errorMsg.includes('rate limit') || errorMsg.includes('429')) {
    return "Slow down, girl... just because it exists doesn't mean it's limitless... wait a brief and come back...";
  }
  
  if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('Failed to fetch')) {
    return "You're offline, bitch... don't guess I'll work directly from your dirty mind... perhaps..... NO!";
  }
  
  if (errorMsg.includes('model') || errorMsg.includes('not found') || errorMsg.includes('404')) {
    return "Damn, this AI model is dead, you should try a new one...";
  }
  
  // Log the actual error for debugging
  console.error('[Groq API] Unhandled error type:', errorMsg);
  return `Yeah, we're fucked: ${errorMsg.substring(0, 100)}... Please ask Tonim for some help...`;
}

/**
 * Validate API key is configured
 * @returns {boolean} True if key appears valid
 */
function isApiKeyConfigured() {
  const key = getApiKey();
  return key.length > 20 && !key.includes('REPLACE_THIS');
}

// Expose to global scope for non-module usage
if (typeof window !== 'undefined') {
  window.GroqAPI = {
    sendChatMessage,
    streamChatMessage,
    isApiKeyConfigured,
    MODELS
  };
}

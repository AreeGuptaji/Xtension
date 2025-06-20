// X Reply Assistant - Background Service Worker
// Handles OpenAI API integration and message processing

// API Configuration
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-3.5-turbo';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // milliseconds

class XReplyAssistantBackground {
  constructor() {
    this.apiKey = null;
    this.requestCount = 0;
    this.lastRequestTime = 0;
    this.rateLimitDelay = 1000; // 1 second between requests
    this.init();
  }

  init() {
    console.log('X Reply Assistant Background: Initializing...');
    this.setupMessageHandlers();
    this.loadApiKey();
  }

  setupMessageHandlers() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'generateResponse') {
        this.handleGenerateResponse(request, sender, sendResponse);
        return true; // Keep the message channel open for async response
      } else if (request.action === 'setApiKey') {
        this.handleSetApiKey(request, sendResponse);
        return true;
      } else if (request.action === 'getApiKey') {
        this.handleGetApiKey(sendResponse);
        return true;
      }
    });
  }

  async loadApiKey() {
    try {
      const result = await chrome.storage.secure.get(['openaiApiKey']);
      this.apiKey = result.openaiApiKey;
    } catch (error) {
      // Fallback to regular storage if secure storage is not available
      try {
        const result = await chrome.storage.local.get(['openaiApiKey']);
        this.apiKey = result.openaiApiKey;
      } catch (fallbackError) {
        console.error('Error loading API key:', fallbackError);
      }
    }
  }

  async handleSetApiKey(request, sendResponse) {
    try {
      this.apiKey = request.apiKey;
      await chrome.storage.secure.set({ openaiApiKey: request.apiKey });
      sendResponse({ success: true });
    } catch (error) {
      // Fallback to regular storage
      try {
        await chrome.storage.local.set({ openaiApiKey: request.apiKey });
        sendResponse({ success: true });
      } catch (fallbackError) {
        console.error('Error saving API key:', fallbackError);
        sendResponse({ success: false, error: 'Failed to save API key' });
      }
    }
  }

  async handleGetApiKey(sendResponse) {
    await this.loadApiKey();
    sendResponse({ success: true, apiKey: this.apiKey });
  }

  async handleGenerateResponse(request, sender, sendResponse) {
    const { tweetText, responseType } = request;

    if (!this.apiKey) {
      sendResponse({
        success: false,
        error: 'OpenAI API key not configured. Please set it in the extension popup.'
      });
      return;
    }

    if (!tweetText || !responseType) {
      sendResponse({
        success: false,
        error: 'Missing required parameters'
      });
      return;
    }

    try {
      // Rate limiting
      await this.enforceRateLimit();

      const response = await this.generateResponseWithRetry(tweetText, responseType);
      sendResponse({ success: true, content: response });
    } catch (error) {
      console.error('Error generating response:', error);
      sendResponse({
        success: false,
        error: this.getErrorMessage(error)
      });
    }
  }

  async enforceRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
    
    this.lastRequestTime = Date.now();
    this.requestCount++;
  }

  async generateResponseWithRetry(tweetText, responseType, retryCount = 0) {
    try {
      return await this.generateResponse(tweetText, responseType);
    } catch (error) {
      if (retryCount < MAX_RETRIES && this.isRetryableError(error)) {
        console.log(`Retrying API call (${retryCount + 1}/${MAX_RETRIES})...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
        return this.generateResponseWithRetry(tweetText, responseType, retryCount + 1);
      }
      throw error;
    }
  }

  async generateResponse(tweetText, responseType) {
    const prompt = this.buildPrompt(tweetText, responseType);
    
    const requestBody = {
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content: this.getSystemPrompt(responseType)
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    };

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('No response generated');
    }

    const generatedText = data.choices[0].message.content.trim();
    return this.postProcessResponse(generatedText);
  }

  getSystemPrompt(responseType) {
    const basePrompt = `You are an AI assistant that helps generate appropriate responses to tweets on X (Twitter). 
Generate responses that are respectful, engaging, and follow Twitter's community guidelines.
Keep responses under 280 characters.`;

    const typeSpecificPrompts = {
      casual: `${basePrompt}
Generate casual, friendly responses. Use a conversational tone, emojis where appropriate, and be relatable. 
The response should feel like it's from a friend or peer.`,
      
      professional: `${basePrompt}
Generate professional, business-appropriate responses. Use formal language, be respectful and constructive.
The response should be suitable for a professional networking context.`,
      
      question: `${basePrompt}
Generate thoughtful follow-up questions that encourage further discussion. 
Ask questions that show genuine interest and help continue the conversation meaningfully.`
    };

    return typeSpecificPrompts[responseType] || typeSpecificPrompts.casual;
  }

  buildPrompt(tweetText, responseType) {
    const sanitizedTweet = this.sanitizeInput(tweetText);
    
    const prompts = {
      casual: `Generate a casual, friendly response to this tweet: "${sanitizedTweet}"`,
      professional: `Generate a professional, business-appropriate response to this tweet: "${sanitizedTweet}"`,
      question: `Generate a thoughtful follow-up question to this tweet: "${sanitizedTweet}"`
    };

    return prompts[responseType] || prompts.casual;
  }

  sanitizeInput(text) {
    // Remove potentially harmful content and normalize text
    return text
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/data:/gi, '') // Remove data: protocols
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim()
      .substring(0, 1000); // Limit length
  }

  postProcessResponse(response) {
    // Clean and validate the generated response
    let cleaned = response
      .replace(/^["']|["']$/g, '') // Remove surrounding quotes
      .replace(/\n\s*\n/g, '\n') // Normalize line breaks
      .trim();

    // Ensure it's not too long
    if (cleaned.length > 280) {
      cleaned = cleaned.substring(0, 277) + '...';
    }

    // Basic content filtering
    if (this.containsInappropriateContent(cleaned)) {
      throw new Error('Generated content failed safety check');
    }

    return cleaned;
  }

  containsInappropriateContent(text) {
    // Basic content filtering (extend as needed)
    const inappropriatePatterns = [
      /\b(hate|offensive|inappropriate)\b/i,
      // Add more patterns as needed
    ];

    return inappropriatePatterns.some(pattern => pattern.test(text));
  }

  isRetryableError(error) {
    const message = error.message.toLowerCase();
    
    // Retry on rate limits, temporary server errors, network issues
    return (
      message.includes('rate limit') ||
      message.includes('429') ||
      message.includes('500') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504') ||
      message.includes('network') ||
      message.includes('timeout')
    );
  }

  getErrorMessage(error) {
    const message = error.message;
    
    if (message.includes('401')) {
      return 'Invalid API key. Please check your OpenAI API key.';
    } else if (message.includes('429')) {
      return 'Rate limit exceeded. Please wait a moment and try again.';
    } else if (message.includes('quota')) {
      return 'API quota exceeded. Please check your OpenAI account billing.';
    } else if (message.includes('network') || message.includes('fetch')) {
      return 'Network error. Please check your internet connection.';
    } else if (message.includes('safety check')) {
      return 'Generated content was filtered for safety. Please try again.';
    } else {
      return `Error: ${message}`;
    }
  }
}

// Initialize the background service
new XReplyAssistantBackground();
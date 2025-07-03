/**
 * Claude API Service
 * This is a mock implementation for testing purposes
 */

export interface ClaudeAPIOptions {
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export class ClaudeAPI {
  private options: ClaudeAPIOptions;
  
  constructor(options: ClaudeAPIOptions = {}) {
    this.options = {
      apiKey: options.apiKey || process.env.CLAUDE_API_KEY,
      model: options.model || 'claude-3-opus-20240229',
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 4096
    };
  }
  
  async sendMessage(message: string, context?: any): Promise<string> {
    // Mock implementation for testing
    return `Response to: ${message}`;
  }
  
  async complete(prompt: string, options?: any): Promise<string> {
    // Mock implementation for testing
    return `Completion for: ${prompt}`;
  }
  
  async stream(prompt: string, onChunk: (chunk: string) => void): Promise<void> {
    // Mock implementation for testing
    const chunks = ['Chunk 1', 'Chunk 2', 'Chunk 3'];
    for (const chunk of chunks) {
      onChunk(chunk);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
}

export const claudeAPI = new ClaudeAPI();
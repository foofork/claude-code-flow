/**
 * Type declarations for various modules used in Claude-Flow
 */

// p-queue module
declare module 'p-queue' {
  export interface Options {
    concurrency?: number;
    timeout?: number;
    throwOnTimeout?: boolean;
    autoStart?: boolean;
    queueClass?: new () => any;
    intervalCap?: number;
    interval?: number;
    carryoverConcurrencyCount?: boolean;
  }

  export interface QueueAddOptions {
    priority?: number;
    signal?: AbortSignal;
  }

  export default class PQueue {
    constructor(options?: Options);
    
    size: number;
    pending: number;
    isPaused: boolean;
    
    add<T>(fn: () => Promise<T>, options?: QueueAddOptions): Promise<T>;
    addAll<T>(fns: Array<() => Promise<T>>, options?: QueueAddOptions): Promise<T[]>;
    start(): this;
    pause(): void;
    clear(): void;
    onEmpty(): Promise<void>;
    onIdle(): Promise<void>;
    onSizeLessThan(limit: number): Promise<void>;
    
    static readonly default: typeof PQueue;
  }
}

// npm:chalk module (Deno-style import)
declare module 'npm:chalk@^4.1.2' {
  import chalk from 'chalk';
  export = chalk;
}

// Missing internal modules
declare module '../logger' {
  export const logger: {
    info(message: string, context?: any): void;
    warn(message: string, context?: any): void;
    error(message: string, error?: Error | any, context?: any): void;
    success(message: string, context?: any): void;
    debug(message: string, context?: any): void;
  };
}

declare module '../../services/claude/api.js' {
  export interface ClaudeAPIOptions {
    apiKey?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
  }

  export class ClaudeAPI {
    constructor(options?: ClaudeAPIOptions);
    
    async sendMessage(message: string, context?: any): Promise<string>;
    async complete(prompt: string, options?: any): Promise<string>;
    async stream(prompt: string, onChunk: (chunk: string) => void): Promise<void>;
  }

  export const claudeAPI: ClaudeAPI;
}
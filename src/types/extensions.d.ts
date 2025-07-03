/**
 * Interface extensions and property augmentations for Claude-Flow
 */

import { AgentState, TaskDefinition } from '../swarm/types';

// Extend AgentState interface
declare module '../swarm/types' {
  interface AgentState {
    workStealer?: any;
    circuitBreaker?: any;
    metadata?: {
      remember?: Record<string, any>;
      credibilityScores?: Record<string, number>;
      cacheHits?: number;
      lastAccessed?: Date;
      [key: string]: any;
    };
  }

  interface TaskDefinition {
    prompt?: string;
    execute?: (context: any) => Promise<any>;
    code?: string;
  }
}

// Global augmentations
declare global {
  interface Error {
    code?: string | number;
  }
}

export {};
/**
 * Centralized event type definitions for the event bus
 * This helps resolve TS18046 errors by providing proper typing for event data
 */

import { AgentMetrics, SwarmMetrics, SystemMetrics } from '../swarm/types.js';

/**
 * Agent-related events
 */
export interface AgentEvents {
  'agent:heartbeat': {
    agentId: string;
    timestamp: Date;
    metrics?: AgentMetrics;
  };
  'agent:error': {
    agentId: string;
    error: Error;
  };
  'agent:ready': {
    agentId: string;
  };
  'agent:timeout': {
    agentId: string;
  };
  'agent:metrics-update': {
    agentId: string;
    metrics: AgentMetrics;
  };
  'agent:status-changed': {
    agentId: string;
    from: string;
    to: string;
  };
}

/**
 * Task-related events
 */
export interface TaskEvents {
  'task:assigned': {
    agentId: string;
    taskId: string;
  };
  'task:started': {
    taskId: string;
    agentId: string;
  };
  'task:completed': {
    agentId: string;
    taskId: string;
    duration: number;
    metrics?: any;
  };
  'task:failed': {
    taskId: string;
    error: string;
  };
}

/**
 * Resource-related events
 */
export interface ResourceEvents {
  'resource:usage': {
    agentId: string;
    usage: {
      cpu: number;
      memory: number;
      disk: number;
    };
  };
}

/**
 * System-related events
 */
export interface SystemEvents {
  'system:resource-update': SystemMetrics;
  'swarm:metrics-update': {
    metrics: SwarmMetrics;
  };
}

/**
 * Combined event map for type safety
 */
export interface EventMap extends AgentEvents, TaskEvents, ResourceEvents, SystemEvents {
  // Additional events can be added here
}

/**
 * Type helper to extract event data type by event name
 */
export type EventData<T extends keyof EventMap> = EventMap[T];

/**
 * Type-safe event handler type
 */
export type EventHandler<T extends keyof EventMap> = (data: EventData<T>) => void | Promise<void>;

/**
 * Generic unknown event handler for backwards compatibility
 */
export type UnknownEventHandler = (data: unknown) => void | Promise<void>;
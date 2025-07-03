/**
 * Extensions to swarm types
 */

import { LoadBalancer } from '../swarm/load-balancer';
import { CircuitBreaker } from '../swarm/circuit-breaker';

// Extend SwarmCoordinator interface
declare module '../swarm/coordinator' {
  interface SwarmCoordinator {
    workStealer?: LoadBalancer;
    circuitBreaker?: CircuitBreaker;
  }
}

// Additional swarm status properties
export interface ExtendedSwarmStatus {
  status: any;
  objectives: number;
  tasks: {
    completed: number;
    failed: number;
    total: number;
    inProgress?: number;
    pending?: number;
  };
  agents: {
    total: number;
    active?: number;
  };
}
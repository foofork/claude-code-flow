/**
 * Swarm Optimizations
 * Export all optimization components
 */

export { ClaudeConnectionPool } from './connection-pool.js';
export type { PoolConfig, PooledConnection } from './connection-pool.js';

export { AsyncFileManager } from './async-file-manager.js';
export type { FileOperationResult } from './async-file-manager.js';

export { CircularBuffer } from './circular-buffer.js';

export { TTLMap } from './ttl-map.js';
export type { TTLMapOptions } from './ttl-map.js';

export { OptimizedExecutor } from './optimized-executor.js';
export type { ExecutorConfig, ExecutionMetrics } from './optimized-executor.js';

// Re-export commonly used together
export const createOptimizedSwarmStack = async (config?: {
  connectionPool?: any;
  executor?: any;
  fileManager?: any;
}) => {
  // Dynamically import classes to avoid circular dependencies
  const { ClaudeConnectionPool: ConnectionPoolClass } = await import('./connection-pool.js');
  const { AsyncFileManager: FileManagerClass } = await import('./async-file-manager.js');
  const { OptimizedExecutor: ExecutorClass } = await import('./optimized-executor.js');
  
  const connectionPool = new ConnectionPoolClass(config?.connectionPool);
  const fileManager = new FileManagerClass(config?.fileManager);
  const executor = new ExecutorClass({
    ...config?.executor,
    connectionPool: config?.connectionPool,
    fileOperations: config?.fileManager
  });
  
  return {
    connectionPool,
    fileManager,
    executor,
    shutdown: async () => {
      await executor.shutdown();
      await fileManager.waitForPendingOperations();
      await connectionPool.drain();
    }
  };
};
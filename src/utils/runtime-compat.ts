/**
 * Runtime compatibility layer for Deno and Node.js
 * This provides a unified API that works in both environments
 */

import { promises as fs } from 'node:fs';
import { join, resolve } from 'node:path';
import process from 'node:process';

/**
 * Check if we're running in Deno
 */
export const isDeno = typeof (globalThis as any).Deno !== 'undefined';

/**
 * Runtime-agnostic file operations
 */
export const runtime = {
  /**
   * Read a text file
   */
  async readTextFile(path: string): Promise<string> {
    if (isDeno) {
      return (globalThis as any).Deno.readTextFile(path);
    } else {
      return fs.readFile(path, 'utf-8');
    }
  },

  /**
   * Write a text file
   */
  async writeTextFile(path: string, content: string): Promise<void> {
    if (isDeno) {
      return (globalThis as any).Deno.writeTextFile(path, content);
    } else {
      return fs.writeFile(path, content, 'utf-8');
    }
  },

  /**
   * Read a binary file
   */
  async readFile(path: string): Promise<Uint8Array> {
    if (isDeno) {
      return (globalThis as any).Deno.readFile(path);
    } else {
      const buffer = await fs.readFile(path);
      return new Uint8Array(buffer);
    }
  },

  /**
   * Write a binary file
   */
  async writeFile(path: string, data: Uint8Array): Promise<void> {
    if (isDeno) {
      return (globalThis as any).Deno.writeFile(path, data);
    } else {
      return fs.writeFile(path, Buffer.from(data));
    }
  },

  /**
   * Remove a file or directory
   */
  async remove(path: string, options?: { recursive?: boolean }): Promise<void> {
    if (isDeno) {
      return (globalThis as any).Deno.remove(path, options);
    } else {
      return fs.rm(path, { recursive: options?.recursive, force: true });
    }
  },

  /**
   * Create a directory
   */
  async mkdir(path: string, options?: { recursive?: boolean }): Promise<void> {
    if (isDeno) {
      return (globalThis as any).Deno.mkdir(path, options);
    } else {
      await fs.mkdir(path, { recursive: options?.recursive });
    }
  },

  /**
   * Get file/directory information
   */
  async stat(path: string): Promise<any> {
    if (isDeno) {
      return (globalThis as any).Deno.stat(path);
    } else {
      const stats = await fs.stat(path);
      return {
        isFile: stats.isFile(),
        isDirectory: stats.isDirectory(),
        isSymlink: stats.isSymbolicLink(),
        size: stats.size,
        mtime: stats.mtime,
        atime: stats.atime,
        birthtime: stats.birthtime,
        mode: stats.mode,
        uid: stats.uid,
        gid: stats.gid
      };
    }
  },

  /**
   * Environment variables
   */
  env: {
    get(key: string): string | undefined {
      if (isDeno) {
        return (globalThis as any).Deno.env.get(key);
      } else {
        return process.env[key];
      }
    },

    set(key: string, value: string): void {
      if (isDeno) {
        (globalThis as any).Deno.env.set(key, value);
      } else {
        process.env[key] = value;
      }
    },

    delete(key: string): void {
      if (isDeno) {
        (globalThis as any).Deno.env.delete(key);
      } else {
        delete process.env[key];
      }
    },

    toObject(): { [key: string]: string } {
      if (isDeno) {
        return (globalThis as any).Deno.env.toObject();
      } else {
        return { ...process.env } as { [key: string]: string };
      }
    }
  },

  /**
   * Command line arguments
   */
  get args(): string[] {
    if (isDeno) {
      return (globalThis as any).Deno.args;
    } else {
      return process.argv.slice(2);
    }
  },

  /**
   * Process ID
   */
  get pid(): number {
    if (isDeno) {
      return (globalThis as any).Deno.pid;
    } else {
      return process.pid;
    }
  },

  /**
   * Exit the process
   */
  exit(code?: number): never {
    if (isDeno) {
      (globalThis as any).Deno.exit(code);
    } else {
      process.exit(code);
    }
    // TypeScript requires a throw or return for 'never' type
    throw new Error('Process should have exited');
  },

  /**
   * Get current working directory
   */
  cwd(): string {
    if (isDeno) {
      return (globalThis as any).Deno.cwd();
    } else {
      return process.cwd();
    }
  },

  /**
   * Change working directory
   */
  chdir(directory: string): void {
    if (isDeno) {
      (globalThis as any).Deno.chdir(directory);
    } else {
      process.chdir(directory);
    }
  },

  /**
   * Get memory usage
   */
  memoryUsage(): any {
    if (isDeno) {
      return (globalThis as any).Deno.memoryUsage();
    } else {
      const usage = process.memoryUsage();
      return {
        rss: usage.rss,
        heapTotal: usage.heapTotal,
        heapUsed: usage.heapUsed,
        external: usage.external
      };
    }
  }
};

/**
 * Export as default for convenience
 */
export default runtime;
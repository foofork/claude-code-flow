/**
 * Global type definitions for Claude-Flow
 * This file resolves TS2304 "Cannot find name" errors
 */

/**
 * Deno namespace for Deno runtime compatibility
 * This resolves 186 TS2304 errors
 */
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): { [key: string]: string };
  }

  export const env: Env;
  export const args: string[];
  export const pid: number;
  export const version: {
    deno: string;
    v8: string;
    typescript: string;
  };

  export interface RunOptions {
    cmd: string[];
    cwd?: string;
    env?: { [key: string]: string };
    stdout?: "piped" | "inherit" | "null";
    stderr?: "piped" | "inherit" | "null";
    stdin?: "piped" | "inherit" | "null";
  }

  export function run(opt: RunOptions): Process;

  export interface Process {
    pid: number;
    rid: number;
    stdin?: Writer;
    stdout?: Reader;
    stderr?: Reader;
    status(): Promise<ProcessStatus>;
    output(): Promise<Uint8Array>;
    stderrOutput(): Promise<Uint8Array>;
    close(): void;
    kill(signo: number): void;
  }

  export interface ProcessStatus {
    success: boolean;
    code: number;
    signal?: number;
  }

  export interface Reader {
    read(p: Uint8Array): Promise<number | null>;
  }

  export interface Writer {
    write(p: Uint8Array): Promise<number>;
  }

  export function exit(code?: number): never;
  export function execPath(): string;
  export function cwd(): string;
  export function chdir(directory: string): void;

  export interface MemoryUsage {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  }

  export function memoryUsage(): MemoryUsage;

  export interface Permissions {
    query(desc: PermissionDescriptor): Promise<PermissionStatus>;
    request(desc: PermissionDescriptor): Promise<PermissionStatus>;
    revoke(desc: PermissionDescriptor): Promise<PermissionStatus>;
  }

  export const permissions: Permissions;

  export interface PermissionDescriptor {
    name: string;
    path?: string;
    host?: string;
  }

  export interface PermissionStatus {
    state: "granted" | "denied" | "prompt";
  }

  export function readTextFile(path: string): Promise<string>;
  export function writeTextFile(path: string, data: string): Promise<void>;
  export function readFile(path: string): Promise<Uint8Array>;
  export function writeFile(path: string, data: Uint8Array): Promise<void>;
  export function remove(path: string, options?: { recursive?: boolean }): Promise<void>;
  export function mkdir(path: string, options?: { recursive?: boolean }): Promise<void>;
  export function stat(path: string): Promise<FileInfo>;

  export interface FileInfo {
    isFile: boolean;
    isDirectory: boolean;
    isSymlink: boolean;
    size: number;
    mtime: Date | null;
    atime: Date | null;
    birthtime: Date | null;
    dev: number | null;
    ino: number | null;
    mode: number | null;
    nlink: number | null;
    uid: number | null;
    gid: number | null;
    rdev: number | null;
    blksize: number | null;
    blocks: number | null;
  }
}

/**
 * Missing library types
 */
declare module '@cliffy/table' {
  export class Table {
    static from(data: any[][]): Table;
    header(headers: string[]): Table;
    body(rows: any[][]): Table;
    render(): void;
    toString(): string;
  }
}

declare module '@cliffy/ansi/colors' {
  export const colors: {
    red: (text: string) => string;
    green: (text: string) => string;
    blue: (text: string) => string;
    yellow: (text: string) => string;
    cyan: (text: string) => string;
    magenta: (text: string) => string;
    white: (text: string) => string;
    gray: (text: string) => string;
    dim: (text: string) => string;
    bold: (text: string) => string;
    reset: string;
  };
}

declare module '@cliffy/prompt' {
  export interface PromptOptions {
    message: string;
    default?: any;
    min?: number;
    max?: number;
    options?: any[];
  }

  export class Select {
    static prompt(options: PromptOptions): Promise<string>;
  }

  export class Input {
    static prompt(options: PromptOptions): Promise<string>;
  }

  export class Number {
    static prompt(options: PromptOptions): Promise<number>;
  }

  export class Confirm {
    static prompt(options: PromptOptions): Promise<boolean>;
  }
}

/**
 * Global function declarations
 */
declare function existsSync(path: string): boolean;

/**
 * MCP-related types
 */
declare class MCPServer {
  constructor(config?: any);
  start(): Promise<void>;
  stop(): Promise<void>;
}

declare class MCPProtocolManager {
  constructor(server: MCPServer);
}

declare class MCPLifecycleManager {
  constructor(server: MCPServer);
}

declare class MCPPerformanceMonitor {
  constructor(server: MCPServer);
}

declare class MCPOrchestrationIntegration {
  constructor(config: any);
}

declare interface MCPOrchestrationConfig {
  [key: string]: any;
}

declare interface ComponentStatus {
  name: string;
  status: string;
  health: number;
}

declare interface OrchestrationComponents {
  [key: string]: any;
}

declare class ClaudeConnectionPool {
  constructor(config?: any);
}

declare class OptimizedExecutor {
  constructor(config?: any);
}

declare class AsyncFileManager {
  constructor(config?: any);
}

/**
 * Command type for commander.js
 */
declare interface Command {
  name(name: string): Command;
  version(version: string): Command;
  description(desc: string): Command;
  option(flags: string, description?: string, defaultValue?: any): Command;
  action(fn: (...args: any[]) => void | Promise<void>): Command;
  command(nameAndArgs: string): Command;
  addCommand(cmd: Command): Command;
  parse(argv?: string[]): Command;
  showHelp(): void;
}

/**
 * Message type
 */
declare interface Message {
  id: string;
  content: string;
  timestamp: Date;
  [key: string]: any;
}

/**
 * Additional global variables
 */
declare const baseStatus: any;
declare const options: any;

/**
 * Extend existing Node.js global types if needed
 */
declare global {
  namespace NodeJS {
    interface Global {
      Deno?: typeof Deno;
    }
  }
  
  /**
   * ImportMeta interface for Deno compatibility
   */
  interface ImportMeta {
    main?: boolean;
    url: string;
  }
}

export {};
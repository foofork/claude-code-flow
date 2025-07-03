/**
 * Ambient type declarations for Claude-Flow
 * This file provides global type definitions available throughout the project
 */

/// <reference path="./global.d.ts" />

/**
 * Make Deno available globally for TypeScript
 * This resolves "Cannot find name 'Deno'" errors
 */
declare const Deno: typeof import('./global').Deno;

/**
 * Global variables
 */
declare const colors: any;
declare const baseStatus: any;
declare const options: any;

/**
 * Node.js compatibility
 */
declare function existsSync(path: string): boolean;
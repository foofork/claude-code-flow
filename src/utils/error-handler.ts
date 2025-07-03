/**
 * Global error handling utilities to resolve TypeScript unknown error types
 * This solves TS18046: "'error' is of type 'unknown'" errors throughout the codebase
 */

/**
 * Type guard to check if a value is an Error instance
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

/**
 * Type guard to check if a value has a message property
 */
export function hasMessage(error: unknown): error is { message: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
}

/**
 * Type guard to check if a value has a code property
 */
export function hasCode(error: unknown): error is { code: string | number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error
  );
}

/**
 * Safely extracts an error message from an unknown error type
 * @param error - The error of unknown type
 * @param fallbackMessage - Optional fallback message if no message can be extracted
 * @returns A string error message
 */
export function getErrorMessage(error: unknown, fallbackMessage = 'An unknown error occurred'): string {
  if (isError(error)) {
    return error.message;
  }
  
  if (hasMessage(error)) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error === null || error === undefined) {
    return fallbackMessage;
  }
  
  // Try to convert to string as last resort
  try {
    return String(error);
  } catch {
    return fallbackMessage;
  }
}

/**
 * Safely extracts an error code from an unknown error type
 * @param error - The error of unknown type
 * @returns The error code if available, undefined otherwise
 */
export function getErrorCode(error: unknown): string | number | undefined {
  if (hasCode(error)) {
    return error.code;
  }
  
  if (isError(error) && 'code' in error) {
    return (error as any).code;
  }
  
  return undefined;
}

/**
 * Safely extracts a stack trace from an unknown error type
 * @param error - The error of unknown type
 * @returns The stack trace if available, undefined otherwise
 */
export function getErrorStack(error: unknown): string | undefined {
  if (isError(error)) {
    return error.stack;
  }
  
  if (typeof error === 'object' && error !== null && 'stack' in error) {
    const stack = (error as any).stack;
    if (typeof stack === 'string') {
      return stack;
    }
  }
  
  return undefined;
}

/**
 * Converts an unknown error into a proper Error instance
 * @param error - The error of unknown type
 * @param context - Optional context to add to the error message
 * @returns A proper Error instance
 */
export function toError(error: unknown, context?: string): Error {
  if (isError(error)) {
    return context ? new Error(`${context}: ${error.message}`) : error;
  }
  
  const message = getErrorMessage(error);
  const fullMessage = context ? `${context}: ${message}` : message;
  
  const errorInstance = new Error(fullMessage);
  
  // Preserve original error code if available
  const code = getErrorCode(error);
  if (code !== undefined) {
    (errorInstance as any).code = code;
  }
  
  // Preserve original error object as cause (ES2022 feature)
  if (error !== null && error !== undefined && typeof error === 'object') {
    (errorInstance as any).cause = error;
  }
  
  return errorInstance;
}

/**
 * Handles an error by logging it and optionally re-throwing
 * @param error - The error of unknown type
 * @param options - Handler options
 */
export function handleError(
  error: unknown,
  options: {
    context?: string;
    logger?: (message: string, error?: unknown) => void;
    rethrow?: boolean;
    fallbackMessage?: string;
  } = {}
): void {
  const { context, logger, rethrow = false, fallbackMessage } = options;
  
  const errorMessage = getErrorMessage(error, fallbackMessage);
  const fullMessage = context ? `${context}: ${errorMessage}` : errorMessage;
  
  if (logger) {
    logger(fullMessage, error);
  } else {
    console.error(fullMessage, error);
  }
  
  if (rethrow) {
    throw toError(error, context);
  }
}

/**
 * Type-safe error handler for catch blocks
 * Usage: 
 *   try { ... } catch (err) { 
 *     handleCatchError(err, { context: 'Failed to process' }); 
 *   }
 */
export function handleCatchError(
  error: unknown,
  options: {
    context?: string;
    logger?: (message: string, error?: unknown) => void;
    fallbackMessage?: string;
  } = {}
): string {
  const errorMessage = getErrorMessage(error, options.fallbackMessage);
  const fullMessage = options.context ? `${options.context}: ${errorMessage}` : errorMessage;
  
  if (options.logger) {
    options.logger(fullMessage, error);
  }
  
  return fullMessage;
}

/**
 * Export all utilities as a namespace for easier imports
 */
export const ErrorHandler = {
  isError,
  hasMessage,
  hasCode,
  getMessage: getErrorMessage,
  getCode: getErrorCode,
  getStack: getErrorStack,
  toError,
  handle: handleError,
  handleCatch: handleCatchError,
} as const;
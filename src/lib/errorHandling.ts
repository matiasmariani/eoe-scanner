/**
 * Error handling utilities for the application
 */

export interface AppErrorInfo {
  message: string;
  code?: string;
  isPermissionError?: boolean;
}

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public isPermissionError?: boolean,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Creates a user-friendly error message
 */
export function createUserErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
}

/**
 * Logs errors to console with context. In production, forwards to Sentry.
 */
export function logError(context: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[${context}]`, error);
  }

  if (
    process.env.NODE_ENV === 'production' &&
    process.env.NEXT_PUBLIC_SENTRY_DSN
  ) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const sentry = require('@sentry/nextjs');
      sentry.setTag('context', context);
      sentry.captureException(error);
    } catch {
      // Sentry may not be configured — silently fall back to console
      console.error(`[${context}]`, error);
    }
  }
}

/**
 * Alias for logError
 */
export const logErrorWithMessage = logError;

/**
 * Handles API errors
 */
export function handleApiError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message);
  }

  return new AppError('An unexpected error occurred');
}

/**
 * Validates barcode input
 */
export function validateBarcode(barcode: string): {
  valid: boolean;
  error?: string;
} {
  if (!barcode || barcode.trim() === '') {
    return { valid: false, error: 'Please enter a barcode' };
  }

  if (barcode.length < 8) {
    return { valid: false, error: 'Barcode is too short' };
  }

  if (barcode.length > 13) {
    return { valid: false, error: 'Barcode is too long' };
  }

  return { valid: true };
}

import * as Sentry from '@sentry/nextjs';

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
    Object.setPrototypeOf(this, AppError.prototype);
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

  if (process.env.NODE_ENV === 'production') {
    try {
      // Scope the tag to THIS event only — Sentry.setTag() sets a global tag
      // that would leak onto every subsequent event on the shared scope.
      Sentry.captureException(error, { tags: { context } });
    } catch {
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
  const trimmed = barcode.trim();

  if (trimmed === '') {
    return { valid: false, error: 'Please enter a barcode' };
  }

  if (!/^\d+$/.test(trimmed)) {
    return { valid: false, error: 'Barcode should be numbers only' };
  }

  if (trimmed.length < 8) {
    return { valid: false, error: 'Barcode is too short' };
  }

  // EAN/UPC/GTIN codes are at most 14 digits.
  if (trimmed.length > 14) {
    return { valid: false, error: 'Barcode is too long' };
  }

  return { valid: true };
}

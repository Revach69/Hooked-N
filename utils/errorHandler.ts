import { AppError, ToastConfig } from '../types';
import { logger } from './logger';
import toast from '../lib/toast';

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorCount: Map<string, number> = new Map();
  private readonly MAX_ERRORS_PER_MINUTE = 10;

  private constructor() {}

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle application errors with proper logging and user feedback
   */
  handleError(
    error: unknown,
    context: string,
    userMessage?: string,
    showToast: boolean = true
  ): AppError {
    const appError = this.createAppError(error, context);
    
    // Log the error
    logger.error(`[${context}] ${appError.message}`, appError);
    
    // Rate limiting for error notifications
    if (this.shouldShowErrorNotification(context)) {
      this.incrementErrorCount(context);
      
      if (showToast) {
        const toastMessage = userMessage || this.getDefaultErrorMessage(context);
        this.showErrorToast(toastMessage);
      }
    }

    return appError;
  }

  /**
   * Handle async operation errors
   */
  async handleAsyncError<T>(
    operation: () => Promise<T>,
    context: string,
    userMessage?: string,
    showToast: boolean = true
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      this.handleError(error, context, userMessage, showToast);
      return null;
    }
  }

  /**
   * Handle Firebase-specific errors
   */
  handleFirebaseError(
    error: unknown,
    operation: string,
    userMessage?: string
  ): AppError {
    const context = `Firebase:${operation}`;
    const defaultMessage = `Failed to ${operation.toLowerCase()}. Please try again.`;
    
    return this.handleError(error, context, userMessage || defaultMessage);
  }

  /**
   * Handle API errors
   */
  handleApiError(
    error: unknown,
    endpoint: string,
    userMessage?: string
  ): AppError {
    const context = `API:${endpoint}`;
    const defaultMessage = 'Network error. Please check your connection and try again.';
    
    return this.handleError(error, context, userMessage || defaultMessage);
  }

  /**
   * Handle validation errors
   */
  handleValidationError(
    errors: string[],
    context: string,
    userMessage?: string
  ): AppError {
    const error = new Error(`Validation failed: ${errors.join(', ')}`);
    const defaultMessage = 'Please check your input and try again.';
    
    return this.handleError(error, context, userMessage || defaultMessage);
  }

  /**
   * Handle permission errors
   */
  handlePermissionError(
    permission: string,
    userMessage?: string
  ): AppError {
    const context = `Permission:${permission}`;
    const defaultMessage = `Permission denied for ${permission}. Please enable it in settings.`;
    
    const error = new Error(`Permission denied: ${permission}`);
    return this.handleError(error, context, userMessage || defaultMessage);
  }

  /**
   * Create a standardized AppError object
   */
  private createAppError(error: unknown, context: string): AppError {
    let message: string;
    let details: unknown;

    if (error instanceof Error) {
      message = error.message;
      details = {
        name: error.name,
        stack: error.stack,
        context
      };
    } else if (typeof error === 'string') {
      message = error;
      details = { context };
    } else {
      message = 'An unknown error occurred';
      details = { error, context };
    }

    return {
      code: this.generateErrorCode(context),
      message,
      details,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Generate a unique error code based on context
   */
  private generateErrorCode(context: string): string {
    const timestamp = Date.now().toString(36);
    const contextHash = context.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8);
    return `ERR_${contextHash}_${timestamp}`;
  }

  /**
   * Check if we should show error notification (rate limiting)
   */
  private shouldShowErrorNotification(context: string): boolean {
    const count = this.errorCount.get(context) || 0;
    return count < this.MAX_ERRORS_PER_MINUTE;
  }

  /**
   * Increment error count for rate limiting
   */
  private incrementErrorCount(context: string): void {
    const currentCount = this.errorCount.get(context) || 0;
    this.errorCount.set(context, currentCount + 1);
    
    // Reset count after 1 minute
    setTimeout(() => {
      const count = this.errorCount.get(context) || 0;
      if (count > 0) {
        this.errorCount.set(context, count - 1);
      }
    }, 60000);
  }

  /**
   * Show error toast notification
   */
  private showErrorToast(message: string): void {
    const toastConfig: ToastConfig = {
      type: 'error',
      text1: 'Error',
      text2: message,
      duration: 4000
    };
    
    toast(toastConfig);
  }

  /**
   * Get default error message based on context
   */
  private getDefaultErrorMessage(context: string): string {
    const contextLower = context.toLowerCase();
    
    if (contextLower.includes('firebase')) {
      return 'Database error. Please try again.';
    }
    
    if (contextLower.includes('api')) {
      return 'Network error. Please check your connection.';
    }
    
    if (contextLower.includes('permission')) {
      return 'Permission denied. Please check your settings.';
    }
    
    if (contextLower.includes('validation')) {
      return 'Invalid input. Please check your data.';
    }
    
    if (contextLower.includes('upload')) {
      return 'Upload failed. Please try again.';
    }
    
    if (contextLower.includes('camera')) {
      return 'Camera access denied. Please enable camera permissions.';
    }
    
    return 'Something went wrong. Please try again.';
  }

  /**
   * Clear error counts (useful for testing)
   */
  clearErrorCounts(): void {
    this.errorCount.clear();
  }

  /**
   * Get current error statistics
   */
  getErrorStats(): Record<string, number> {
    return Object.fromEntries(this.errorCount);
  }
}

// Export singleton instance
export const errorHandler = ErrorHandler.getInstance();

// Convenience functions for common error scenarios
export const handleFirebaseError = (error: unknown, operation: string, userMessage?: string) =>
  errorHandler.handleFirebaseError(error, operation, userMessage);

export const handleApiError = (error: unknown, endpoint: string, userMessage?: string) =>
  errorHandler.handleApiError(error, endpoint, userMessage);

export const handleValidationError = (errors: string[], context: string, userMessage?: string) =>
  errorHandler.handleValidationError(errors, context, userMessage);

export const handlePermissionError = (permission: string, userMessage?: string) =>
  errorHandler.handlePermissionError(permission, userMessage);

export const handleAsyncError = <T>(
  operation: () => Promise<T>,
  context: string,
  userMessage?: string,
  showToast: boolean = true
) => errorHandler.handleAsyncError(operation, context, userMessage, showToast); 
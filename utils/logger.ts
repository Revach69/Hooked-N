// Logging utility to replace console statements
export const logger = {
  error: (message: string, error?: Error | unknown) => {
    if (__DEV__) {
      console.error(message, error);
    }
    // In production, send to error tracking service like Sentry
    // Sentry.captureException(error, { extra: { message } });
  },
  
  warn: (message: string, data?: unknown) => {
    if (__DEV__) {
      console.warn(message, data);
    }
    // In production, log to monitoring service
  },
  
  info: (message: string, data?: unknown) => {
    if (__DEV__) {
      console.log(message, data);
    }
    // In production, log to monitoring service
  },
  
  debug: (message: string, data?: unknown) => {
    if (__DEV__) {
      console.log(`[DEBUG] ${message}`, data);
    }
    // Debug logs only in development
  }
}; 
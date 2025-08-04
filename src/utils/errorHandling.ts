import React from 'react';
import { PostgrestError } from '@supabase/supabase-js';

export interface APIError {
  code: string;
  message: string;
  details?: any;
  recoverable?: boolean;
  retryAfter?: number;
}

export interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  timestamp: string;
  userAgent: string;
  url: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorQueue: Array<{ error: APIError; context: ErrorContext }> = [];
  private isOnline = navigator.onLine;

  private constructor() {
    this.setupOnlineListener();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  private setupOnlineListener() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processErrorQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  public handleSupabaseError(error: PostgrestError, context?: Partial<ErrorContext>): APIError {
    const apiError: APIError = {
      code: error.code || 'SUPABASE_ERROR',
      message: this.getSupabaseErrorMessage(error),
      details: error.details,
      recoverable: this.isSupabaseErrorRecoverable(error),
    };

    this.logError(apiError, {
      component: 'Supabase',
      ...context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    return apiError;
  }

  public handleTavusError(error: any, context?: Partial<ErrorContext>): APIError {
    const apiError: APIError = {
      code: error.code || 'TAVUS_ERROR',
      message: this.getTavusErrorMessage(error),
      details: error,
      recoverable: this.isTavusErrorRecoverable(error),
      retryAfter: error.retryAfter,
    };

    this.logError(apiError, {
      component: 'Tavus',
      ...context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    return apiError;
  }

  public handleNetworkError(error: Error, context?: Partial<ErrorContext>): APIError {
    const apiError: APIError = {
      code: 'NETWORK_ERROR',
      message: this.isOnline 
        ? 'Network request failed. Please check your connection and try again.'
        : 'You appear to be offline. Please check your internet connection.',
      details: error.message,
      recoverable: true,
      retryAfter: this.isOnline ? 1000 : undefined,
    };

    this.logError(apiError, {
      component: 'Network',
      ...context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    return apiError;
  }

  public handleGenericError(error: Error, context?: Partial<ErrorContext>): APIError {
    const apiError: APIError = {
      code: 'GENERIC_ERROR',
      message: 'An unexpected error occurred. Please try again.',
      details: error.message,
      recoverable: true,
    };

    this.logError(apiError, {
      component: 'Generic',
      ...context,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    });

    return apiError;
  }

  private getSupabaseErrorMessage(error: PostgrestError): string {
    switch (error.code) {
      case 'PGRST116':
        return 'No data found. Please check your request and try again.';
      case 'PGRST301':
        return 'You do not have permission to access this resource.';
      case '23505':
        return 'This record already exists. Please use different values.';
      case '23503':
        return 'Cannot complete this action due to related data constraints.';
      case '42501':
        return 'Access denied. Please check your permissions.';
      default:
        return error.message || 'A database error occurred. Please try again.';
    }
  }

  private getTavusErrorMessage(error: any): string {
    if (error.status === 429) {
      return 'Too many requests. Please wait a moment before trying again.';
    }
    if (error.status === 401) {
      return 'Authentication failed. Please refresh the page and try again.';
    }
    if (error.status === 403) {
      return 'Access denied. Please check your permissions.';
    }
    if (error.status >= 500) {
      return 'Tavus service is temporarily unavailable. Please try again later.';
    }
    return error.message || 'Failed to connect to video service. Please try again.';
  }

  private isSupabaseErrorRecoverable(error: PostgrestError): boolean {
    const nonRecoverableCodes = ['PGRST301', '42501', '23505'];
    return !nonRecoverableCodes.includes(error.code || '');
  }

  private isTavusErrorRecoverable(error: any): boolean {
    return error.status !== 401 && error.status !== 403;
  }

  private logError(error: APIError, context: ErrorContext) {
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Handler');
      console.error('Error:', error);
      console.error('Context:', context);
      console.groupEnd();
    }

    // Queue error for later processing if offline
    if (!this.isOnline) {
      this.errorQueue.push({ error, context });
      return;
    }

    // In production, send to error tracking service
    this.sendToErrorService(error, context);
  }

  private async sendToErrorService(error: APIError, context: ErrorContext) {
    try {
      // Example: Send to Sentry, LogRocket, or custom error service
      // await errorTrackingService.captureException(error, context);
      
      // For now, just log to console in production
      if (process.env.NODE_ENV === 'production') {
        console.error('Production Error:', { error, context });
      }
    } catch (serviceError) {
      console.error('Failed to send error to tracking service:', serviceError);
    }
  }

  private processErrorQueue() {
    if (this.errorQueue.length === 0) return;

    const errors = [...this.errorQueue];
    this.errorQueue = [];

    errors.forEach(({ error, context }) => {
      this.sendToErrorService(error, context);
    });
  }

  public getConnectionStatus(): { isOnline: boolean; lastOnline?: Date } {
    return {
      isOnline: this.isOnline,
      lastOnline: this.isOnline ? new Date() : undefined,
    };
  }
}

// Utility functions for common error scenarios
export const handleAsyncError = async <T>(
  asyncFn: () => Promise<T>,
  context?: Partial<ErrorContext>
): Promise<{ data?: T; error?: APIError }> => {
  const errorHandler = ErrorHandler.getInstance();
  
  try {
    const data = await asyncFn();
    return { data };
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return { error: errorHandler.handleNetworkError(error, context) };
      }
      return { error: errorHandler.handleGenericError(error, context) };
    }
    return { 
      error: errorHandler.handleGenericError(
        new Error('Unknown error occurred'), 
        context
      ) 
    };
  }
};

// Hook for using error handler in components
export const useErrorHandler = () => {
  const errorHandler = ErrorHandler.getInstance();
  
  return {
    handleError: (error: any, context?: Partial<ErrorContext>) => {
      if (error?.code) {
        return errorHandler.handleSupabaseError(error, context);
      }
      if (error instanceof Error) {
        return errorHandler.handleGenericError(error, context);
      }
      return errorHandler.handleGenericError(new Error(String(error)), context);
    },
    connectionStatus: errorHandler.getConnectionStatus(),
  };
};
import { useState, useCallback, useRef, useEffect } from 'react';
import { APIError, handleAsyncError } from '../utils/errorHandling';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: APIError | null;
  lastFetch: Date | null;
}

interface AsyncOptions {
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: APIError) => void;
  cacheKey?: string;
  cacheTimeout?: number;
}

export const useAsyncState = <T>(
  initialData: T | null = null,
  options: AsyncOptions = {}
) => {
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
    lastFetch: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const currentRetryCount = useRef(0);

  const {
    retryCount = 3,
    retryDelay = 1000,
    timeout = 10000,
    onSuccess,
    onError,
    cacheKey,
    cacheTimeout = 5 * 60 * 1000, // 5 minutes
  } = options;

  // Cache management
  const getCachedData = useCallback((): { data: T | null; timestamp: Date | null } => {
    if (!cacheKey) return { data: null, timestamp: null };

    try {
      const cached = localStorage.getItem(`async_cache_${cacheKey}`);
      const timestamp = localStorage.getItem(`async_cache_${cacheKey}_timestamp`);
      
      if (cached && timestamp) {
        const cacheTime = new Date(timestamp);
        const isExpired = Date.now() - cacheTime.getTime() > cacheTimeout;
        
        if (!isExpired) {
          return { data: JSON.parse(cached), timestamp: cacheTime };
        }
      }
    } catch (error) {
      console.warn('Failed to read cache:', error);
    }

    return { data: null, timestamp: null };
  }, [cacheKey, cacheTimeout]);

  const setCachedData = useCallback((data: T) => {
    if (!cacheKey) return;

    try {
      localStorage.setItem(`async_cache_${cacheKey}`, JSON.stringify(data));
      localStorage.setItem(`async_cache_${cacheKey}_timestamp`, new Date().toISOString());
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }, [cacheKey]);

  const execute = useCallback(async (
    asyncFn: (signal?: AbortSignal) => Promise<T>,
    options: { skipCache?: boolean; context?: any } = {}
  ): Promise<{ data?: T; error?: APIError }> => {
    // Check cache first
    if (!options.skipCache) {
      const { data: cachedData, timestamp } = getCachedData();
      if (cachedData && timestamp) {
        setState(prev => ({
          ...prev,
          data: cachedData,
          lastFetch: timestamp,
          error: null,
        }));
        return { data: cachedData };
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    // Set loading state
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    currentRetryCount.current = 0;

    const attemptExecution = async (): Promise<{ data?: T; error?: APIError }> => {
      try {
        // Set up timeout
        const timeoutId = setTimeout(() => {
          if (abortControllerRef.current) {
            abortControllerRef.current.abort();
          }
        }, timeout);

        const result = await handleAsyncError(
          () => asyncFn(signal),
          { ...options.context, component: 'useAsyncState' }
        );

        clearTimeout(timeoutId);

        if (result.error) {
          throw result.error;
        }

        const data = result.data!;
        const now = new Date();

        setState({
          data,
          loading: false,
          error: null,
          lastFetch: now,
        });

        // Cache successful result
        setCachedData(data);

        if (onSuccess) {
          onSuccess(data);
        }

        return { data };
      } catch (error) {
        const apiError = error as APIError;

        // Check if we should retry
        if (
          currentRetryCount.current < retryCount &&
          apiError.recoverable !== false &&
          !signal.aborted
        ) {
          currentRetryCount.current++;
          
          const delay = apiError.retryAfter || retryDelay * Math.pow(2, currentRetryCount.current - 1);
          
          return new Promise((resolve) => {
            retryTimeoutRef.current = setTimeout(async () => {
              const result = await attemptExecution();
              resolve(result);
            }, delay);
          });
        }

        setState({
          data: null,
          loading: false,
          error: apiError,
          lastFetch: null,
        });

        if (onError) {
          onError(apiError);
        }

        return { error: apiError };
      }
    };

    return attemptExecution();
  }, [
    getCachedData,
    setCachedData,
    retryCount,
    retryDelay,
    timeout,
    onSuccess,
    onError,
  ]);

  const retry = useCallback(() => {
    if (state.error) {
      // Re-execute the last operation
      // Note: This requires the component to store the last async function
      console.warn('Retry called but no stored async function. Use execute() instead.');
    }
  }, [state.error]);

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    setState({
      data: initialData,
      loading: false,
      error: null,
      lastFetch: null,
    });

    currentRetryCount.current = 0;
  }, [initialData]);

  const clearCache = useCallback(() => {
    if (!cacheKey) return;

    try {
      localStorage.removeItem(`async_cache_${cacheKey}`);
      localStorage.removeItem(`async_cache_${cacheKey}_timestamp`);
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }, [cacheKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    execute,
    retry,
    reset,
    clearCache,
    isStale: state.lastFetch ? Date.now() - state.lastFetch.getTime() > cacheTimeout : true,
    retryCount: currentRetryCount.current,
    maxRetries: retryCount,
  };
};
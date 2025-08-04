import { useState, useEffect, useCallback } from 'react';

interface OfflineState {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnlineTime: Date | null;
  offlineDuration: number;
}

interface OfflineConfig {
  onOnline?: () => void;
  onOffline?: () => void;
  pingUrl?: string;
  pingInterval?: number;
}

export const useOfflineState = (config: OfflineConfig = {}) => {
  const [state, setState] = useState<OfflineState>({
    isOnline: navigator.onLine,
    wasOffline: false,
    lastOnlineTime: navigator.onLine ? new Date() : null,
    offlineDuration: 0,
  });

  const [isConnecting, setIsConnecting] = useState(false);

  const checkConnection = useCallback(async () => {
    if (!config.pingUrl) return navigator.onLine;

    try {
      setIsConnecting(true);
      const response = await fetch(config.pingUrl, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, [config.pingUrl]);

  const updateOnlineStatus = useCallback(async () => {
    const isOnline = await checkConnection();
    const now = new Date();

    setState(prevState => {
      const wasOffline = !prevState.isOnline;
      const offlineDuration = wasOffline && isOnline && prevState.lastOnlineTime
        ? now.getTime() - prevState.lastOnlineTime.getTime()
        : prevState.offlineDuration;

      return {
        isOnline,
        wasOffline: wasOffline && isOnline,
        lastOnlineTime: isOnline ? now : prevState.lastOnlineTime,
        offlineDuration,
      };
    });

    return isOnline;
  }, [checkConnection]);

  useEffect(() => {
    const handleOnline = async () => {
      const isActuallyOnline = await updateOnlineStatus();
      if (isActuallyOnline && config.onOnline) {
        config.onOnline();
      }
    };

    const handleOffline = () => {
      setState(prevState => ({
        ...prevState,
        isOnline: false,
        wasOffline: true,
      }));
      
      if (config.onOffline) {
        config.onOffline();
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set up periodic connection checking
    let intervalId: NodeJS.Timeout | null = null;
    if (config.pingInterval && config.pingInterval > 0) {
      intervalId = setInterval(updateOnlineStatus, config.pingInterval);
    }

    // Initial check
    updateOnlineStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [config.onOnline, config.onOffline, config.pingInterval, updateOnlineStatus]);

  const retry = useCallback(async () => {
    return await updateOnlineStatus();
  }, [updateOnlineStatus]);

  return {
    ...state,
    isConnecting,
    retry,
    checkConnection: updateOnlineStatus,
  };
};

// Hook for managing offline data caching
export const useOfflineCache = <T>(key: string, defaultValue: T) => {
  const [data, setData] = useState<T>(() => {
    try {
      const cached = localStorage.getItem(`offline_cache_${key}`);
      return cached ? JSON.parse(cached) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const [lastUpdated, setLastUpdated] = useState<Date | null>(() => {
    try {
      const timestamp = localStorage.getItem(`offline_cache_${key}_timestamp`);
      return timestamp ? new Date(timestamp) : null;
    } catch {
      return null;
    }
  });

  const updateCache = useCallback((newData: T) => {
    try {
      localStorage.setItem(`offline_cache_${key}`, JSON.stringify(newData));
      localStorage.setItem(`offline_cache_${key}_timestamp`, new Date().toISOString());
      setData(newData);
      setLastUpdated(new Date());
    } catch (error) {
      console.warn('Failed to update offline cache:', error);
    }
  }, [key]);

  const clearCache = useCallback(() => {
    try {
      localStorage.removeItem(`offline_cache_${key}`);
      localStorage.removeItem(`offline_cache_${key}_timestamp`);
      setData(defaultValue);
      setLastUpdated(null);
    } catch (error) {
      console.warn('Failed to clear offline cache:', error);
    }
  }, [key, defaultValue]);

  const isStale = useCallback((maxAge: number = 5 * 60 * 1000) => {
    if (!lastUpdated) return true;
    return Date.now() - lastUpdated.getTime() > maxAge;
  }, [lastUpdated]);

  return {
    data,
    lastUpdated,
    updateCache,
    clearCache,
    isStale,
  };
};
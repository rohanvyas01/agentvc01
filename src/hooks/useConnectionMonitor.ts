import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

export interface ConnectionState {
  isOnline: boolean;
  isSupabaseConnected: boolean;
  lastPing: Date | null;
  connectionQuality: 'excellent' | 'good' | 'poor' | 'offline';
  latency: number | null;
  reconnectAttempts: number;
  isReconnecting: boolean;
}

export interface ConnectionMonitorOptions {
  pingInterval?: number;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  onConnectionChange?: (state: ConnectionState) => void;
  onReconnectSuccess?: () => void;
  onReconnectFailed?: () => void;
}

export const useConnectionMonitor = ({
  pingInterval = 30000, // 30 seconds
  maxReconnectAttempts = 5,
  reconnectDelay = 2000,
  onConnectionChange,
  onReconnectSuccess,
  onReconnectFailed,
}: ConnectionMonitorOptions = {}) => {
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    isOnline: navigator.onLine,
    isSupabaseConnected: false,
    lastPing: null,
    connectionQuality: 'offline',
    latency: null,
    reconnectAttempts: 0,
    isReconnecting: false,
  });

  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);

  const updateConnectionState = useCallback((updates: Partial<ConnectionState>) => {
    if (isUnmountedRef.current) return;
    
    setConnectionState(prev => {
      const newState = { ...prev, ...updates };
      onConnectionChange?.(newState);
      return newState;
    });
  }, [onConnectionChange]);

  const calculateConnectionQuality = useCallback((latency: number): ConnectionState['connectionQuality'] => {
    if (latency < 100) return 'excellent';
    if (latency < 300) return 'good';
    if (latency < 1000) return 'poor';
    return 'offline';
  }, []);

  const pingSupabase = useCallback(async (): Promise<{ success: boolean; latency: number }> => {
    const startTime = Date.now();
    
    try {
      // Simple query to test Supabase connection
      const { error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .abortSignal(AbortSignal.timeout(5000)); // 5 second timeout

      const latency = Date.now() - startTime;

      if (error) {
        return { success: false, latency };
      }

      return { success: true, latency };
    } catch (error) {
      const latency = Date.now() - startTime;
      return { success: false, latency };
    }
  }, []);

  const checkConnection = useCallback(async () => {
    if (isUnmountedRef.current) return;

    const isOnline = navigator.onLine;
    
    if (!isOnline) {
      updateConnectionState({
        isOnline: false,
        isSupabaseConnected: false,
        connectionQuality: 'offline',
        latency: null,
        lastPing: new Date(),
      });
      return;
    }

    const { success, latency } = await pingSupabase();
    const connectionQuality = success ? calculateConnectionQuality(latency) : 'offline';

    updateConnectionState({
      isOnline: true,
      isSupabaseConnected: success,
      connectionQuality,
      latency: success ? latency : null,
      lastPing: new Date(),
    });
  }, [updateConnectionState, pingSupabase, calculateConnectionQuality]);

  const startPinging = useCallback(() => {
    if (pingIntervalRef.current) return;

    // Initial check
    checkConnection();

    // Set up interval
    pingIntervalRef.current = setInterval(checkConnection, pingInterval);
  }, [checkConnection, pingInterval]);

  const stopPinging = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  const attemptReconnect = useCallback(async () => {
    if (isUnmountedRef.current || connectionState.reconnectAttempts >= maxReconnectAttempts) {
      onReconnectFailed?.();
      return;
    }

    updateConnectionState({
      isReconnecting: true,
      reconnectAttempts: connectionState.reconnectAttempts + 1,
    });

    // Wait for reconnect delay with exponential backoff
    const delay = reconnectDelay * Math.pow(2, connectionState.reconnectAttempts);
    
    reconnectTimeoutRef.current = setTimeout(async () => {
      if (isUnmountedRef.current) return;

      const { success } = await pingSupabase();
      
      if (success) {
        updateConnectionState({
          isSupabaseConnected: true,
          isReconnecting: false,
          reconnectAttempts: 0,
          connectionQuality: 'good', // Assume good quality on successful reconnect
        });
        onReconnectSuccess?.();
      } else {
        updateConnectionState({
          isReconnecting: false,
        });
        // Will trigger another reconnect attempt due to useEffect
      }
    }, delay);
  }, [
    connectionState.reconnectAttempts,
    maxReconnectAttempts,
    reconnectDelay,
    updateConnectionState,
    pingSupabase,
    onReconnectSuccess,
    onReconnectFailed,
  ]);

  const forceReconnect = useCallback(() => {
    updateConnectionState({
      reconnectAttempts: 0,
      isReconnecting: false,
    });
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    checkConnection();
  }, [updateConnectionState, checkConnection]);

  // Handle browser online/offline events
  useEffect(() => {
    const handleOnline = () => {
      updateConnectionState({ isOnline: true });
      checkConnection();
    };

    const handleOffline = () => {
      updateConnectionState({
        isOnline: false,
        isSupabaseConnected: false,
        connectionQuality: 'offline',
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [updateConnectionState, checkConnection]);

  // Start monitoring on mount
  useEffect(() => {
    startPinging();

    return () => {
      isUnmountedRef.current = true;
      stopPinging();
      
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [startPinging, stopPinging]);

  // Auto-reconnect when connection is lost
  useEffect(() => {
    if (
      connectionState.isOnline &&
      !connectionState.isSupabaseConnected &&
      !connectionState.isReconnecting &&
      connectionState.reconnectAttempts < maxReconnectAttempts
    ) {
      attemptReconnect();
    }
  }, [
    connectionState.isOnline,
    connectionState.isSupabaseConnected,
    connectionState.isReconnecting,
    connectionState.reconnectAttempts,
    maxReconnectAttempts,
    attemptReconnect,
  ]);

  return {
    ...connectionState,
    forceReconnect,
    checkConnection,
  };
};
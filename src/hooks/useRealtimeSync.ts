import { useEffect, useRef, useCallback, useState } from 'react';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface RealtimeConfig {
  table: string;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  schema?: string;
}

export interface RealtimeState {
  isConnected: boolean;
  isReconnecting: boolean;
  lastError: Error | null;
  connectionAttempts: number;
  lastSync: Date | null;
}

export interface RealtimeCallbacks<T = any> {
  onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void;
  onError?: (error: Error) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export interface UseRealtimeSyncOptions<T = any> {
  config: RealtimeConfig;
  callbacks: RealtimeCallbacks<T>;
  autoReconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  enabled?: boolean;
}

export const useRealtimeSync = <T = any>({
  config,
  callbacks,
  autoReconnect = true,
  maxReconnectAttempts = 5,
  reconnectDelay = 1000,
  enabled = true,
}: UseRealtimeSyncOptions<T>) => {
  const [state, setState] = useState<RealtimeState>({
    isConnected: false,
    isReconnecting: false,
    lastError: null,
    connectionAttempts: 0,
    lastSync: null,
  });

  const channelRef = useRef<RealtimeChannel | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);

  const updateState = useCallback((updates: Partial<RealtimeState>) => {
    if (isUnmountedRef.current) return;
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const handleError = useCallback((error: Error) => {
    console.error('Realtime sync error:', error);
    updateState({ 
      lastError: error, 
      isConnected: false,
      lastSync: new Date()
    });
    callbacks.onError?.(error);
  }, [callbacks, updateState]);

  const handleConnect = useCallback(() => {
    console.log('Realtime connected:', config.table);
    updateState({ 
      isConnected: true, 
      isReconnecting: false, 
      connectionAttempts: 0,
      lastError: null,
      lastSync: new Date()
    });
    callbacks.onConnect?.();
  }, [callbacks, config.table, updateState]);

  const handleDisconnect = useCallback(() => {
    console.log('Realtime disconnected:', config.table);
    updateState({ 
      isConnected: false,
      lastSync: new Date()
    });
    callbacks.onDisconnect?.();
  }, [callbacks, config.table, updateState]);

  const handleInsert = useCallback((payload: RealtimePostgresChangesPayload<T>) => {
    console.log('Realtime insert:', config.table, payload);
    updateState({ lastSync: new Date() });
    callbacks.onInsert?.(payload);
  }, [callbacks, config.table, updateState]);

  const handleUpdate = useCallback((payload: RealtimePostgresChangesPayload<T>) => {
    console.log('Realtime update:', config.table, payload);
    updateState({ lastSync: new Date() });
    callbacks.onUpdate?.(payload);
  }, [callbacks, config.table, updateState]);

  const handleDelete = useCallback((payload: RealtimePostgresChangesPayload<T>) => {
    console.log('Realtime delete:', config.table, payload);
    updateState({ lastSync: new Date() });
    callbacks.onDelete?.(payload);
  }, [callbacks, config.table, updateState]);

  const connect = useCallback(() => {
    if (!enabled || channelRef.current) return;

    try {
      const channelName = `${config.table}_${Date.now()}`;
      const channel = supabase.channel(channelName);

      // Configure postgres changes subscription
      const changeConfig: any = {
        event: config.event || '*',
        schema: config.schema || 'public',
        table: config.table,
      };

      if (config.filter) {
        changeConfig.filter = config.filter;
      }

      channel
        .on('postgres_changes', changeConfig, (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              handleInsert(payload);
              break;
            case 'UPDATE':
              handleUpdate(payload);
              break;
            case 'DELETE':
              handleDelete(payload);
              break;
          }
        })
        .on('system', {}, (payload) => {
          if (payload.type === 'connected') {
            handleConnect();
          } else if (payload.type === 'disconnected') {
            handleDisconnect();
          }
        })
        .subscribe((status, error) => {
          if (error) {
            handleError(new Error(`Subscription error: ${error.message}`));
            return;
          }

          if (status === 'SUBSCRIBED') {
            handleConnect();
          } else if (status === 'CLOSED') {
            handleDisconnect();
          }
        });

      channelRef.current = channel;
    } catch (error) {
      handleError(error as Error);
    }
  }, [
    enabled,
    config,
    handleInsert,
    handleUpdate,
    handleDelete,
    handleConnect,
    handleDisconnect,
    handleError,
  ]);

  const disconnect = useCallback(() => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
      channelRef.current = null;
    }
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    updateState({ 
      isConnected: false, 
      isReconnecting: false,
      lastSync: new Date()
    });
  }, [updateState]);

  const reconnect = useCallback(() => {
    if (!autoReconnect || state.connectionAttempts >= maxReconnectAttempts) {
      console.log('Max reconnection attempts reached for:', config.table);
      return;
    }

    updateState({ 
      isReconnecting: true, 
      connectionAttempts: state.connectionAttempts + 1 
    });

    disconnect();

    const delay = reconnectDelay * Math.pow(2, state.connectionAttempts); // Exponential backoff
    
    reconnectTimeoutRef.current = setTimeout(() => {
      if (!isUnmountedRef.current) {
        connect();
      }
    }, delay);
  }, [
    autoReconnect,
    maxReconnectAttempts,
    reconnectDelay,
    state.connectionAttempts,
    config.table,
    updateState,
    disconnect,
    connect,
  ]);

  const forceReconnect = useCallback(() => {
    updateState({ connectionAttempts: 0 });
    disconnect();
    setTimeout(connect, 100);
  }, [updateState, disconnect, connect]);

  // Initialize connection
  useEffect(() => {
    if (enabled) {
      connect();
    }

    return () => {
      isUnmountedRef.current = true;
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  // Auto-reconnect on disconnect
  useEffect(() => {
    if (!state.isConnected && !state.isReconnecting && state.connectionAttempts > 0) {
      reconnect();
    }
  }, [state.isConnected, state.isReconnecting, state.connectionAttempts, reconnect]);

  return {
    ...state,
    connect,
    disconnect,
    reconnect: forceReconnect,
  };
};
import { renderHook, act } from '@testing-library/react';
import { useRealtimeSync } from '../useRealtimeSync';
import { supabase } from '../../lib/supabase';

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    channel: jest.fn(),
  },
}));

const mockChannel = {
  on: jest.fn().mockReturnThis(),
  subscribe: jest.fn(),
  unsubscribe: jest.fn(),
};

describe('useRealtimeSync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.channel as jest.Mock).mockReturnValue(mockChannel);
  });

  it('should initialize with disconnected state', () => {
    const { result } = renderHook(() =>
      useRealtimeSync({
        config: { table: 'test_table' },
        callbacks: {},
      })
    );

    expect(result.current.isConnected).toBe(false);
    expect(result.current.isReconnecting).toBe(false);
    expect(result.current.connectionAttempts).toBe(0);
  });

  it('should create channel with correct configuration', () => {
    renderHook(() =>
      useRealtimeSync({
        config: { 
          table: 'sessions',
          filter: 'user_id=eq.123',
          event: 'UPDATE'
        },
        callbacks: {},
      })
    );

    expect(supabase.channel).toHaveBeenCalledWith(expect.stringContaining('sessions_'));
    expect(mockChannel.on).toHaveBeenCalledWith(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions',
        filter: 'user_id=eq.123',
      },
      expect.any(Function)
    );
  });

  it('should handle insert events', () => {
    const onInsert = jest.fn();
    
    renderHook(() =>
      useRealtimeSync({
        config: { table: 'sessions' },
        callbacks: { onInsert },
      })
    );

    // Get the postgres_changes callback
    const postgresCallback = mockChannel.on.mock.calls.find(
      call => call[0] === 'postgres_changes'
    )[2];

    // Simulate insert event
    act(() => {
      postgresCallback({
        eventType: 'INSERT',
        new: { id: '1', name: 'test' },
        old: null,
      });
    });

    expect(onInsert).toHaveBeenCalledWith({
      eventType: 'INSERT',
      new: { id: '1', name: 'test' },
      old: null,
    });
  });

  it('should handle update events', () => {
    const onUpdate = jest.fn();
    
    renderHook(() =>
      useRealtimeSync({
        config: { table: 'sessions' },
        callbacks: { onUpdate },
      })
    );

    const postgresCallback = mockChannel.on.mock.calls.find(
      call => call[0] === 'postgres_changes'
    )[2];

    act(() => {
      postgresCallback({
        eventType: 'UPDATE',
        new: { id: '1', name: 'updated' },
        old: { id: '1', name: 'old' },
      });
    });

    expect(onUpdate).toHaveBeenCalledWith({
      eventType: 'UPDATE',
      new: { id: '1', name: 'updated' },
      old: { id: '1', name: 'old' },
    });
  });

  it('should handle delete events', () => {
    const onDelete = jest.fn();
    
    renderHook(() =>
      useRealtimeSync({
        config: { table: 'sessions' },
        callbacks: { onDelete },
      })
    );

    const postgresCallback = mockChannel.on.mock.calls.find(
      call => call[0] === 'postgres_changes'
    )[2];

    act(() => {
      postgresCallback({
        eventType: 'DELETE',
        new: null,
        old: { id: '1', name: 'deleted' },
      });
    });

    expect(onDelete).toHaveBeenCalledWith({
      eventType: 'DELETE',
      new: null,
      old: { id: '1', name: 'deleted' },
    });
  });

  it('should handle connection events', () => {
    const onConnect = jest.fn();
    const onDisconnect = jest.fn();
    
    const { result } = renderHook(() =>
      useRealtimeSync({
        config: { table: 'sessions' },
        callbacks: { onConnect, onDisconnect },
      })
    );

    // Get the system callback
    const systemCallback = mockChannel.on.mock.calls.find(
      call => call[0] === 'system'
    )[2];

    // Simulate connection
    act(() => {
      systemCallback({ type: 'connected' });
    });

    expect(result.current.isConnected).toBe(true);
    expect(onConnect).toHaveBeenCalled();

    // Simulate disconnection
    act(() => {
      systemCallback({ type: 'disconnected' });
    });

    expect(result.current.isConnected).toBe(false);
    expect(onDisconnect).toHaveBeenCalled();
  });

  it('should handle subscription status changes', () => {
    const { result } = renderHook(() =>
      useRealtimeSync({
        config: { table: 'sessions' },
        callbacks: {},
      })
    );

    // Get the subscribe callback
    const subscribeCallback = mockChannel.subscribe.mock.calls[0][0];

    // Simulate successful subscription
    act(() => {
      subscribeCallback('SUBSCRIBED', null);
    });

    expect(result.current.isConnected).toBe(true);

    // Simulate closed subscription
    act(() => {
      subscribeCallback('CLOSED', null);
    });

    expect(result.current.isConnected).toBe(false);
  });

  it('should handle subscription errors', () => {
    const onError = jest.fn();
    
    renderHook(() =>
      useRealtimeSync({
        config: { table: 'sessions' },
        callbacks: { onError },
      })
    );

    const subscribeCallback = mockChannel.subscribe.mock.calls[0][0];

    act(() => {
      subscribeCallback('ERROR', { message: 'Connection failed' });
    });

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('Connection failed'),
      })
    );
  });

  it('should not connect when disabled', () => {
    renderHook(() =>
      useRealtimeSync({
        config: { table: 'sessions' },
        callbacks: {},
        enabled: false,
      })
    );

    expect(supabase.channel).not.toHaveBeenCalled();
  });

  it('should cleanup on unmount', () => {
    const { unmount } = renderHook(() =>
      useRealtimeSync({
        config: { table: 'sessions' },
        callbacks: {},
      })
    );

    unmount();

    expect(mockChannel.unsubscribe).toHaveBeenCalled();
  });

  it('should force reconnect', () => {
    const { result } = renderHook(() =>
      useRealtimeSync({
        config: { table: 'sessions' },
        callbacks: {},
      })
    );

    act(() => {
      result.current.reconnect();
    });

    expect(mockChannel.unsubscribe).toHaveBeenCalled();
    // Should create a new channel
    expect(supabase.channel).toHaveBeenCalledTimes(2);
  });
});
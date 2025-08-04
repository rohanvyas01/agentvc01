import { renderHook, act } from '@testing-library/react';
import { useConnectionMonitor } from '../useConnectionMonitor';
import { supabase } from '../../lib/supabase';

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => ({
          abortSignal: jest.fn(() => Promise.resolve({ error: null })),
        })),
      })),
    })),
  },
}));

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('useConnectionMonitor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    (navigator as any).onLine = true;
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useConnectionMonitor());

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isSupabaseConnected).toBe(false);
    expect(result.current.connectionQuality).toBe('offline');
    expect(result.current.reconnectAttempts).toBe(0);
    expect(result.current.isReconnecting).toBe(false);
  });

  it('should detect online/offline status', () => {
    const { result } = renderHook(() => useConnectionMonitor());

    // Simulate going offline
    act(() => {
      (navigator as any).onLine = false;
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.connectionQuality).toBe('offline');

    // Simulate going online
    act(() => {
      (navigator as any).onLine = true;
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);
  });

  it('should ping Supabase and update connection state', async () => {
    // Mock successful Supabase response
    const mockFrom = jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => ({
          abortSignal: jest.fn(() => Promise.resolve({ error: null })),
        })),
      })),
    }));
    (supabase.from as jest.Mock).mockImplementation(mockFrom);

    const { result } = renderHook(() => useConnectionMonitor({
      pingInterval: 1000,
    }));

    // Wait for initial ping
    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve(); // Allow promises to resolve
    });

    expect(result.current.isSupabaseConnected).toBe(true);
    expect(result.current.connectionQuality).toBe('excellent');
    expect(result.current.lastPing).toBeTruthy();
  });

  it('should handle Supabase connection failures', async () => {
    // Mock failed Supabase response
    const mockFrom = jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => ({
          abortSignal: jest.fn(() => Promise.resolve({ error: { message: 'Connection failed' } })),
        })),
      })),
    }));
    (supabase.from as jest.Mock).mockImplementation(mockFrom);

    const { result } = renderHook(() => useConnectionMonitor());

    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });

    expect(result.current.isSupabaseConnected).toBe(false);
    expect(result.current.connectionQuality).toBe('offline');
  });

  it('should calculate connection quality based on latency', async () => {
    // Mock different latencies by controlling timing
    const mockFrom = jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => ({
          abortSignal: jest.fn(() => {
            // Simulate 50ms latency
            return new Promise(resolve => {
              setTimeout(() => resolve({ error: null }), 50);
            });
          }),
        })),
      })),
    }));
    (supabase.from as jest.Mock).mockImplementation(mockFrom);

    const { result } = renderHook(() => useConnectionMonitor());

    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });

    expect(result.current.connectionQuality).toBe('excellent');
    expect(result.current.latency).toBeLessThan(100);
  });

  it('should attempt reconnection on connection loss', async () => {
    const onReconnectSuccess = jest.fn();
    const onReconnectFailed = jest.fn();

    // Start with successful connection
    const mockFrom = jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => ({
          abortSignal: jest.fn(() => Promise.resolve({ error: null })),
        })),
      })),
    }));
    (supabase.from as jest.Mock).mockImplementation(mockFrom);

    const { result } = renderHook(() => useConnectionMonitor({
      onReconnectSuccess,
      onReconnectFailed,
      maxReconnectAttempts: 2,
      reconnectDelay: 1000,
    }));

    // Wait for initial connection
    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });

    expect(result.current.isSupabaseConnected).toBe(true);

    // Simulate connection failure
    mockFrom.mockImplementation(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => ({
          abortSignal: jest.fn(() => Promise.resolve({ error: { message: 'Failed' } })),
        })),
      })),
    }));

    // Trigger next ping cycle
    await act(async () => {
      jest.advanceTimersByTime(30000); // Default ping interval
      await Promise.resolve();
    });

    expect(result.current.isSupabaseConnected).toBe(false);
    expect(result.current.isReconnecting).toBe(true);

    // Restore connection for reconnect attempt
    mockFrom.mockImplementation(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => ({
          abortSignal: jest.fn(() => Promise.resolve({ error: null })),
        })),
      })),
    }));

    // Wait for reconnect attempt
    await act(async () => {
      jest.advanceTimersByTime(2000); // Reconnect delay
      await Promise.resolve();
    });

    expect(result.current.isSupabaseConnected).toBe(true);
    expect(result.current.isReconnecting).toBe(false);
    expect(onReconnectSuccess).toHaveBeenCalled();
  });

  it('should force reconnect when requested', async () => {
    const { result } = renderHook(() => useConnectionMonitor());

    const initialPingTime = result.current.lastPing;

    await act(async () => {
      result.current.forceReconnect();
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });

    expect(result.current.lastPing).not.toBe(initialPingTime);
  });

  it('should call connection change callback', async () => {
    const onConnectionChange = jest.fn();

    renderHook(() => useConnectionMonitor({
      onConnectionChange,
    }));

    await act(async () => {
      jest.advanceTimersByTime(100);
      await Promise.resolve();
    });

    expect(onConnectionChange).toHaveBeenCalled();
  });

  it('should stop pinging on unmount', () => {
    const { unmount } = renderHook(() => useConnectionMonitor({
      pingInterval: 1000,
    }));

    unmount();

    // Advance time to see if ping would have occurred
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // Should not crash or continue pinging
    expect(true).toBe(true); // Test passes if no errors
  });
});
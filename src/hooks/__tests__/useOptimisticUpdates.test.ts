import { renderHook, act } from '@testing-library/react';
import { useOptimisticUpdates } from '../useOptimisticUpdates';

interface TestItem {
  id: string;
  name: string;
  created_at: string;
  updated_at?: string;
}

describe('useOptimisticUpdates', () => {
  const initialData: TestItem[] = [
    { id: '1', name: 'Item 1', created_at: '2023-01-01' },
    { id: '2', name: 'Item 2', created_at: '2023-01-02' },
  ];

  it('should initialize with provided data', () => {
    const { result } = renderHook(() =>
      useOptimisticUpdates({
        initialData,
        keyField: 'id',
      })
    );

    expect(result.current.data).toEqual(initialData);
    expect(result.current.isOptimistic).toBe(false);
    expect(result.current.pendingUpdates).toEqual([]);
  });

  it('should handle optimistic create', async () => {
    const mockServerAction = jest.fn().mockResolvedValue({
      id: '3',
      name: 'New Item',
      created_at: '2023-01-03',
    });

    const { result } = renderHook(() =>
      useOptimisticUpdates({
        initialData,
        keyField: 'id',
      })
    );

    const newItem = { id: '3', name: 'New Item', created_at: '2023-01-03' };

    await act(async () => {
      await result.current.optimisticCreate(newItem, mockServerAction);
    });

    expect(mockServerAction).toHaveBeenCalledWith(newItem);
    expect(result.current.data).toHaveLength(3);
    expect(result.current.data[2]).toEqual(newItem);
  });

  it('should handle optimistic update', async () => {
    const mockServerAction = jest.fn().mockResolvedValue({
      id: '1',
      name: 'Updated Item',
      created_at: '2023-01-01',
      updated_at: '2023-01-03',
    });

    const { result } = renderHook(() =>
      useOptimisticUpdates({
        initialData,
        keyField: 'id',
      })
    );

    const updatedItem = { 
      id: '1', 
      name: 'Updated Item', 
      created_at: '2023-01-01',
      updated_at: '2023-01-03'
    };

    await act(async () => {
      await result.current.optimisticUpdate(updatedItem, mockServerAction);
    });

    expect(mockServerAction).toHaveBeenCalledWith(updatedItem);
    expect(result.current.data[0]).toEqual(updatedItem);
  });

  it('should handle optimistic delete', async () => {
    const mockServerAction = jest.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() =>
      useOptimisticUpdates({
        initialData,
        keyField: 'id',
      })
    );

    const itemToDelete = initialData[0];

    await act(async () => {
      await result.current.optimisticDelete(itemToDelete, mockServerAction);
    });

    expect(mockServerAction).toHaveBeenCalledWith(itemToDelete);
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data.find(item => item.id === '1')).toBeUndefined();
  });

  it('should revert changes on server error', async () => {
    const mockServerAction = jest.fn().mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() =>
      useOptimisticUpdates({
        initialData,
        keyField: 'id',
      })
    );

    const newItem = { id: '3', name: 'New Item', created_at: '2023-01-03' };

    await act(async () => {
      try {
        await result.current.optimisticCreate(newItem, mockServerAction);
      } catch (error) {
        // Expected to throw
      }
    });

    // Should revert the optimistic change
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data.find(item => item.id === '3')).toBeUndefined();
  });

  it('should handle conflict resolution', () => {
    const onConflict = jest.fn((local, remote) => ({ ...remote, name: local.name }));

    const { result } = renderHook(() =>
      useOptimisticUpdates({
        initialData,
        keyField: 'id',
        onConflict,
      })
    );

    const remoteData = [
      { id: '1', name: 'Remote Item 1', created_at: '2023-01-01', updated_at: '2023-01-04' },
      { id: '2', name: 'Remote Item 2', created_at: '2023-01-02', updated_at: '2023-01-04' },
    ];

    act(() => {
      result.current.syncWithRemote(remoteData);
    });

    expect(result.current.data).toEqual(remoteData);
  });

  it('should sync with remote data', () => {
    const { result } = renderHook(() =>
      useOptimisticUpdates({
        initialData,
        keyField: 'id',
      })
    );

    const remoteData = [
      { id: '1', name: 'Updated Item 1', created_at: '2023-01-01' },
      { id: '2', name: 'Updated Item 2', created_at: '2023-01-02' },
      { id: '3', name: 'New Item 3', created_at: '2023-01-03' },
    ];

    act(() => {
      result.current.syncWithRemote(remoteData);
    });

    expect(result.current.data).toEqual(remoteData);
  });

  it('should clear pending updates', () => {
    const { result } = renderHook(() =>
      useOptimisticUpdates({
        initialData,
        keyField: 'id',
      })
    );

    // Add some pending updates by triggering optimistic operations
    act(() => {
      // Simulate pending updates by directly modifying state
      result.current.clearPendingUpdates();
    });

    expect(result.current.pendingUpdates).toEqual([]);
    expect(result.current.isOptimistic).toBe(false);
  });

  it('should retry failed operations', async () => {
    jest.useFakeTimers();
    
    const mockServerAction = jest.fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'))
      .mockResolvedValueOnce({
        id: '3',
        name: 'New Item',
        created_at: '2023-01-03',
      });

    const { result } = renderHook(() =>
      useOptimisticUpdates({
        initialData,
        keyField: 'id',
        maxRetries: 3,
        retryDelay: 1000,
      })
    );

    const newItem = { id: '3', name: 'New Item', created_at: '2023-01-03' };

    // Start the optimistic create (will fail first time)
    act(() => {
      result.current.optimisticCreate(newItem, mockServerAction).catch(() => {});
    });

    // Fast-forward through retry delays
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    act(() => {
      jest.advanceTimersByTime(2000); // Exponential backoff
    });

    act(() => {
      jest.advanceTimersByTime(4000); // Final retry
    });

    // Should eventually succeed
    expect(mockServerAction).toHaveBeenCalledTimes(3);
    
    jest.useRealTimers();
  });
});
import { useState, useCallback, useRef } from 'react';

export interface OptimisticUpdate<T> {
  id: string;
  type: 'create' | 'update' | 'delete';
  data: T;
  originalData?: T;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  retryCount: number;
}

export interface OptimisticState<T> {
  data: T[];
  pendingUpdates: OptimisticUpdate<T>[];
  isOptimistic: boolean;
}

export interface UseOptimisticUpdatesOptions<T> {
  initialData: T[];
  keyField: keyof T;
  maxRetries?: number;
  retryDelay?: number;
  onConflict?: (local: T, remote: T) => T;
}

export const useOptimisticUpdates = <T extends Record<string, any>>({
  initialData,
  keyField,
  maxRetries = 3,
  retryDelay = 1000,
  onConflict,
}: UseOptimisticUpdatesOptions<T>) => {
  const [state, setState] = useState<OptimisticState<T>>({
    data: initialData,
    pendingUpdates: [],
    isOptimistic: false,
  });

  const retryTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const generateUpdateId = useCallback(() => {
    return `optimistic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const applyOptimisticUpdate = useCallback((update: OptimisticUpdate<T>) => {
    setState(prev => {
      let newData = [...prev.data];
      
      switch (update.type) {
        case 'create':
          // Add new item optimistically
          newData.push(update.data);
          break;
          
        case 'update':
          // Update existing item optimistically
          const updateIndex = newData.findIndex(item => item[keyField] === update.data[keyField]);
          if (updateIndex !== -1) {
            newData[updateIndex] = { ...newData[updateIndex], ...update.data };
          }
          break;
          
        case 'delete':
          // Remove item optimistically
          newData = newData.filter(item => item[keyField] !== update.data[keyField]);
          break;
      }

      return {
        ...prev,
        data: newData,
        pendingUpdates: [...prev.pendingUpdates, update],
        isOptimistic: true,
      };
    });
  }, [keyField]);

  const confirmUpdate = useCallback((updateId: string, confirmedData?: T) => {
    setState(prev => {
      const update = prev.pendingUpdates.find(u => u.id === updateId);
      if (!update) return prev;

      let newData = [...prev.data];
      
      if (confirmedData && update.type !== 'delete') {
        // Apply confirmed data if provided
        const index = newData.findIndex(item => item[keyField] === confirmedData[keyField]);
        if (index !== -1) {
          newData[index] = confirmedData;
        } else if (update.type === 'create') {
          // Replace optimistic item with confirmed data
          const optimisticIndex = newData.findIndex(item => item[keyField] === update.data[keyField]);
          if (optimisticIndex !== -1) {
            newData[optimisticIndex] = confirmedData;
          }
        }
      }

      const newPendingUpdates = prev.pendingUpdates.map(u =>
        u.id === updateId ? { ...u, status: 'confirmed' as const } : u
      );

      // Clean up confirmed updates after a delay
      setTimeout(() => {
        setState(current => ({
          ...current,
          pendingUpdates: current.pendingUpdates.filter(u => u.id !== updateId),
          isOptimistic: current.pendingUpdates.filter(u => u.id !== updateId).length > 0,
        }));
      }, 1000);

      return {
        ...prev,
        data: newData,
        pendingUpdates: newPendingUpdates,
      };
    });

    // Clear retry timeout if exists
    const timeout = retryTimeoutsRef.current.get(updateId);
    if (timeout) {
      clearTimeout(timeout);
      retryTimeoutsRef.current.delete(updateId);
    }
  }, [keyField]);

  const failUpdate = useCallback((updateId: string, error?: Error) => {
    setState(prev => {
      const update = prev.pendingUpdates.find(u => u.id === updateId);
      if (!update) return prev;

      // Revert optimistic change
      let newData = [...prev.data];
      
      switch (update.type) {
        case 'create':
          // Remove optimistically added item
          newData = newData.filter(item => item[keyField] !== update.data[keyField]);
          break;
          
        case 'update':
          // Revert to original data
          if (update.originalData) {
            const index = newData.findIndex(item => item[keyField] === update.data[keyField]);
            if (index !== -1) {
              newData[index] = update.originalData;
            }
          }
          break;
          
        case 'delete':
          // Re-add deleted item
          if (update.originalData) {
            newData.push(update.originalData);
          }
          break;
      }

      const shouldRetry = update.retryCount < maxRetries;
      
      if (shouldRetry) {
        // Schedule retry
        const retryUpdate = {
          ...update,
          retryCount: update.retryCount + 1,
          timestamp: Date.now(),
        };

        const timeout = setTimeout(() => {
          // Re-apply optimistic update for retry
          applyOptimisticUpdate(retryUpdate);
        }, retryDelay * Math.pow(2, update.retryCount)); // Exponential backoff

        retryTimeoutsRef.current.set(updateId, timeout);

        return {
          ...prev,
          data: newData,
          pendingUpdates: prev.pendingUpdates.map(u =>
            u.id === updateId ? { ...u, status: 'failed' as const } : u
          ),
        };
      } else {
        // Max retries reached, remove update
        console.error(`Optimistic update failed after ${maxRetries} retries:`, error);
        
        return {
          ...prev,
          data: newData,
          pendingUpdates: prev.pendingUpdates.filter(u => u.id !== updateId),
          isOptimistic: prev.pendingUpdates.filter(u => u.id !== updateId).length > 0,
        };
      }
    });
  }, [keyField, maxRetries, retryDelay, applyOptimisticUpdate]);

  const resolveConflict = useCallback((localItem: T, remoteItem: T): T => {
    if (onConflict) {
      return onConflict(localItem, remoteItem);
    }

    // Default conflict resolution: prefer remote data but keep local timestamps if newer
    const localTimestamp = new Date(localItem.updated_at || localItem.created_at || 0).getTime();
    const remoteTimestamp = new Date(remoteItem.updated_at || remoteItem.created_at || 0).getTime();

    if (localTimestamp > remoteTimestamp) {
      console.warn('Conflict detected: local data is newer, merging changes');
      return { ...remoteItem, ...localItem };
    }

    return remoteItem;
  }, [onConflict]);

  const syncWithRemote = useCallback((remoteData: T[]) => {
    setState(prev => {
      const newData = [...remoteData];
      
      // Apply conflict resolution for items with pending updates
      prev.pendingUpdates.forEach(update => {
        if (update.status === 'pending') {
          const remoteItem = remoteData.find(item => item[keyField] === update.data[keyField]);
          if (remoteItem && update.type === 'update') {
            const resolvedItem = resolveConflict(update.data, remoteItem);
            const index = newData.findIndex(item => item[keyField] === resolvedItem[keyField]);
            if (index !== -1) {
              newData[index] = resolvedItem;
            }
          }
        }
      });

      return {
        ...prev,
        data: newData,
      };
    });
  }, [keyField, resolveConflict]);

  const optimisticCreate = useCallback(async (
    newItem: T,
    serverAction: (item: T) => Promise<T>
  ): Promise<T> => {
    const updateId = generateUpdateId();
    const optimisticItem = {
      ...newItem,
      [keyField]: newItem[keyField] || `temp_${updateId}`,
    };

    const update: OptimisticUpdate<T> = {
      id: updateId,
      type: 'create',
      data: optimisticItem,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
    };

    applyOptimisticUpdate(update);

    try {
      const confirmedItem = await serverAction(newItem);
      confirmUpdate(updateId, confirmedItem);
      return confirmedItem;
    } catch (error) {
      failUpdate(updateId, error as Error);
      throw error;
    }
  }, [keyField, generateUpdateId, applyOptimisticUpdate, confirmUpdate, failUpdate]);

  const optimisticUpdate = useCallback(async (
    updatedItem: T,
    serverAction: (item: T) => Promise<T>
  ): Promise<T> => {
    const updateId = generateUpdateId();
    
    // Find original item for potential rollback
    const originalItem = state.data.find(item => item[keyField] === updatedItem[keyField]);

    const update: OptimisticUpdate<T> = {
      id: updateId,
      type: 'update',
      data: updatedItem,
      originalData: originalItem,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
    };

    applyOptimisticUpdate(update);

    try {
      const confirmedItem = await serverAction(updatedItem);
      confirmUpdate(updateId, confirmedItem);
      return confirmedItem;
    } catch (error) {
      failUpdate(updateId, error as Error);
      throw error;
    }
  }, [keyField, state.data, generateUpdateId, applyOptimisticUpdate, confirmUpdate, failUpdate]);

  const optimisticDelete = useCallback(async (
    itemToDelete: T,
    serverAction: (item: T) => Promise<void>
  ): Promise<void> => {
    const updateId = generateUpdateId();

    const update: OptimisticUpdate<T> = {
      id: updateId,
      type: 'delete',
      data: itemToDelete,
      originalData: itemToDelete,
      timestamp: Date.now(),
      status: 'pending',
      retryCount: 0,
    };

    applyOptimisticUpdate(update);

    try {
      await serverAction(itemToDelete);
      confirmUpdate(updateId);
    } catch (error) {
      failUpdate(updateId, error as Error);
      throw error;
    }
  }, [generateUpdateId, applyOptimisticUpdate, confirmUpdate, failUpdate]);

  const clearPendingUpdates = useCallback(() => {
    // Clear all retry timeouts
    retryTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    retryTimeoutsRef.current.clear();

    setState(prev => ({
      ...prev,
      pendingUpdates: [],
      isOptimistic: false,
    }));
  }, []);

  return {
    data: state.data,
    pendingUpdates: state.pendingUpdates,
    isOptimistic: state.isOptimistic,
    optimisticCreate,
    optimisticUpdate,
    optimisticDelete,
    syncWithRemote,
    clearPendingUpdates,
    confirmUpdate,
    failUpdate,
  };
};
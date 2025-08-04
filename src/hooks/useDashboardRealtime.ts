import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRealtimeSync } from './useRealtimeSync';
import { useOptimisticUpdates } from './useOptimisticUpdates';
import { useConnectionMonitor } from './useConnectionMonitor';
import { supabase, Session, PitchDeck, Company, Profile } from '../lib/supabase';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export interface DashboardRealtimeData {
  profile: Profile | null;
  company: Company | null;
  pitchDecks: PitchDeck[];
  sessions: Session[];
}

export interface DashboardRealtimeState {
  data: DashboardRealtimeData;
  isLoading: boolean;
  error: Error | null;
  isOptimistic: boolean;
  connectionState: {
    isConnected: boolean;
    isReconnecting: boolean;
    lastSync: Date | null;
  };
}

export const useDashboardRealtime = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize optimistic updates for each data type
  const sessionsOptimistic = useOptimisticUpdates<Session>({
    initialData: [],
    keyField: 'id',
    onConflict: (local, remote) => {
      // Prefer remote data for sessions, but keep local status if more recent
      const localTime = new Date(local.updated_at || local.created_at).getTime();
      const remoteTime = new Date(remote.updated_at || remote.created_at).getTime();
      
      if (localTime > remoteTime && local.status !== remote.status) {
        return { ...remote, status: local.status };
      }
      return remote;
    },
  });

  const pitchDecksOptimistic = useOptimisticUpdates<PitchDeck>({
    initialData: [],
    keyField: 'id',
    onConflict: (local, remote) => {
      // Prefer remote processing status
      return remote;
    },
  });

  const [staticData, setStaticData] = useState<{
    profile: Profile | null;
    company: Company | null;
  }>({
    profile: null,
    company: null,
  });

  // Connection monitoring
  const connectionMonitor = useConnectionMonitor({
    onConnectionChange: (state) => {
      console.log('Dashboard connection state changed:', state);
    },
    onReconnectSuccess: () => {
      console.log('Dashboard reconnected, refreshing data');
      loadInitialData();
    },
  });

  // Load initial data
  const loadInitialData = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load static data (profile and company)
      const [profileRes, companyRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('companies').select('*').eq('user_id', user.id).maybeSingle(),
      ]);

      if (profileRes.error) throw profileRes.error;
      if (companyRes.error) throw companyRes.error;

      setStaticData({
        profile: profileRes.data,
        company: companyRes.data,
      });

      // Load dynamic data (pitch decks and sessions)
      const [pitchDecksRes, sessionsRes] = await Promise.all([
        supabase
          .from('pitch_decks')
          .select('*')
          .eq(companyRes.data?.id ? 'company_id' : 'user_id', companyRes.data?.id || user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      if (pitchDecksRes.error) throw pitchDecksRes.error;
      if (sessionsRes.error) throw sessionsRes.error;

      // Map pitch decks to match interface
      const mappedPitchDecks = (pitchDecksRes.data || []).map(deck => ({
        ...deck,
        deck_name: deck.deck_name || `Pitch Deck #${deck.id.slice(-8)}`,
        processing_status: deck.status || 'pending',
        user_id: user.id,
      }));

      // Sync with optimistic updates
      pitchDecksOptimistic.syncWithRemote(mappedPitchDecks);
      sessionsOptimistic.syncWithRemote(sessionsRes.data || []);

    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [user, pitchDecksOptimistic, sessionsOptimistic]);

  // Realtime subscriptions for sessions
  const sessionsRealtime = useRealtimeSync<Session>({
    config: {
      table: 'sessions',
      filter: `user_id=eq.${user?.id}`,
    },
    callbacks: {
      onInsert: (payload) => {
        console.log('Session inserted:', payload.new);
        sessionsOptimistic.syncWithRemote([
          payload.new as Session,
          ...sessionsOptimistic.data,
        ]);
      },
      onUpdate: (payload) => {
        console.log('Session updated:', payload.new);
        const updatedSessions = sessionsOptimistic.data.map(session =>
          session.id === payload.new.id ? payload.new as Session : session
        );
        sessionsOptimistic.syncWithRemote(updatedSessions);
      },
      onDelete: (payload) => {
        console.log('Session deleted:', payload.old);
        const filteredSessions = sessionsOptimistic.data.filter(
          session => session.id !== payload.old.id
        );
        sessionsOptimistic.syncWithRemote(filteredSessions);
      },
      onError: (error) => {
        console.error('Sessions realtime error:', error);
        setError(error);
      },
    },
    enabled: !!user,
  });

  // Realtime subscriptions for pitch decks
  const pitchDecksRealtime = useRealtimeSync<PitchDeck>({
    config: {
      table: 'pitch_decks',
      filter: staticData.company?.id ? `company_id=eq.${staticData.company.id}` : `user_id=eq.${user.id}`,
    },
    callbacks: {
      onInsert: (payload) => {
        console.log('Pitch deck inserted:', payload.new);
        const mappedDeck = {
          ...payload.new,
          deck_name: payload.new.deck_name || `Pitch Deck #${payload.new.id.slice(-8)}`,
          processing_status: payload.new.status || 'pending',
          user_id: user?.id || '',
        } as PitchDeck;
        
        pitchDecksOptimistic.syncWithRemote([
          mappedDeck,
          ...pitchDecksOptimistic.data,
        ]);
      },
      onUpdate: (payload) => {
        console.log('Pitch deck updated:', payload.new);
        const mappedDeck = {
          ...payload.new,
          deck_name: payload.new.deck_name || `Pitch Deck #${payload.new.id.slice(-8)}`,
          processing_status: payload.new.status || 'pending',
          user_id: user?.id || '',
        } as PitchDeck;
        
        const updatedDecks = pitchDecksOptimistic.data.map(deck =>
          deck.id === payload.new.id ? mappedDeck : deck
        );
        pitchDecksOptimistic.syncWithRemote(updatedDecks);
      },
      onDelete: (payload) => {
        console.log('Pitch deck deleted:', payload.old);
        const filteredDecks = pitchDecksOptimistic.data.filter(
          deck => deck.id !== payload.old.id
        );
        pitchDecksOptimistic.syncWithRemote(filteredDecks);
      },
      onError: (error) => {
        console.error('Pitch decks realtime error:', error);
        setError(error);
      },
    },
    enabled: !!user && !!staticData.company,
  });

  // Load initial data on mount and user change
  useEffect(() => {
    if (user) {
      loadInitialData();
    }
  }, [user, loadInitialData]);

  // Optimistic operations
  const createSession = useCallback(async (sessionData: Omit<Session, 'id' | 'created_at'>) => {
    if (!user) throw new Error('User not authenticated');

    return sessionsOptimistic.optimisticCreate(
      {
        ...sessionData,
        id: `temp_${Date.now()}`,
        created_at: new Date().toISOString(),
      } as Session,
      async (optimisticSession) => {
        const { data, error } = await supabase
          .from('sessions')
          .insert([sessionData])
          .select()
          .single();

        if (error) throw error;
        return data as Session;
      }
    );
  }, [user, sessionsOptimistic]);

  const updateSession = useCallback(async (sessionId: string, updates: Partial<Session>) => {
    const existingSession = sessionsOptimistic.data.find(s => s.id === sessionId);
    if (!existingSession) throw new Error('Session not found');

    return sessionsOptimistic.optimisticUpdate(
      { ...existingSession, ...updates },
      async (updatedSession) => {
        const { data, error } = await supabase
          .from('sessions')
          .update(updates)
          .eq('id', sessionId)
          .select()
          .single();

        if (error) throw error;
        return data as Session;
      }
    );
  }, [sessionsOptimistic]);

  const deleteSession = useCallback(async (sessionId: string) => {
    const sessionToDelete = sessionsOptimistic.data.find(s => s.id === sessionId);
    if (!sessionToDelete) throw new Error('Session not found');

    return sessionsOptimistic.optimisticDelete(
      sessionToDelete,
      async () => {
        const { error } = await supabase
          .from('sessions')
          .delete()
          .eq('id', sessionId);

        if (error) throw error;
      }
    );
  }, [sessionsOptimistic]);

  // Refresh data manually
  const refresh = useCallback(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Force reconnect all realtime subscriptions
  const reconnect = useCallback(() => {
    sessionsRealtime.reconnect();
    pitchDecksRealtime.reconnect();
    connectionMonitor.forceReconnect();
  }, [sessionsRealtime, pitchDecksRealtime, connectionMonitor]);

  return {
    data: {
      profile: staticData.profile,
      company: staticData.company,
      pitchDecks: pitchDecksOptimistic.data,
      sessions: sessionsOptimistic.data,
    },
    isLoading,
    error,
    isOptimistic: pitchDecksOptimistic.isOptimistic || sessionsOptimistic.isOptimistic,
    connectionState: {
      isConnected: sessionsRealtime.isConnected && pitchDecksRealtime.isConnected,
      isReconnecting: sessionsRealtime.isReconnecting || pitchDecksRealtime.isReconnecting,
      lastSync: sessionsRealtime.lastSync || pitchDecksRealtime.lastSync,
    },
    // Operations
    createSession,
    updateSession,
    deleteSession,
    refresh,
    reconnect,
    // Connection info
    connectionMonitor: connectionMonitor,
  };
};
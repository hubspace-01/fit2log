import { useState, useEffect, useRef, useCallback } from 'react';
import { supabaseService } from '../lib/supabase';
import type { CompletedSet } from '../types';

interface UseWorkoutSessionProps {
  userId: string;
  programId: string;
  programName: string;
  startedAt: string;
}

export const useWorkoutSession = ({
  userId,
  programId,
  programName,
  startedAt
}: UseWorkoutSessionProps) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [completedSets, setCompletedSets] = useState<CompletedSet[]>([]);
  const [initializing, setInitializing] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  
  const startTimeRef = useRef(new Date(startedAt).getTime());
  const sessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const initializeSession = useCallback(async () => {
    try {
      setInitializing(true);

      const existingSession = await supabaseService.getInProgressSession(
        userId,
        programId
      );

      if (existingSession) {
        setSessionId(existingSession.id);
        
        const logs = await supabaseService.getSessionLogs(existingSession.id);
        
        if (logs.length > 0) {
          setCompletedSets(logs);
          startTimeRef.current = new Date(existingSession.started_at).getTime();
        }

        return { sessionId: existingSession.id, logs };
      } else {
        const newSession = await supabaseService.createWorkoutSession({
          user_id: userId,
          program_id: programId,
          program_name: programName,
          started_at: startedAt
        });
        setSessionId(newSession.id);
        return { sessionId: newSession.id, logs: [] };
      }
    } catch (error) {
      throw error;
    } finally {
      setInitializing(false);
    }
  }, [userId, programId, programName, startedAt]);

  const cancelSession = useCallback(async () => {
    if (!sessionIdRef.current) return;

    const currentElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
    await supabaseService.updateWorkoutSession(sessionIdRef.current, {
      status: 'cancelled',
      completed_at: new Date().toISOString(),
      total_duration: currentElapsed
    });
  }, []);

  const completeSession = useCallback(async () => {
    if (!sessionId) return;

    await supabaseService.updateWorkoutSession(sessionId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      total_duration: elapsedTime
    });
  }, [sessionId, elapsedTime]);

  const addCompletedSet = useCallback((set: CompletedSet) => {
    setCompletedSets(prev => [...prev, set]);
  }, []);

  const updateCompletedSet = useCallback((setId: string, updates: Partial<CompletedSet>) => {
    setCompletedSets(prev => prev.map(set => 
      set.id === setId ? { ...set, ...updates } : set
    ));
  }, []);

  return {
    sessionId,
    completedSets,
    initializing,
    elapsedTime,
    initializeSession,
    cancelSession,
    completeSession,
    addCompletedSet,
    updateCompletedSet
  };
};

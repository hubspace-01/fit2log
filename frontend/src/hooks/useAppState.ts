import { useState, useCallback } from 'react';
import { AppScreen } from '../types';
import type { Program, WorkoutSession, AppState } from '../types';

export const useAppState = () => {
  const [state, setState] = useState<AppState>({
    screen: AppScreen.LOADING,
    programs: [],
    loading: false
  });

  const setScreen = useCallback((screen: AppScreen) => {
    setState(prev => ({ ...prev, screen }));
  }, []);

  const setPrograms = useCallback((programs: Program[]) => {
    setState(prev => ({ ...prev, programs }));
  }, []);

  // ✅ ИСПРАВЛЕНО: Принимает Program | undefined
  const setCurrentProgram = useCallback((program: Program | undefined) => {
    setState(prev => ({ ...prev, current_program: program }));
  }, []);

  const startWorkout = useCallback((program: Program) => {
    const session: WorkoutSession = {
      program_id: program.id,
      start_time: new Date().toISOString(),
      exercises: []
    };
    setState(prev => ({ ...prev, workout_session: session }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: undefined }));
  }, []);

  return {
    state,
    setScreen,
    setPrograms,
    setCurrentProgram,
    startWorkout,
    setLoading,
    setError,
    clearError,
  };
};

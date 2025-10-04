import { useState, useCallback } from 'react';
import type { AppState, AppScreen, Program, WorkoutSession } from '../types';

const initialState: AppState = {
  screen: 'loading' as AppScreen,
  programs: [],
  loading: false
};

export const useAppState = () => {
  const [state, setState] = useState<AppState>(initialState);

  const setScreen = useCallback((screen: AppScreen) => {
    setState(prev => ({ ...prev, screen }));
  }, []);

  const setPrograms = useCallback((programs: Program[]) => {
    setState(prev => ({ ...prev, programs }));
  }, []);

  const setCurrentProgram = useCallback((program: Program) => {
    setState(prev => ({ ...prev, current_program: program }));
  }, []);

  const startWorkout = useCallback((program: Program) => {
    const session: WorkoutSession = {
      program_id: program.id,
      program_name: program.program_name,
      started_at: new Date().toISOString(),
      exercises: program.exercises || [],
      current_exercise_index: 0,
      logs: []
    };
    setState(prev => ({ 
      ...prev, 
      workout_session: session, 
      screen: 'workout_logger' as AppScreen 
    }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setError = useCallback((error?: string) => {
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
    clearError
  };
};

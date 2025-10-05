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

  const setCurrentProgram = useCallback((program: Program | undefined) => {
    setState(prev => ({ ...prev, current_program: program }));
  }, []);

  const startWorkout = useCallback((program: Program, sessionId?: string) => {
    const session: WorkoutSession = {
      id: sessionId, // ✅ НОВОЕ: ID из БД
      program_id: program.id,
      program_name: program.program_name,
      started_at: new Date().toISOString(),
      exercises: program.exercises || [],
      current_exercise_index: 0,
      logs: []
    };
    setState(prev => ({ ...prev, workout_session: session }));
  }, []);

  const setWorkoutSummary = useCallback((completedSets: any[], duration: number) => {
    setState(prev => ({
      ...prev,
      workout_completed_sets: completedSets,
      workout_duration: duration
    }));
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
    setWorkoutSummary,
    setLoading,
    setError,
    clearError,
  };
};

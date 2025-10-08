import { useState, useCallback } from 'react';
import { AppScreen } from '../types';
import type { Program, WorkoutSession, AppState, WorkoutHistoryItem, WorkoutDetailLog } from '../types';

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
      id: sessionId,
      program_id: program.id,
      program_name: program.program_name,
      started_at: new Date().toISOString(),
      exercises: program.exercises || [],
      current_exercise_index: 0,
      logs: []
    };
    setState(prev => ({ ...prev, workout_session: session }));
  }, []);

  // ✅ ИСПРАВЛЕНО: Принимаем sessionId и обновляем session.id
  const setWorkoutSummary = useCallback((completedSets: any[], duration: number, sessionId?: string) => {
    setState(prev => ({
      ...prev,
      workout_completed_sets: completedSets,
      workout_duration: duration,
      workout_session: prev.workout_session ? {
        ...prev.workout_session,
        id: sessionId || prev.workout_session.id // ✅ Обновляем id если передан
      } : prev.workout_session
    }));
  }, []);

  const setWorkoutHistory = useCallback((history: WorkoutHistoryItem[]) => {
    setState(prev => ({ ...prev, workout_history: history }));
  }, []);

  const setCurrentWorkoutDetail = useCallback((
    detail: WorkoutDetailLog[], 
    workoutInfo: WorkoutHistoryItem
  ) => {
    setState(prev => ({ 
      ...prev, 
      current_workout_detail: detail,
      current_workout_info: workoutInfo
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
    setWorkoutHistory,
    setCurrentWorkoutDetail,
    setLoading,
    setError,
    clearError,
  };
};

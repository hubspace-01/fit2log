import { useState, useCallback } from 'react';
import type { WorkoutSession, Exercise, LogItem } from '../types';

interface SetLog {
  exercise_id: string;
  exercise_name: string;
  set_no: number;
  reps: number;
  weight: number;
  rpe: number;
  timestamp: string;
}

interface WorkoutState {
  currentExerciseIndex: number;
  completedSets: SetLog[];
  currentSet: {
    reps: number;
    weight: number;
    rpe: number;
  };
  isFinished: boolean;
}

export const useWorkout = (initialSession: WorkoutSession) => {
  const [state, setState] = useState<WorkoutState>({
    currentExerciseIndex: initialSession.current_exercise_index || 0,
    completedSets: [],
    currentSet: {
      reps: 0,
      weight: 0,
      rpe: 8
    },
    isFinished: false
  });

  const currentExercise = initialSession.exercises[state.currentExerciseIndex];
  const totalExercises = initialSession.exercises.length;

  // Инициализировать текущий сет значениями из упражнения
  const initializeCurrentSet = useCallback((exercise: Exercise) => {
    setState(prev => ({
      ...prev,
      currentSet: {
        reps: exercise.target_reps,
        weight: exercise.target_weight,
        rpe: 8
      }
    }));
  }, []);

  // Обновить значение текущего сета
  const updateCurrentSet = useCallback((field: 'reps' | 'weight' | 'rpe', value: number) => {
    setState(prev => ({
      ...prev,
      currentSet: {
        ...prev.currentSet,
        [field]: value
      }
    }));
  }, []);

  // Завершить подход
  const completeSet = useCallback(() => {
    if (!currentExercise) return null;

    const exerciseSets = state.completedSets.filter(
      set => set.exercise_id === currentExercise.id
    );
    const setNumber = exerciseSets.length + 1;

    const newSet: SetLog = {
      exercise_id: currentExercise.id,
      exercise_name: currentExercise.exercise_name,
      set_no: setNumber,
      reps: state.currentSet.reps,
      weight: state.currentSet.weight,
      rpe: state.currentSet.rpe,
      timestamp: new Date().toISOString()
    };

    setState(prev => ({
      ...prev,
      completedSets: [...prev.completedSets, newSet]
    }));

    return newSet;
  }, [currentExercise, state.completedSets, state.currentSet]);

  // Повторить последний подход
  const repeatLastSet = useCallback(() => {
    if (!currentExercise) return;

    const exerciseSets = state.completedSets.filter(
      set => set.exercise_id === currentExercise.id
    );

    if (exerciseSets.length > 0) {
      const lastSet = exerciseSets[exerciseSets.length - 1];
      setState(prev => ({
        ...prev,
        currentSet: {
          reps: lastSet.reps,
          weight: lastSet.weight,
          rpe: lastSet.rpe
        }
      }));
    }
  }, [currentExercise, state.completedSets]);

  // Следующее упражнение
  const nextExercise = useCallback(() => {
    const nextIndex = state.currentExerciseIndex + 1;

    if (nextIndex < totalExercises) {
      setState(prev => ({
        ...prev,
        currentExerciseIndex: nextIndex
      }));

      // Инициализируем следующее упражнение
      const nextEx = initialSession.exercises[nextIndex];
      if (nextEx) {
        initializeCurrentSet(nextEx);
      }

      return true;
    } else {
      // Тренировка завершена
      setState(prev => ({
        ...prev,
        isFinished: true
      }));
      return false;
    }
  }, [state.currentExerciseIndex, totalExercises, initialSession.exercises, initializeCurrentSet]);

  // Пропустить упражнение
  const skipExercise = useCallback(() => {
    return nextExercise();
  }, [nextExercise]);

  // Редактировать подход
  const editSet = useCallback((setIndex: number, updates: Partial<SetLog>) => {
    setState(prev => {
      const newSets = [...prev.completedSets];
      newSets[setIndex] = {
        ...newSets[setIndex],
        ...updates
      };
      return {
        ...prev,
        completedSets: newSets
      };
    });
  }, []);

  // Удалить подход
  const deleteSet = useCallback((setIndex: number) => {
    setState(prev => ({
      ...prev,
      completedSets: prev.completedSets.filter((_, i) => i !== setIndex)
    }));
  }, []);

  // Получить подходы для текущего упражнения
  const getCurrentExerciseSets = useCallback(() => {
    if (!currentExercise) return [];
    return state.completedSets.filter(
      set => set.exercise_id === currentExercise.id
    );
  }, [currentExercise, state.completedSets]);

  // Проверить завершено ли текущее упражнение
  const isCurrentExerciseComplete = useCallback(() => {
    if (!currentExercise) return false;
    const exerciseSets = getCurrentExerciseSets();
    return exerciseSets.length >= currentExercise.target_sets;
  }, [currentExercise, getCurrentExerciseSets]);

  // Получить все логи для сохранения в БД
  const getAllLogs = useCallback((): Partial<LogItem>[] => {
    return state.completedSets.map(set => ({
      program_id: initialSession.program_id,
      exercise_id: set.exercise_id,
      exercise_name: set.exercise_name,
      set_no: set.set_no,
      reps: set.reps,
      weight: set.weight,
      rpe: set.rpe,
      datetime: set.timestamp
    }));
  }, [state.completedSets, initialSession.program_id]);

  return {
    // State
    currentExerciseIndex: state.currentExerciseIndex,
    currentExercise,
    totalExercises,
    completedSets: state.completedSets,
    currentSet: state.currentSet,
    isFinished: state.isFinished,

    // Computed
    getCurrentExerciseSets,
    isCurrentExerciseComplete,
    getAllLogs,

    // Actions
    initializeCurrentSet,
    updateCurrentSet,
    completeSet,
    repeatLastSet,
    nextExercise,
    skipExercise,
    editSet,
    deleteSet
  };
};

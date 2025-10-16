import { useState, useCallback } from 'react';
import { supabaseService } from '../lib/supabase';
import { telegramService } from '../lib/telegram';
import type { Exercise, CompletedSet } from '../types';

interface UseSetLoggerProps {
  userId: string;
  programId: string;
  sessionId: string | null;
  currentExercise: Exercise;
  currentSetNumber: number;
  onSetCompleted: (set: CompletedSet) => void;
}

export const useSetLogger = ({
  userId,
  programId,
  sessionId,
  currentExercise,
  currentSetNumber,
  onSetCompleted
}: UseSetLoggerProps) => {
  const [saving, setSaving] = useState(false);

  const logSet = useCallback(async (data: {
    reps: number;
    weight: number;
    duration: number;
    distance: number;
  }) => {
    if (saving || !sessionId) return { success: false, error: 'Not ready' };

    const exerciseType = currentExercise.exercise_type || 'reps';

    if (exerciseType === 'reps' && data.reps <= 0) {
      return { success: false, error: 'Введите количество повторений больше 0' };
    }
    if (exerciseType === 'time' && data.duration <= 0) {
      return { success: false, error: 'Введите время больше 0 секунд' };
    }
    if (exerciseType === 'distance' && data.distance <= 0) {
      return { success: false, error: 'Введите расстояние больше 0 метров' };
    }

    const newSet: Partial<CompletedSet> = {
      exercise_id: currentExercise.id,
      exercise_name: currentExercise.exercise_name,
      set_no: currentSetNumber,
      timestamp: new Date().toISOString(),
      reps: 0,
      weight: 0,
      duration: 0,
      distance: 0
    };

    if (exerciseType === 'reps') {
      newSet.reps = data.reps;
      newSet.weight = data.weight;
    } else if (exerciseType === 'time') {
      newSet.duration = data.duration;
    } else if (exerciseType === 'distance') {
      newSet.distance = data.distance;
    }

    try {
      setSaving(true);
      telegramService.hapticFeedback('impact', 'light');

      const savedLog = await supabaseService.saveWorkoutLog({
        user_id: userId,
        program_id: programId,
        exercise_id: currentExercise.id,
        exercise_name: currentExercise.exercise_name,
        set_no: currentSetNumber,
        reps: newSet.reps || 0,
        weight: newSet.weight || 0,
        duration: newSet.duration || 0,
        distance: newSet.distance || 0,
        datetime: newSet.timestamp!,
        session_id: sessionId
      });

      newSet.id = savedLog.id;
      onSetCompleted(newSet as CompletedSet);
      
      telegramService.hapticFeedback('impact', 'light');
      return { success: true, set: newSet as CompletedSet };

    } catch (error) {
      telegramService.hapticFeedback('impact', 'heavy');
      return { success: false, error: 'Ошибка сохранения. Попробуйте ещё раз' };
    } finally {
      setSaving(false);
    }
  }, [saving, sessionId, currentExercise, currentSetNumber, userId, programId, onSetCompleted]);

  const updateSet = useCallback(async (setId: string, updates: {
    reps?: number;
    weight?: number;
    duration?: number;
    distance?: number;
  }) => {
    try {
      await supabaseService.updateWorkoutLog(setId, updates);
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Ошибка обновления подхода' };
    }
  }, []);

  return {
    saving,
    logSet,
    updateSet
  };
};

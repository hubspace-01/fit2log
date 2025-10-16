import { useState, useCallback, useEffect } from 'react';
import type { Exercise, CompletedSet } from '../types';

interface UseExerciseNavigationProps {
  exercises: Exercise[];
  completedSets: CompletedSet[];
  sessionLogs?: any[];
}

export const useExerciseNavigation = ({
  exercises,
  completedSets,
  sessionLogs = []
}: UseExerciseNavigationProps) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [extraSets, setExtraSets] = useState<Map<string, number>>(new Map());
  const [skippedSets, setSkippedSets] = useState<Set<string>>(new Set());

  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;

  useEffect(() => {
    if (sessionLogs.length > 0) {
      const lastLog = sessionLogs[sessionLogs.length - 1];
      const lastExerciseId = lastLog.exercise_id;
      
      const lastExerciseIndex = exercises.findIndex(
        ex => ex.id === lastExerciseId
      );
      
      if (lastExerciseIndex !== -1) {
        const setsForLastEx = sessionLogs.filter(l => l.exercise_id === lastExerciseId).length;
        const exercise = exercises[lastExerciseIndex];
        const targetSets = exercise.target_sets;
        const extraForExercise = extraSets.get(exercise.id) || 0;
        const totalSetsForExercise = targetSets + extraForExercise;
        
        if (setsForLastEx >= totalSetsForExercise && lastExerciseIndex < exercises.length - 1) {
          setCurrentExerciseIndex(lastExerciseIndex + 1);
        } else {
          setCurrentExerciseIndex(lastExerciseIndex);
        }
      }
    }
  }, [sessionLogs, exercises]);

  const exerciseCompletedSets = completedSets.filter(
    set => set.exercise_id === currentExercise?.id
  );

  const exerciseSkippedCount = Array.from(skippedSets).filter(
    key => key.startsWith(`${currentExercise?.id}_`)
  ).length;

  const exerciseExtraSets = extraSets.get(currentExercise?.id || '') || 0;
  const effectiveTargetSets = (currentExercise?.target_sets || 0) + exerciseExtraSets;
  
  const currentSetNumber = exerciseCompletedSets.length + exerciseSkippedCount + 1;
  const isLastSetOfExercise = currentSetNumber > effectiveTargetSets;

  const addExtraSet = useCallback(() => {
    if (!currentExercise) return;
    const current = extraSets.get(currentExercise.id) || 0;
    setExtraSets(new Map(extraSets.set(currentExercise.id, current + 1)));
  }, [currentExercise, extraSets]);

  const skipCurrentSet = useCallback(() => {
    if (!currentExercise) return;
    const skipKey = `${currentExercise.id}_${currentSetNumber}`;
    setSkippedSets(prev => new Set([...prev, skipKey]));
  }, [currentExercise, currentSetNumber]);

  const goToNextExercise = useCallback(() => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setSkippedSets(new Set());
    }
  }, [currentExerciseIndex, totalExercises]);

  const isLastExercise = currentExerciseIndex === totalExercises - 1;

  return {
    currentExercise,
    currentExerciseIndex,
    totalExercises,
    exerciseCompletedSets,
    currentSetNumber,
    effectiveTargetSets,
    isLastSetOfExercise,
    isLastExercise,
    addExtraSet,
    skipCurrentSet,
    goToNextExercise
  };
};

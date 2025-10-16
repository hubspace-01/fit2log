import { useState, useEffect } from 'react';
import { supabaseService } from '../lib/supabase';
import { normalizeExerciseName } from '../lib/personalRecords';
import type { PersonalRecord, Exercise } from '../types';

export const usePersonalRecords = (
  userId: string,
  currentExercise: Exercise | undefined
) => {
  const [currentExercisePR, setCurrentExercisePR] = useState<PersonalRecord | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadPR = async () => {
      if (!currentExercise || !userId) return;

      try {
        setLoading(true);
        const prs = await supabaseService.getPersonalRecords(userId);
        const normalizedName = normalizeExerciseName(currentExercise.exercise_name);
        const exerciseType = currentExercise.exercise_type || 'reps';
        
        const pr = prs.find(p => 
          normalizeExerciseName(p.exercise_name) === normalizedName &&
          p.exercise_type === exerciseType
        );
        
        setCurrentExercisePR(pr || null);
      } catch (error) {
        setCurrentExercisePR(null);
      } finally {
        setLoading(false);
      }
    };

    loadPR();
  }, [currentExercise, userId]);

  return { currentExercisePR, loading };
};

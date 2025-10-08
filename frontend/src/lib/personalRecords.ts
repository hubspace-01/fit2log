import type { LogItem, Exercise, PersonalRecord, ExerciseType, NewRecordSummary } from '../types';
import { supabaseService } from './supabase';

export function normalizeExerciseName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/ё/g, 'е');
}

export function determineExerciseType(log: LogItem, exercises?: Exercise[]): ExerciseType {
  if (exercises && log.exercise_id) {
    const exercise = exercises.find(e => e.id === log.exercise_id);
    if (exercise?.exercise_type) {
      return exercise.exercise_type;
    }
  }
  
  if ((log.duration || 0) > 0 && log.reps === 0) return 'time';
  if ((log.distance || 0) > 0 && log.reps === 0) return 'distance';
  return 'reps';
}

export function calculate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  
  const effectiveReps = Math.min(reps, 12);
  const oneRM = weight * (36 / (37 - effectiveReps));
  
  return Math.round(oneRM * 10) / 10;
}

interface ExerciseGroup {
  exercise_name: string;
  exercise_type: ExerciseType;
  logs: LogItem[];
}

export function groupLogsByExercise(logs: LogItem[], exercises?: Exercise[]): ExerciseGroup[] {
  const groups = new Map<string, ExerciseGroup>();
  
  logs.forEach(log => {
    const normalizedName = normalizeExerciseName(log.exercise_name);
    const exerciseType = determineExerciseType(log, exercises);
    
    if (!groups.has(normalizedName)) {
      groups.set(normalizedName, {
        exercise_name: log.exercise_name,
        exercise_type: exerciseType,
        logs: []
      });
    }
    
    groups.get(normalizedName)!.logs.push(log);
  });
  
  return Array.from(groups.values());
}

export function findAllBestPerformances(group: ExerciseGroup): LogItem[] {
  if (group.logs.length === 0) return [];
  
  if (group.exercise_type === 'time') {
    const best = group.logs.reduce((prev, curr) => 
      (curr.duration || 0) > (prev.duration || 0) ? curr : prev
    );
    return [best];
  }
  
  if (group.exercise_type === 'distance') {
    const best = group.logs.reduce((prev, curr) => 
      (curr.distance || 0) > (prev.distance || 0) ? curr : prev
    );
    return [best];
  }
  
  const byReps = new Map<number, LogItem[]>();
  
  group.logs.forEach(log => {
    if (log.reps > 0 && log.weight > 0) {
      if (!byReps.has(log.reps)) {
        byReps.set(log.reps, []);
      }
      byReps.get(log.reps)!.push(log);
    }
  });
  
  const bestPerformances: LogItem[] = [];
  byReps.forEach(logsForReps => {
    const best = logsForReps.reduce((prev, curr) => 
      curr.weight > prev.weight ? curr : prev
    );
    bestPerformances.push(best);
  });
  
  return bestPerformances;
}

export function createRecordData(
  log: LogItem,
  userId: string,
  sessionId: string,
  exerciseType: ExerciseType,
  previousRecordId?: string
): Partial<PersonalRecord> {
  const normalizedName = normalizeExerciseName(log.exercise_name);
  
  const baseData = {
    user_id: userId,
    exercise_name: normalizedName,
    exercise_type: exerciseType,
    achieved_at: log.datetime,
    session_id: sessionId,
    log_id: log.id,
    is_current: true,
    previous_record_id: previousRecordId
  };
  
  if (exerciseType === 'reps') {
    return {
      ...baseData,
      record_weight: log.weight,
      record_reps: log.reps,
      estimated_1rm: calculate1RM(log.weight, log.reps)
    };
  } else if (exerciseType === 'time') {
    return {
      ...baseData,
      record_duration: log.duration
    };
  } else if (exerciseType === 'distance') {
    return {
      ...baseData,
      record_distance: log.distance
    };
  }
  
  return baseData;
}

export function formatRecordValue(record: PersonalRecord): string {
  if (record.exercise_type === 'reps') {
    return `${record.record_weight}кг × ${record.record_reps}`;
  } else if (record.exercise_type === 'time') {
    return `${record.record_duration}сек`;
  } else if (record.exercise_type === 'distance') {
    return `${record.record_distance}м`;
  }
  return '';
}

export function calculateImprovement(
  newRecord: PersonalRecord,
  oldRecord: PersonalRecord
): number {
  if (newRecord.exercise_type === 'reps') {
    const oldWeight = oldRecord.record_weight || 0;
    const newWeight = newRecord.record_weight || 0;
    if (oldWeight === 0) return 0;
    return Math.round(((newWeight - oldWeight) / oldWeight) * 100);
  } else if (newRecord.exercise_type === 'time') {
    const oldDuration = oldRecord.record_duration || 0;
    const newDuration = newRecord.record_duration || 0;
    if (oldDuration === 0) return 0;
    return Math.round(((newDuration - oldDuration) / oldDuration) * 100);
  } else if (newRecord.exercise_type === 'distance') {
    const oldDistance = oldRecord.record_distance || 0;
    const newDistance = newRecord.record_distance || 0;
    if (oldDistance === 0) return 0;
    return Math.round(((newDistance - oldDistance) / oldDistance) * 100);
  }
  return 0;
}

export async function processWorkoutRecords(
  sessionId: string,
  userId: string,
  exercises?: any[]
): Promise<NewRecordSummary[]> {
  try {
    const logs = await supabaseService.getSessionLogs(sessionId);
    if (logs.length === 0) {
      return [];
    }

    const exerciseGroups = groupLogsByExercise(logs, exercises);
    const allCurrentPRs = await supabaseService.getPersonalRecords(userId);
    const newRecords: NewRecordSummary[] = [];

    for (const group of exerciseGroups) {
      const normalizedName = normalizeExerciseName(group.exercise_name);
      const bestPerformances = findAllBestPerformances(group);
      
      for (const bestLog of bestPerformances) {
        const currentPR = allCurrentPRs.find(pr => 
          normalizeExerciseName(pr.exercise_name) === normalizedName &&
          pr.exercise_type === group.exercise_type &&
          (group.exercise_type !== 'reps' || pr.record_reps === bestLog.reps)
        );

        let isNewRecord = false;
        
        if (!currentPR) {
          isNewRecord = true;
        } else if (group.exercise_type === 'reps') {
          isNewRecord = bestLog.weight > (currentPR.record_weight || 0);
        } else if (group.exercise_type === 'time') {
          isNewRecord = (bestLog.duration || 0) > (currentPR.record_duration || 0);
        } else if (group.exercise_type === 'distance') {
          isNewRecord = (bestLog.distance || 0) > (currentPR.record_distance || 0);
        }

        if (isNewRecord) {
          if (currentPR) {
            await supabaseService.updatePersonalRecord(currentPR.id, {
              is_current: false
            });
          }

          const recordData = createRecordData(
            bestLog,
            userId,
            sessionId,
            group.exercise_type,
            currentPR?.id
          );

          const savedRecord = await supabaseService.savePersonalRecord(recordData);

          const summary: NewRecordSummary = {
            exercise_name: group.exercise_name,
            exercise_type: group.exercise_type,
            new_value: formatRecordValue(savedRecord),
            old_value: currentPR ? formatRecordValue(currentPR) : undefined,
            improvement_percent: currentPR ? calculateImprovement(savedRecord, currentPR) : undefined,
            record: savedRecord
          };

          newRecords.push(summary);
        }
      }
    }

    return newRecords;
  } catch (error) {
    throw error;
  }
}

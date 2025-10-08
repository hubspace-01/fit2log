import type { LogItem, Exercise, PersonalRecord, ExerciseType, NewRecordSummary } from '../types';

/**
 * Нормализация названия упражнения для сравнения
 */
export function normalizeExerciseName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/ё/g, 'е');
}

/**
 * Определение типа упражнения из лога
 */
export function determineExerciseType(log: LogItem, exercises?: Exercise[]): ExerciseType {
  // Попытка найти в exercises
  if (exercises && log.exercise_id) {
    const exercise = exercises.find(e => e.id === log.exercise_id);
    if (exercise?.exercise_type) {
      return exercise.exercise_type;
    }
  }
  
  // Fallback: определяем по данным
  if ((log.duration || 0) > 0 && log.reps === 0) return 'time';
  if ((log.distance || 0) > 0 && log.reps === 0) return 'distance';
  return 'reps';
}

/**
 * Расчёт 1RM по формуле Brzycki
 */
export function calculate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  
  // Формула работает до 12 повторений
  const effectiveReps = Math.min(reps, 12);
  const oneRM = weight * (36 / (37 - effectiveReps));
  
  return Math.round(oneRM * 10) / 10;
}

/**
 * Группировка логов по упражнениям
 */
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
        exercise_name: log.exercise_name, // Оригинальное название
        exercise_type: exerciseType,
        logs: []
      });
    }
    
    groups.get(normalizedName)!.logs.push(log);
  });
  
  return Array.from(groups.values());
}

/**
 * Поиск лучшего результата в группе логов
 */
export function findBestPerformance(group: ExerciseGroup): LogItem | null {
  if (group.logs.length === 0) return null;
  
  const { exercise_type, logs } = group;
  
  if (exercise_type === 'reps') {
    // Группируем по количеству повторений
    const byReps = new Map<number, LogItem[]>();
    
    logs.forEach(log => {
      if (log.reps > 0) {
        if (!byReps.has(log.reps)) {
          byReps.set(log.reps, []);
        }
        byReps.get(log.reps)!.push(log);
      }
    });
    
    // Для каждого диапазона повторений находим максимальный вес
    const bestByReps: LogItem[] = [];
    byReps.forEach(logsForReps => {
      const best = logsForReps.reduce((prev, curr) => 
        curr.weight > prev.weight ? curr : prev
      );
      bestByReps.push(best);
    });
    
    return bestByReps.length > 0 ? bestByReps[0] : null;
    
  } else if (exercise_type === 'time') {
    // Максимальное время
    return logs.reduce((prev, curr) => 
      (curr.duration || 0) > (prev.duration || 0) ? curr : prev
    );
    
  } else if (exercise_type === 'distance') {
    // Максимальная дистанция
    return logs.reduce((prev, curr) => 
      (curr.distance || 0) > (prev.distance || 0) ? curr : prev
    );
  }
  
  return null;
}

/**
 * Поиск ВСЕХ лучших результатов по диапазонам повторений
 */
export function findAllBestPerformances(group: ExerciseGroup): LogItem[] {
  if (group.logs.length === 0 || group.exercise_type !== 'reps') {
    const best = findBestPerformance(group);
    return best ? [best] : [];
  }
  
  // Группируем по reps
  const byReps = new Map<number, LogItem[]>();
  
  group.logs.forEach(log => {
    if (log.reps > 0 && log.weight > 0) {
      if (!byReps.has(log.reps)) {
        byReps.set(log.reps, []);
      }
      byReps.get(log.reps)!.push(log);
    }
  });
  
  // Находим лучший для каждого диапазона
  const bestPerformances: LogItem[] = [];
  byReps.forEach(logsForReps => {
    const best = logsForReps.reduce((prev, curr) => 
      curr.weight > prev.weight ? curr : prev
    );
    bestPerformances.push(best);
  });
  
  return bestPerformances;
}

/**
 * Сравнение результата с текущим рекордом
 */
export function compareWithRecord(
  log: LogItem,
  currentRecord: PersonalRecord | null
): boolean {
  if (!currentRecord) return true; // Первый рекорд
  
  const exerciseType = currentRecord.exercise_type;
  
  if (exerciseType === 'reps') {
    // Сравниваем только при одинаковых reps
    if (log.reps === currentRecord.record_reps) {
      return log.weight > (currentRecord.record_weight || 0);
    }
    // Разное количество повторений - это новый рекорд в другом диапазоне
    return true;
    
  } else if (exerciseType === 'time') {
    return (log.duration || 0) > (currentRecord.record_duration || 0);
    
  } else if (exerciseType === 'distance') {
    return (log.distance || 0) > (currentRecord.record_distance || 0);
  }
  
  return false;
}

/**
 * Формирование данных для нового рекорда
 */
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

/**
 * Форматирование значения рекорда для отображения
 */
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

/**
 * Вычисление процента улучшения
 */
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

/**
 * ==========================================
 * Главная функция: Обработка Personal Records после тренировки
 * ==========================================
 */

import { supabaseService } from './supabase';
import type { NewRecordSummary } from '../types';

export async function processWorkoutRecords(
  sessionId: string,
  userId: string,
  exercises?: any[]
): Promise<NewRecordSummary[]> {
  try {
    console.log('🔍 Processing workout records for session:', sessionId);

    // 1. Получаем все логи сессии
    const logs = await supabaseService.getSessionLogs(sessionId);
    if (logs.length === 0) {
      console.log('⚠️ No logs found for session');
      return [];
    }

    console.log(`✅ Found ${logs.length} logs`);

    // 2. Группируем по упражнениям
    const exerciseGroups = groupLogsByExercise(logs, exercises);
    console.log(`✅ Grouped into ${exerciseGroups.length} exercises`);

    // 3. Получаем ВСЕ текущие PR пользователя (batch)
    const allCurrentPRs = await supabaseService.getPersonalRecords(userId);
    console.log(`✅ Found ${allCurrentPRs.length} current PRs`);

    // 4. Обрабатываем каждое упражнение
    const newRecords: NewRecordSummary[] = [];

    for (const group of exerciseGroups) {
      const normalizedName = normalizeExerciseName(group.exercise_name);
      
      // Находим все лучшие результаты в группе (по диапазонам reps)
      const bestPerformances = findAllBestPerformances(group);
      
      for (const bestLog of bestPerformances) {
        // Ищем текущий PR для этого упражнения и диапазона
        const currentPR = allCurrentPRs.find(pr => 
          normalizeExerciseName(pr.exercise_name) === normalizedName &&
          pr.exercise_type === group.exercise_type &&
          (group.exercise_type !== 'reps' || pr.record_reps === bestLog.reps)
        );

        // Проверяем - новый рекорд?
        const isNewRecord = compareWithRecord(bestLog, currentPR);

        if (isNewRecord) {
          console.log(`🎉 New record found: ${group.exercise_name}`, bestLog);

          // Если есть старый рекорд - помечаем как неактуальный
          if (currentPR) {
            await supabaseService.updatePersonalRecord(currentPR.id, {
              is_current: false
            });
          }

          // Создаём новый рекорд
          const recordData = createRecordData(
            bestLog,
            userId,
            sessionId,
            group.exercise_type,
            currentPR?.id
          );

          const savedRecord = await supabaseService.savePersonalRecord(recordData);
          console.log('✅ Record saved:', savedRecord.id);

          // Добавляем в результаты
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

    console.log(`✅ Processing complete. ${newRecords.length} new records.`);
    return newRecords;

  } catch (error) {
    console.error('❌ Error processing workout records:', error);
    throw error;
  }
}

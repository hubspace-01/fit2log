import React, { useEffect, useMemo } from 'react';
import { Section, Cell, Title, Caption, Text, Button } from '@telegram-apps/telegram-ui';
import { telegramService } from '../lib/telegram';

interface SetLog {
  exercise_id: string;
  exercise_name: string;
  set_no: number;
  reps: number;
  weight: number;
  rpe: number;
  timestamp: string;
}

interface WorkoutSummaryProps {
  programName: string;
  completedSets: SetLog[];
  duration: number; // в секундах
  totalExercises: number;
  onFinish: () => void;
}

export const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({
  programName,
  completedSets,
  duration,
  totalExercises,
  onFinish
}) => {
  // Убираем BackButton на экране итогов
  useEffect(() => {
    telegramService.hideBackButton();
  }, []);

  // Расчёт статистики
  const stats = useMemo(() => {
    const totalSets = completedSets.length;
    
    // Общий вес (сумма reps * weight для всех подходов)
    const totalWeight = completedSets.reduce((sum, set) => 
      sum + (set.reps * set.weight), 0
    );

    // Группировка по упражнениям
    const exerciseMap = new Map<string, SetLog[]>();
    completedSets.forEach(set => {
      const existing = exerciseMap.get(set.exercise_id) || [];
      exerciseMap.set(set.exercise_id, [...existing, set]);
    });

    // Статистика по каждому упражнению
    const exerciseStats = Array.from(exerciseMap.values()).map(sets => {
      const totalReps = sets.reduce((sum, set) => sum + set.reps, 0);
      const maxWeight = Math.max(...sets.map(set => set.weight));
      
      return {
        name: sets[0].exercise_name,
        sets: sets.length,
        totalReps,
        maxWeight
      };
    });

    const completedExercises = exerciseMap.size;

    return {
      totalSets,
      totalWeight,
      completedExercises,
      exerciseStats
    };
  }, [completedSets]);

  // Форматирование времени
  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h}ч ${m}м ${s}с`;
    } else if (m > 0) {
      return `${m}м ${s}с`;
    } else {
      return `${s}с`;
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      paddingBottom: '40px',
      backgroundColor: 'var(--tg-theme-bg-color)'
    }}>
      {/* Header с celebration */}
      <div style={{
        padding: '32px 16px 24px',
        textAlign: 'center',
        backgroundColor: 'var(--tg-theme-secondary-bg-color)'
      }}>
        <div style={{ 
          fontSize: '48px', 
          marginBottom: '16px',
          lineHeight: '1'
        }}>
          🎉 🏋️ 🎉
        </div>
        <Title level="1" weight="2" style={{ fontSize: '28px', marginBottom: '8px' }}>
          Тренировка завершена!
        </Title>
        <Caption level="1" style={{ fontSize: '15px', color: 'var(--tg-theme-hint-color)' }}>
          {programName}
        </Caption>
      </div>

      {/* Статистика */}
      <Section header="📊 Статистика">
        <Cell
          before="⏱"
          subtitle={formatDuration(duration)}
        >
          Длительность
        </Cell>
        
        <Cell
          before="💪"
          subtitle={`${stats.completedExercises} из ${totalExercises}`}
        >
          Упражнений
        </Cell>

        <Cell
          before="📈"
          subtitle={`${stats.totalSets} ${stats.totalSets === 1 ? 'подход' : stats.totalSets < 5 ? 'подхода' : 'подходов'}`}
        >
          Подходов выполнено
        </Cell>

        <Cell
          before="��️"
          subtitle={`${Math.round(stats.totalWeight)} кг`}
        >
          Общий вес
        </Cell>
      </Section>

      {/* Список упражнений */}
      <Section header="💪 Упражнения">
        {stats.exerciseStats.map((exercise, index) => (
          <Cell
            key={index}
            subtitle={
              <div>
                <div>{exercise.sets} {exercise.sets === 1 ? 'подход' : exercise.sets < 5 ? 'подхода' : 'подходов'} • {exercise.totalReps} {exercise.totalReps === 1 ? 'повторение' : exercise.totalReps < 5 ? 'повторения' : 'повторений'}</div>
                {exercise.maxWeight > 0 && (
                  <Caption level="1" style={{ marginTop: '4px' }}>
                    Макс вес: {exercise.maxWeight} кг
                  </Caption>
                )}
              </div>
            }
          >
            {index + 1}. {exercise.name}
          </Cell>
        ))}
      </Section>

      {/* Кнопка завершения */}
      <div style={{ padding: '24px 16px' }}>
        <Button
          size="l"
          stretched
          mode="filled"
          onClick={onFinish}
          style={{ fontSize: '16px' }}
        >
          ✅ Завершить тренировку
        </Button>
      </div>
    </div>
  );
};

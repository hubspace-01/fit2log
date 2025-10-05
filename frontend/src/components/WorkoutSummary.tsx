import React, { useEffect, useMemo } from 'react';
import { Section, Cell, Title, Caption, Button, Card } from '@telegram-apps/telegram-ui';
import { telegramService } from '../lib/telegram';

interface SetLog {
  exercise_id: string;
  exercise_name: string;
  set_no: number;
  reps: number;
  weight: number;
  rpe?: number;
  duration?: number;
  distance?: number;
  timestamp: string;
}

interface WorkoutSummaryProps {
  programName: string;
  completedSets: SetLog[];
  duration: number;
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
  useEffect(() => {
    telegramService.hideBackButton();
  }, []);

  const stats = useMemo(() => {
    const totalSets = completedSets.length;
    
    const repsSets = completedSets.filter(s => s.reps > 0);
    const timeSets = completedSets.filter(s => (s.duration || 0) > 0);
    const distanceSets = completedSets.filter(s => (s.distance || 0) > 0);

    const totalWeight = repsSets.reduce((sum, set) => 
      sum + (set.reps * set.weight), 0
    );

    const totalTimeUnderTension = timeSets.reduce((sum, set) =>
      sum + (set.duration || 0), 0
    );

    const totalDistance = distanceSets.reduce((sum, set) =>
      sum + (set.distance || 0), 0
    );

    const exerciseMap = new Map<string, SetLog[]>();
    completedSets.forEach(set => {
      const existing = exerciseMap.get(set.exercise_id) || [];
      exerciseMap.set(set.exercise_id, [...existing, set]);
    });

    const exerciseStats = Array.from(exerciseMap.values()).map(sets => {
      const firstSet = sets[0];
      const isTime = sets.some(s => (s.duration || 0) > 0);
      const isDistance = sets.some(s => (s.distance || 0) > 0);

      let type: 'reps' | 'time' | 'distance' = 'reps';
      if (isTime) type = 'time';
      else if (isDistance) type = 'distance';

      const totalReps = sets.reduce((sum, set) => sum + set.reps, 0);
      const maxWeight = Math.max(...sets.map(set => set.weight));
      const totalDuration = sets.reduce((sum, set) => sum + (set.duration || 0), 0);
      const totalDist = sets.reduce((sum, set) => sum + (set.distance || 0), 0);
      
      return {
        name: firstSet.exercise_name,
        sets: sets.length,
        type,
        totalReps,
        maxWeight,
        totalDuration,
        totalDistance: totalDist
      };
    });

    const completedExercises = exerciseMap.size;

    return {
      totalSets,
      totalWeight,
      totalTimeUnderTension,
      totalDistance,
      completedExercises,
      exerciseStats,
      repsCount: repsSets.length,
      timeCount: timeSets.length,
      distanceCount: distanceSets.length
    };
  }, [completedSets]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) return `${h}ч ${m}м`;
    else if (m > 0) return `${m}м ${s}с`;
    else return `${s}с`;
  };

  const celebrationTitles = [
    'Отличная работа!',
    'Круто!',
    'Огонь!',
    'Отлично!',
    'Браво!',
    'Превосходно!'
  ];
  const randomTitle = celebrationTitles[Math.floor(Math.random() * celebrationTitles.length)];

  const getTypeIcon = (type: string) => {
    if (type === 'time') return '⏱';
    if (type === 'distance') return '🏃';
    return '💪';
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      paddingBottom: '40px',
      backgroundColor: 'var(--tg-theme-bg-color)'
    }}>
      {/* ✅ ИСПРАВЛЕНО: Старый стиль header без gradient */}
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
          �� 🏋️ 🎉
        </div>
        <Title level="1" weight="2" style={{ fontSize: '28px', marginBottom: '8px' }}>
          {randomTitle}
        </Title>
        <Caption level="1" style={{ fontSize: '15px', color: 'var(--tg-theme-hint-color)' }}>
          {programName}
        </Caption>
      </div>

      {/* Grid Stats Cards (2x2) */}
      <div style={{ 
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px'
      }}>
        {/* Card 1: Время */}
        <Card style={{
          padding: '16px',
          textAlign: 'center',
          background: 'var(--tg-theme-secondary-bg-color)',
          border: '1px solid var(--tg-theme-section-separator-color)',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏱</div>
          <Title level="3" weight="2" style={{ fontSize: '20px', marginBottom: '4px' }}>
            {formatDuration(duration)}
          </Title>
          <Caption level="1" style={{ fontSize: '13px' }}>
            Длительность
          </Caption>
        </Card>

        {/* Card 2: Упражнения */}
        <Card style={{
          padding: '16px',
          textAlign: 'center',
          background: 'var(--tg-theme-secondary-bg-color)',
          border: '1px solid var(--tg-theme-section-separator-color)',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>💪</div>
          <Title level="3" weight="2" style={{ fontSize: '20px', marginBottom: '4px' }}>
            {stats.completedExercises}/{totalExercises}
          </Title>
          <Caption level="1" style={{ fontSize: '13px' }}>
            Упражнений
          </Caption>
        </Card>

        {/* Card 3: Подходы */}
        <Card style={{
          padding: '16px',
          textAlign: 'center',
          background: 'var(--tg-theme-secondary-bg-color)',
          border: '1px solid var(--tg-theme-section-separator-color)',
          borderRadius: '12px'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📈</div>
          <Title level="3" weight="2" style={{ fontSize: '20px', marginBottom: '4px' }}>
            {stats.totalSets}
          </Title>
          <Caption level="1" style={{ fontSize: '13px' }}>
            Подходов
          </Caption>
        </Card>

        {/* ✅ НОВОЕ: Card 4 - Умная метрика с деталями */}
        <Card style={{
          padding: '16px',
          textAlign: 'center',
          background: 'var(--tg-theme-secondary-bg-color)',
          border: '1px solid var(--tg-theme-section-separator-color)',
          borderRadius: '12px'
        }}>
          {/* Если только один тип - показываем его крупно */}
          {stats.repsCount > 0 && stats.timeCount === 0 && stats.distanceCount === 0 && (
            <>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏋️</div>
              <Title level="3" weight="2" style={{ fontSize: '20px', marginBottom: '4px' }}>
                {Math.round(stats.totalWeight)} кг
              </Title>
              <Caption level="1" style={{ fontSize: '11px', color: 'var(--tg-theme-hint-color)' }}>
                из {stats.repsCount} reps подх.
              </Caption>
            </>
          )}
          
          {stats.timeCount > 0 && stats.repsCount === 0 && stats.distanceCount === 0 && (
            <>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏱</div>
              <Title level="3" weight="2" style={{ fontSize: '20px', marginBottom: '4px' }}>
                {formatDuration(stats.totalTimeUnderTension)}
              </Title>
              <Caption level="1" style={{ fontSize: '11px', color: 'var(--tg-theme-hint-color)' }}>
                из {stats.timeCount} time подх.
              </Caption>
            </>
          )}
          
          {stats.distanceCount > 0 && stats.repsCount === 0 && stats.timeCount === 0 && (
            <>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏃</div>
              <Title level="3" weight="2" style={{ fontSize: '20px', marginBottom: '4px' }}>
                {stats.totalDistance} м
              </Title>
              <Caption level="1" style={{ fontSize: '11px', color: 'var(--tg-theme-hint-color)' }}>
                из {stats.distanceCount} distance подх.
              </Caption>
            </>
          )}

          {/* ✅ НОВОЕ: Если смешанная тренировка - показываем все компактно */}
          {((stats.repsCount > 0 && stats.timeCount > 0) ||
            (stats.repsCount > 0 && stats.distanceCount > 0) ||
            (stats.timeCount > 0 && stats.distanceCount > 0)) && (
            <>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📊</div>
              <div style={{ 
                fontSize: '12px', 
                lineHeight: '1.6',
                color: 'var(--tg-theme-text-color)'
              }}>
                {stats.totalWeight > 0 && (
                  <div>🏋️ {Math.round(stats.totalWeight)} кг</div>
                )}
                {stats.totalTimeUnderTension > 0 && (
                  <div>⏱ {formatDuration(stats.totalTimeUnderTension)}</div>
                )}
                {stats.totalDistance > 0 && (
                  <div>🏃 {stats.totalDistance} м</div>
                )}
              </div>
              <Caption level="1" style={{ fontSize: '11px', color: 'var(--tg-theme-hint-color)', marginTop: '4px' }}>
                Смешанная тренировка
              </Caption>
            </>
          )}
        </Card>
      </div>

      {/* ✅ ИСПРАВЛЕНО: Header по центру */}
      <Section 
        header={
          <div style={{ textAlign: 'center', width: '100%', padding: '8px 0' }}>
            💪 ДЕТАЛИ УПРАЖНЕНИЙ
          </div>
        }
        style={{ marginTop: '16px' }}
      >
        {stats.exerciseStats.map((exercise, index) => {
          let subtitle = '';
          
          if (exercise.type === 'reps') {
            subtitle = `${exercise.sets} × ${exercise.totalReps} повт`;
            if (exercise.maxWeight > 0) {
              subtitle += ` • ${exercise.maxWeight} кг`;
            }
          } else if (exercise.type === 'time') {
            subtitle = `${exercise.sets} подхода • ${formatDuration(exercise.totalDuration)}`;
          } else if (exercise.type === 'distance') {
            subtitle = `${exercise.totalDistance} м`;
          }

          return (
            <Cell
              key={index}
              before={
                <div style={{
                  width: '40px',
                  height: '40px',
                  minWidth: '40px',
                  borderRadius: '50%',
                  background: exercise.type === 'reps' 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : exercise.type === 'time'
                    ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                    : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px'
                }}>
                  {getTypeIcon(exercise.type)}
                </div>
              }
              subtitle={subtitle}
            >
              {exercise.name}
            </Cell>
          );
        })}
      </Section>

      <div style={{ padding: '24px 16px' }}>
        <Button
          size="l"
          stretched
          mode="filled"
          onClick={onFinish}
          style={{ fontSize: '16px' }}
        >
          ✅ Завершить
        </Button>
      </div>
    </div>
  );
};

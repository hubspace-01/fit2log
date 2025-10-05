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
      exerciseStats
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
      <div style={{
        padding: '40px 16px 32px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, var(--tg-theme-button-color) 0%, var(--tg-theme-link-color) 100%)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '0',
          right: '0',
          fontSize: '24px',
          opacity: 0.4,
          letterSpacing: '20px',
          animation: 'fadeIn 0.5s ease-in'
        }}>
          🎉 🎊 ✨ 🏆 💪 🔥
        </div>
        
        <div style={{ 
          fontSize: '56px', 
          marginBottom: '12px',
          lineHeight: '1',
          animation: 'bounce 0.6s ease-out'
        }}>
          🎉
        </div>
        <Title level="1" weight="2" style={{ 
          fontSize: '28px', 
          marginBottom: '8px',
          color: 'white'
        }}>
          {randomTitle}
        </Title>
        <Caption level="1" style={{ 
          fontSize: '15px', 
          color: 'rgba(255,255,255,0.8)'
        }}>
          {programName}
        </Caption>
      </div>

      <div style={{ 
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginTop: '-16px'
      }}>
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

        <Card style={{
          padding: '16px',
          textAlign: 'center',
          background: 'var(--tg-theme-secondary-bg-color)',
          border: '1px solid var(--tg-theme-section-separator-color)',
          borderRadius: '12px'
        }}>
          {stats.totalWeight > 0 && (
            <>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏋️</div>
              <Title level="3" weight="2" style={{ fontSize: '20px', marginBottom: '4px' }}>
                {Math.round(stats.totalWeight)} кг
              </Title>
              <Caption level="1" style={{ fontSize: '13px' }}>
                Общий вес
              </Caption>
            </>
          )}
          {stats.totalTimeUnderTension > 0 && stats.totalWeight === 0 && (
            <>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏱</div>
              <Title level="3" weight="2" style={{ fontSize: '20px', marginBottom: '4px' }}>
                {formatDuration(stats.totalTimeUnderTension)}
              </Title>
              <Caption level="1" style={{ fontSize: '13px' }}>
                Под нагрузкой
              </Caption>
            </>
          )}
          {stats.totalDistance > 0 && stats.totalWeight === 0 && stats.totalTimeUnderTension === 0 && (
            <>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏃</div>
              <Title level="3" weight="2" style={{ fontSize: '20px', marginBottom: '4px' }}>
                {stats.totalDistance} м
              </Title>
              <Caption level="1" style={{ fontSize: '13px' }}>
                Дистанция
              </Caption>
            </>
          )}
        </Card>
      </div>

      <Section header="💪 Детали упражнений" style={{ marginTop: '16px' }}>
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 0.4; transform: translateY(0); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

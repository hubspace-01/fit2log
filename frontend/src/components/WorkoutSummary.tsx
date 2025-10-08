import React, { useEffect, useMemo, useState } from 'react';
import { Section, Cell, Title, Caption, Button, Card } from '@telegram-apps/telegram-ui';
import { 
  Trophy, 
  Dumbbell, 
  Timer, 
  Footprints, 
  TrendingUp, 
  Clock,
  Activity,
  Target,
  Award,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { telegramService } from '../lib/telegram';
import { processWorkoutRecords } from '../lib/personalRecords';
import type { NewRecordSummary } from '../types';

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
  sessionId?: string;
  userId?: string;
  onFinish: () => void;
}

export const WorkoutSummary: React.FC<WorkoutSummaryProps> = ({
  programName,
  completedSets,
  duration,
  totalExercises,
  sessionId,
  userId,
  onFinish
}) => {
  const [expandedExercises, setExpandedExercises] = useState<Set<number>>(new Set());
  const [newRecords, setNewRecords] = useState<NewRecordSummary[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);

  useEffect(() => {
    telegramService.hideBackButton();
  }, []);

  useEffect(() => {
    if (sessionId && userId) {
      const processRecords = async () => {
        try {
          setLoadingRecords(true);
          const records = await processWorkoutRecords(sessionId, userId);
          if (records.length > 0) {
            setNewRecords(records);
          }
        } catch (error) {
          
        } finally {
          setLoadingRecords(false);
        }
      };

      processRecords();
    }
  }, [sessionId, userId]);

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
        totalDistance: totalDist,
        details: sets.sort((a, b) => a.set_no - b.set_no)
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

  const toggleExercise = (index: number) => {
    const newExpanded = new Set(expandedExercises);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedExercises(newExpanded);
  };

  const activeMetrics = [
    stats.repsCount > 0 ? 'reps' : null,
    stats.timeCount > 0 ? 'time' : null,
    stats.distanceCount > 0 ? 'distance' : null
  ].filter(Boolean);

  return (
    <div style={{ 
      minHeight: '100vh',
      paddingBottom: '40px',
      backgroundColor: 'var(--tg-theme-bg-color)'
    }}>
      <div style={{
        padding: '32px 16px 24px',
        textAlign: 'center',
        backgroundColor: 'var(--tg-theme-secondary-bg-color)'
      }}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <Award size={32} color="var(--tg-theme-link-color)" />
          <Activity size={32} color="var(--tg-theme-link-color)" />
          <Trophy size={32} color="var(--tg-theme-link-color)" />
        </div>
        <Title level="1" weight="2" style={{ fontSize: '28px', marginBottom: '8px' }}>
          {randomTitle}
        </Title>
        <Caption level="1" style={{ fontSize: '15px', color: 'var(--tg-theme-hint-color)' }}>
          {programName}
        </Caption>
      </div>

      {newRecords.length > 0 && (
        <>
          <div style={{
            padding: '16px',
            margin: '16px',
            backgroundColor: 'var(--tg-theme-link-color)',
            borderRadius: '12px',
            textAlign: 'center',
            color: 'white'
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <Trophy size={20} />
              <Title level="2" weight="2" style={{ fontSize: '18px', color: 'white' }}>
                {newRecords.length} {newRecords.length === 1 ? 'НОВЫЙ РЕКОРД' : 'НОВЫХ РЕКОРДОВ'}!
              </Title>
            </div>
            <Caption level="1" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)' }}>
              Отличная тренировка!
            </Caption>
          </div>

          <Section style={{ marginTop: '0' }}>
            {newRecords.map((record, index) => {
              const isFirstRecord = !record.old_value;
              
              return (
                <Cell
                  key={index}
                  before={
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--tg-theme-link-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {record.exercise_type === 'reps' && <Dumbbell size={20} color="white" />}
                      {record.exercise_type === 'time' && <Timer size={20} color="white" />}
                      {record.exercise_type === 'distance' && <Footprints size={20} color="white" />}
                    </div>
                  }
                  subtitle={
                    <div style={{ marginTop: '4px', textAlign: 'left' }}>
                      {!isFirstRecord && record.old_value && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color)' }}>
                            было: {record.old_value}
                          </span>
                          {record.improvement_percent !== undefined && (
                            <span style={{ 
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontSize: '13px', 
                              color: 'var(--tg-theme-link-color)',
                              fontWeight: '600'
                            }}>
                              <TrendingUp size={14} />
                              +{record.improvement_percent}%
                            </span>
                          )}
                        </div>
                      )}
                      {isFirstRecord && (
                        <div style={{ 
                          fontSize: '13px', 
                          color: 'var(--tg-theme-link-color)',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}>
                          <Award size={14} />
                          Первый рекорд!
                        </div>
                      )}
                    </div>
                  }
                >
                  <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                    <span style={{ fontSize: '15px', fontWeight: '500' }}>{record.exercise_name}</span>
                    <span style={{ fontSize: '17px', fontWeight: '600', marginTop: '2px' }}>
                      {record.new_value}
                    </span>
                  </div>
                </Cell>
              );
            })}
          </Section>
        </>
      )}

      {loadingRecords && (
        <div style={{ 
          padding: '16px', 
          textAlign: 'center',
          color: 'var(--tg-theme-hint-color)',
          fontSize: '14px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px'
        }}>
          <Clock size={16} />
          Проверяем рекорды...
        </div>
      )}

      <div style={{ 
        padding: '16px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px'
      }}>
        <Card style={{
          padding: '16px',
          textAlign: 'center',
          background: 'var(--tg-theme-secondary-bg-color)',
          border: '1px solid var(--tg-theme-section-separator-color)',
          borderRadius: '12px'
        }}>
          <Clock size={28} color="var(--tg-theme-link-color)" style={{ marginBottom: '8px' }} />
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
          <Target size={28} color="var(--tg-theme-link-color)" style={{ marginBottom: '8px' }} />
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
          <Activity size={28} color="var(--tg-theme-link-color)" style={{ marginBottom: '8px' }} />
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
          {activeMetrics.length === 1 && stats.repsCount > 0 && (
            <>
              <Dumbbell size={28} color="var(--tg-theme-link-color)" style={{ marginBottom: '8px' }} />
              <Title level="3" weight="2" style={{ fontSize: '20px', marginBottom: '4px' }}>
                {Math.round(stats.totalWeight)} кг
              </Title>
              <Caption level="1" style={{ fontSize: '11px', color: 'var(--tg-theme-hint-color)' }}>
                из {stats.repsCount} подходов
              </Caption>
            </>
          )}
          
          {activeMetrics.length === 1 && stats.timeCount > 0 && (
            <>
              <Timer size={28} color="var(--tg-theme-link-color)" style={{ marginBottom: '8px' }} />
              <Title level="3" weight="2" style={{ fontSize: '20px', marginBottom: '4px' }}>
                {formatDuration(stats.totalTimeUnderTension)}
              </Title>
              <Caption level="1" style={{ fontSize: '11px', color: 'var(--tg-theme-hint-color)' }}>
                под нагрузкой
              </Caption>
            </>
          )}
          
          {activeMetrics.length === 1 && stats.distanceCount > 0 && (
            <>
              <Footprints size={28} color="var(--tg-theme-link-color)" style={{ marginBottom: '8px' }} />
              <Title level="3" weight="2" style={{ fontSize: '20px', marginBottom: '4px' }}>
                {stats.totalDistance} м
              </Title>
              <Caption level="1" style={{ fontSize: '11px', color: 'var(--tg-theme-hint-color)' }}>
                дистанция
              </Caption>
            </>
          )}

          {activeMetrics.length > 1 && (
            <>
              <Activity size={24} color="var(--tg-theme-link-color)" style={{ marginBottom: '8px' }} />
              <div style={{ 
                fontSize: '13px', 
                lineHeight: '1.8',
                color: 'var(--tg-theme-text-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}>
                {stats.totalWeight > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Dumbbell size={14} color="var(--tg-theme-link-color)" />
                    <span style={{ fontWeight: '600' }}>{Math.round(stats.totalWeight)} кг</span>
                  </div>
                )}
                {stats.totalTimeUnderTension > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Timer size={14} color="var(--tg-theme-link-color)" />
                    <span style={{ fontWeight: '600' }}>{formatDuration(stats.totalTimeUnderTension)}</span>
                  </div>
                )}
                {stats.totalDistance > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Footprints size={14} color="var(--tg-theme-link-color)" />
                    <span style={{ fontWeight: '600' }}>{stats.totalDistance} м</span>
                  </div>
                )}
              </div>
              <Caption level="1" style={{ fontSize: '11px', color: 'var(--tg-theme-hint-color)', marginTop: '6px' }}>
                Смешанная
              </Caption>
            </>
          )}
        </Card>
      </div>

      <Section 
        header="ДЕТАЛИ УПРАЖНЕНИЙ"
        style={{ marginTop: '16px' }}
      >
        {stats.exerciseStats.map((exercise, index) => {
          const isExpanded = expandedExercises.has(index);
          
          let compactSubtitle = '';
          if (exercise.type === 'reps') {
            compactSubtitle = `${exercise.sets} подходов • ${exercise.totalReps} повт`;
            if (exercise.maxWeight > 0) {
              compactSubtitle += ` • Макс: ${exercise.maxWeight} кг`;
            }
          } else if (exercise.type === 'time') {
            compactSubtitle = `${exercise.sets} подходов • ${formatDuration(exercise.totalDuration)}`;
          } else if (exercise.type === 'distance') {
            compactSubtitle = `${exercise.totalDistance} м`;
          }

          return (
            <div key={`exercise-${index}`}>
              <Cell
                onClick={() => toggleExercise(index)}
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
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {exercise.type === 'reps' && <Dumbbell size={20} color="white" />}
                    {exercise.type === 'time' && <Timer size={20} color="white" />}
                    {exercise.type === 'distance' && <Footprints size={20} color="white" />}
                  </div>
                }
                after={isExpanded ? <ChevronUp size={20} color="var(--tg-theme-hint-color)" /> : <ChevronDown size={20} color="var(--tg-theme-hint-color)" />}
                subtitle={compactSubtitle}
              >
                {exercise.name}
              </Cell>

              {isExpanded && (
                <div style={{
                  padding: '8px 16px 12px',
                  backgroundColor: 'var(--tg-theme-bg-color)',
                  borderTop: '0.5px solid var(--tg-theme-section-separator-color)'
                }}>
                  {exercise.details.map((set, setIndex) => {
                    let setInfo = '';
                    if (exercise.type === 'reps') {
                      setInfo = `${set.reps} повт × ${set.weight} кг`;
                    } else if (exercise.type === 'time') {
                      setInfo = `${set.duration}с`;
                    } else if (exercise.type === 'distance') {
                      setInfo = `${set.distance} м`;
                    }

                    return (
                      <div
                        key={setIndex}
                        style={{
                          padding: '10px 0',
                          fontSize: '14px',
                          color: 'var(--tg-theme-text-color)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: setIndex < exercise.details.length - 1 ? '0.5px solid var(--tg-theme-section-separator-color)' : 'none'
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <CheckCircle size={16} color="var(--tg-theme-link-color)" />
                          <span style={{ fontSize: '15px' }}>Подход {set.set_no}</span>
                        </span>
                        <span style={{ fontWeight: '600', fontSize: '15px' }}>{setInfo}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
          Завершить
        </Button>
      </div>
    </div>
  );
};

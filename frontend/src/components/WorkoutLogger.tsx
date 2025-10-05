import React, { useState, useEffect, useRef } from 'react';
import { Section, Cell, Title, Caption, Text, Button, Divider } from '@telegram-apps/telegram-ui';
import { telegramService } from '../lib/telegram';
import { supabaseService } from '../lib/supabase';
import { Stepper } from './Stepper';
import type { WorkoutSession } from '../types';

interface WorkoutLoggerProps {
  session: WorkoutSession;
  userId: string;
  onFinish: (completedSets: any[], duration: number) => void;
  onCancel: () => void;
}

export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({
  session,
  userId,
  onFinish,
  onCancel
}) => {
  const [sessionId, setSessionId] = useState<string | null>(session.id || null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [completedSets, setCompletedSets] = useState<any[]>([]);
  const [skippedSets, setSkippedSets] = useState<Set<string>>(new Set());
  const [extraSets, setExtraSets] = useState<Map<string, number>>(new Map());
  
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);
  const [rpe, setRpe] = useState(8);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  
  const [elapsedTime, setElapsedTime] = useState(0);
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const startTimeRef = useRef(new Date(session.started_at).getTime());
  const sessionIdRef = useRef<string | null>(null);
  
  const currentExercise = session.exercises[currentExerciseIndex];
  const totalExercises = session.exercises.length;
  
  const exerciseCompletedSets = completedSets.filter(
    set => set.exercise_id === currentExercise?.id
  );
  
  const exerciseSkippedCount = Array.from(skippedSets).filter(
    key => key.startsWith(`${currentExercise?.id}_`)
  ).length;
  
  const exerciseExtraSets = extraSets.get(currentExercise?.id || '') || 0;
  const effectiveTargetSets = (currentExercise?.target_sets || 0) + exerciseExtraSets;
  
  const currentSetNumber = exerciseCompletedSets.length + exerciseSkippedCount + 1;
  const isLastSetOfExercise = currentSetNumber >= effectiveTargetSets;

  const exerciseType = currentExercise?.exercise_type || 'reps';

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  // ✅ НОВОЕ: Сразу переопределяем BackButton при монтировании
  useEffect(() => {
    const handleBack = () => {
      telegramService.showConfirm(
        'Отменить тренировку? Прогресс будет сохранён.',
        async (confirmed: boolean) => {
          if (confirmed) {
            try {
              if (sessionIdRef.current) {
                const currentElapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                await supabaseService.updateWorkoutSession(sessionIdRef.current, {
                  status: 'cancelled',
                  completed_at: new Date().toISOString(),
                  total_duration: currentElapsed
                });
                console.log('✅ Session marked as cancelled');
              }
            } catch (error) {
              console.error('❌ Cancel session error:', error);
            } finally {
              onCancel();
            }
          }
        }
      );
    };

    // Переопределяем обработчик сразу без скрытия кнопки
    telegramService.showBackButton(handleBack);

    return () => {
      // Не скрываем BackButton при unmount
    };
  }, [onCancel]);

  // Инициализация сессии
  useEffect(() => {
    const initializeSession = async () => {
      try {
        setInitializing(true);

        const existingSession = await supabaseService.getInProgressSession(
          userId,
          session.program_id
        );

        if (existingSession) {
          console.log('✅ Found existing session:', existingSession.id);
          setSessionId(existingSession.id);
          
          const logs = await supabaseService.getSessionLogs(existingSession.id);
          console.log('✅ Loaded logs:', logs.length);
          
          if (logs.length > 0) {
            setCompletedSets(logs);
            startTimeRef.current = new Date(existingSession.started_at).getTime();
            
            const lastLog = logs[logs.length - 1];
            const lastExerciseId = lastLog.exercise_id;
            
            const lastExerciseIndex = session.exercises.findIndex(
              ex => ex.id === lastExerciseId
            );
            
            if (lastExerciseIndex !== -1) {
              const setsForLastEx = logs.filter(l => l.exercise_id === lastExerciseId).length;
              const targetSets = session.exercises[lastExerciseIndex].target_sets;
              
              if (setsForLastEx >= targetSets && lastExerciseIndex < session.exercises.length - 1) {
                setCurrentExerciseIndex(lastExerciseIndex + 1);
                console.log(`✅ Resuming from exercise ${lastExerciseIndex + 2}`);
              } else {
                setCurrentExerciseIndex(lastExerciseIndex);
                console.log(`✅ Resuming from exercise ${lastExerciseIndex + 1}`);
              }
            }
          }
        } else {
          const newSession = await supabaseService.createWorkoutSession({
            user_id: userId,
            program_id: session.program_id,
            program_name: session.program_name,
            started_at: session.started_at
          });
          console.log('✅ Created new session:', newSession.id);
          setSessionId(newSession.id);
        }
      } catch (error) {
        console.error('❌ Session initialization error:', error);
        telegramService.showAlert('Ошибка создания сессии. Попробуйте позже.');
      } finally {
        setInitializing(false);
      }
    };

    initializeSession();
  }, [userId, session.program_id, session.program_name, session.started_at, session.exercises]);

  useEffect(() => {
    if (currentExercise) {
      if (exerciseType === 'reps') {
        setReps(currentExercise.target_reps);
        setWeight(currentExercise.target_weight);
        setRpe(8);
      } else if (exerciseType === 'time') {
        setDuration(currentExercise.duration || 60);
        setRpe(8);
      } else if (exerciseType === 'distance') {
        setDistance(currentExercise.distance || 1000);
      }
    }
  }, [currentExerciseIndex, currentExercise, exerciseType]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAddSet = () => {
    if (!currentExercise) return;
    const current = extraSets.get(currentExercise.id) || 0;
    setExtraSets(new Map(extraSets.set(currentExercise.id, current + 1)));
  };

  const handleCompleteSet = async () => {
    if (saving || !currentExercise || !sessionId) return;

    if (exerciseType === 'reps' && reps <= 0) {
      telegramService.showAlert('Введите количество повторений больше 0');
      return;
    }
    if (exerciseType === 'time' && duration <= 0) {
      telegramService.showAlert('Введите время больше 0 секунд');
      return;
    }
    if (exerciseType === 'distance' && distance <= 0) {
      telegramService.showAlert('Введите расстояние больше 0 метров');
      return;
    }

    const newSet: any = {
      exercise_id: currentExercise.id,
      exercise_name: currentExercise.exercise_name,
      set_no: currentSetNumber,
      timestamp: new Date().toISOString()
    };

    if (exerciseType === 'reps') {
      newSet.reps = reps;
      newSet.weight = weight;
      newSet.rpe = rpe;
    } else if (exerciseType === 'time') {
      newSet.duration = duration;
      newSet.rpe = rpe;
      newSet.reps = 0;
      newSet.weight = 0;
    } else if (exerciseType === 'distance') {
      newSet.distance = distance;
      newSet.reps = 0;
      newSet.weight = 0;
    }

    try {
      setSaving(true);

      await supabaseService.saveWorkoutLog({
        user_id: userId,
        program_id: session.program_id,
        exercise_id: currentExercise.id,
        exercise_name: currentExercise.exercise_name,
        set_no: currentSetNumber,
        reps: newSet.reps || 0,
        weight: newSet.weight || 0,
        rpe: newSet.rpe,
        duration: newSet.duration || 0,
        distance: newSet.distance || 0,
        datetime: newSet.timestamp,
        session_id: sessionId
      });

      console.log('✅ Set saved to DB:', newSet);

      const updatedSets = [...completedSets, newSet];
      setCompletedSets(updatedSets);

    } catch (error) {
      console.error('❌ Failed to save set:', error);
      telegramService.showAlert('Ошибка сохранения. Попробуйте ещё раз.');
      return;
    } finally {
      setSaving(false);
    }

    if (currentSetNumber >= effectiveTargetSets) {
      if (currentExerciseIndex < totalExercises - 1) {
        telegramService.showConfirm(
          'Упражнение завершено! Перейти к следующему?',
          (confirmed: boolean) => {
            if (confirmed) {
              handleNextExercise();
            }
          }
        );
      } else {
        handleFinishWorkout();
      }
    }
  };

  const handleNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setSkippedSets(new Set());
    }
  };

  const handleSkipSet = () => {
    if (!currentExercise) return;

    if (isLastSetOfExercise) {
      if (currentExerciseIndex < totalExercises - 1) {
        telegramService.showConfirm(
          'Завершить упражнение и перейти к следующему?',
          (confirmed: boolean) => {
            if (confirmed) {
              handleNextExercise();
            }
          }
        );
      } else {
        telegramService.showConfirm(
          'Это последнее упражнение. Завершить тренировку?',
          (confirmed: boolean) => {
            if (confirmed) {
              handleFinishWorkout();
            }
          }
        );
      }
    } else {
      const skipKey = `${currentExercise.id}_${currentSetNumber}`;
      setSkippedSets(prev => new Set([...prev, skipKey]));
      console.log(`⏭️ Skipped set ${currentSetNumber}`);
    }
  };

  const handleFinishWorkout = async () => {
    try {
      if (sessionId) {
        await supabaseService.updateWorkoutSession(sessionId, {
          status: 'completed',
          completed_at: new Date().toISOString(),
          total_duration: elapsedTime
        });
        console.log('✅ Session marked as completed');
      }
      onFinish(completedSets, elapsedTime);
    } catch (error) {
      console.error('❌ Finish workout error:', error);
      onFinish(completedSets, elapsedTime);
    }
  };

  const getTargetDescription = () => {
    if (exerciseType === 'reps') {
      return `${currentExercise.target_sets} подхода × ${currentExercise.target_reps} повторений`;
    } else if (exerciseType === 'time') {
      return `${currentExercise.target_sets} подхода × ${currentExercise.duration}с`;
    } else if (exerciseType === 'distance') {
      return `${currentExercise.distance}м`;
    }
    return '';
  };

  if (initializing) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Text>⏳ Загрузка тренировки...</Text>
      </div>
    );
  }

  if (!currentExercise) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Text>Упражнения не найдены</Text>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      paddingBottom: '40px',
      backgroundColor: 'var(--tg-theme-bg-color)'
    }}>
      <div style={{
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'var(--tg-theme-secondary-bg-color)',
        marginBottom: '8px'
      }}>
        <Text weight="2" style={{ fontSize: '15px' }}>
          {session.program_name}
        </Text>
        <Caption level="1" style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>
          ⏱ {formatTime(elapsedTime)}
        </Caption>
      </div>

      <Section>
        <div style={{ padding: '12px 16px' }}>
          <Caption level="1" style={{ 
            fontSize: '14px', 
            color: 'var(--tg-theme-hint-color)',
            marginBottom: '8px',
            display: 'block'
          }}>
            📊 Упражнение {currentExerciseIndex + 1} из {totalExercises}
          </Caption>
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: 'var(--tg-theme-secondary-bg-color)',
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${((currentExerciseIndex + 1) / totalExercises) * 100}%`,
              height: '100%',
              backgroundColor: 'var(--tg-theme-button-color)',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>
      </Section>

      <div style={{ padding: '16px', textAlign: 'center' }}>
        <Title level="1" weight="2" style={{ fontSize: '28px', marginBottom: '8px' }}>
          {exerciseType === 'reps' ? '💪' : exerciseType === 'time' ? '⏱' : '🏃'} {currentExercise.exercise_name}
        </Title>
        <Caption level="1" style={{ fontSize: '15px', color: 'var(--tg-theme-hint-color)' }}>
          {getTargetDescription()}
        </Caption>
      </div>

      {currentExercise.notes && (
        <Section>
          <Cell
            before="💡"
            subtitle={currentExercise.notes}
            style={{
              backgroundColor: 'var(--tg-theme-secondary-bg-color)'
            }}
          >
            Заметки
          </Cell>
        </Section>
      )}

      <Section 
        header={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '0 16px'
          }}>
            <span>Подход {currentSetNumber} из {effectiveTargetSets}</span>
            {exerciseType !== 'distance' && (
              <Button
                size="s"
                mode="bezeled"
                onClick={handleAddSet}
                style={{ 
                  fontSize: '11px',
                  padding: '3px 8px',
                  minHeight: '24px',
                  lineHeight: '1'
                }}
              >
                +1 подход
              </Button>
            )}
          </div>
        }
      >
        <div style={{ padding: '0 16px' }}>
          {exerciseType === 'reps' && (
            <>
              <Stepper
                label="Повторения"
                value={reps}
                onChange={setReps}
                min={1}
                max={50}
                step={1}
              />

              <Stepper
                label="Вес (кг)"
                value={weight}
                onChange={setWeight}
                min={0}
                max={500}
                step={2.5}
                suffix=" кг"
              />

              <Stepper
                label="RPE (1-10)"
                value={rpe}
                onChange={setRpe}
                min={1}
                max={10}
                step={1}
              />
            </>
          )}

          {exerciseType === 'time' && (
            <>
              <Stepper
                label="Время (сек)"
                value={duration}
                onChange={setDuration}
                min={5}
                max={600}
                step={5}
                suffix=" сек"
              />

              <Stepper
                label="RPE (1-10)"
                value={rpe}
                onChange={setRpe}
                min={1}
                max={10}
                step={1}
              />
            </>
          )}

          {exerciseType === 'distance' && (
            <Stepper
              label="Расстояние (м)"
              value={distance}
              onChange={setDistance}
              min={100}
              max={50000}
              step={100}
              suffix=" м"
            />
          )}
        </div>
      </Section>

      {exerciseCompletedSets.length > 0 && (
        <Section header="История подходов">
          {exerciseCompletedSets.map((set, index) => {
            let subtitle = '';
            if (exerciseType === 'reps') {
              subtitle = `${set.reps} повт • ${set.weight} кг • RPE ${set.rpe}`;
            } else if (exerciseType === 'time') {
              subtitle = `${set.duration} сек • RPE ${set.rpe}`;
            } else if (exerciseType === 'distance') {
              subtitle = `${set.distance} м`;
            }

            return (
              <Cell
                key={index}
                before="✅"
                subtitle={subtitle}
              >
                Подход {set.set_no}
              </Cell>
            );
          })}
        </Section>
      )}

      <Divider />

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Button
          size="l"
          stretched
          mode="filled"
          onClick={handleCompleteSet}
          disabled={saving}
          style={{ fontSize: '16px' }}
        >
          {saving ? '⏳ Сохранение...' : '✅ Выполнить подход'}
        </Button>

        <Button
          size="m"
          stretched
          mode="outline"
          onClick={handleSkipSet}
          disabled={saving}
          style={{ fontSize: '14px' }}
        >
          {isLastSetOfExercise ? '⏩ Следующее упражнение' : '⏭️ Пропустить подход'}
        </Button>
      </div>
    </div>
  );
};

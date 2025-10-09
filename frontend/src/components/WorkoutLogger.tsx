import React, { useState, useEffect, useRef } from 'react';
import { Section, Cell, Title, Caption, Text, Button, Divider } from '@telegram-apps/telegram-ui';
import { 
  Clock, 
  Activity, 
  Dumbbell, 
  Timer, 
  Footprints, 
  Lightbulb, 
  CheckCircle, 
  Trophy,
  Loader2,
  Plus
} from 'lucide-react';
import { telegramService } from '../lib/telegram';
import { supabaseService } from '../lib/supabase';
import { normalizeExerciseName } from '../lib/personalRecords';
import { Stepper } from './Stepper';
import type { WorkoutSession, PersonalRecord } from '../types';

interface WorkoutLoggerProps {
  session: WorkoutSession;
  userId: string;
  onFinish: (completedSets: any[], duration: number, sessionId: string) => void;
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
  const [currentExercisePR, setCurrentExercisePR] = useState<PersonalRecord | null>(null);
  
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
              }
            } catch (error) {
              
            } finally {
              onCancel();
            }
          }
        }
      );
    };

    telegramService.showBackButton(handleBack);

    return () => {
      
    };
  }, [onCancel]);

  useEffect(() => {
    const initializeSession = async () => {
      try {
        setInitializing(true);

        const existingSession = await supabaseService.getInProgressSession(
          userId,
          session.program_id
        );

        if (existingSession) {
          setSessionId(existingSession.id);
          
          const logs = await supabaseService.getSessionLogs(existingSession.id);
          
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
              } else {
                setCurrentExerciseIndex(lastExerciseIndex);
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
          setSessionId(newSession.id);
        }
      } catch (error) {
        telegramService.showAlert('Ошибка создания сессии. Попробуйте позже.');
      } finally {
        setInitializing(false);
      }
    };

    initializeSession();
  }, [userId, session.program_id, session.program_name, session.started_at, session.exercises]);

  useEffect(() => {
    if (currentExercise && userId) {
      loadCurrentExercisePR();
    }
  }, [currentExerciseIndex, userId, currentExercise]);

  const loadCurrentExercisePR = async () => {
    try {
      if (!currentExercise) return;

      const prs = await supabaseService.getPersonalRecords(userId);
      const normalizedName = normalizeExerciseName(currentExercise.exercise_name);
      
      const pr = prs.find(p => 
        normalizeExerciseName(p.exercise_name) === normalizedName &&
        p.exercise_type === exerciseType
      );
      
      setCurrentExercisePR(pr || null);
    } catch (error) {
      setCurrentExercisePR(null);
    }
  };

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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const formatPR = () => {
    if (!currentExercisePR) return '';
    if (currentExercisePR.exercise_type === 'reps') {
      return `${currentExercisePR.record_weight}кг × ${currentExercisePR.record_reps}`;
    } else if (currentExercisePR.exercise_type === 'time') {
      return `${currentExercisePR.record_duration}сек`;
    } else if (currentExercisePR.exercise_type === 'distance') {
      return `${currentExercisePR.record_distance}м`;
    }
    return '';
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

      const updatedSets = [...completedSets, newSet];
      setCompletedSets(updatedSets);

    } catch (error) {
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
      }
      onFinish(completedSets, elapsedTime, sessionId!);
    } catch (error) {
      onFinish(completedSets, elapsedTime, sessionId!);
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

  const getExerciseIcon = () => {
    if (exerciseType === 'time') return <Timer size={28} color="var(--tg-theme-link-color)" />;
    if (exerciseType === 'distance') return <Footprints size={28} color="var(--tg-theme-link-color)" />;
    return <Dumbbell size={28} color="var(--tg-theme-link-color)" />;
  };

  if (initializing) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <Loader2 size={32} color="var(--tg-theme-link-color)" className="animate-spin" />
        <Text>Загрузка тренировки...</Text>
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
        <Caption level="1" style={{ 
          fontSize: '14px', 
          color: 'var(--tg-theme-hint-color)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Clock size={16} />
          {formatTime(elapsedTime)}
        </Caption>
      </div>

      <Section>
        <div style={{ padding: '12px 16px' }}>
          <Caption level="1" style={{ 
            fontSize: '14px', 
            color: 'var(--tg-theme-hint-color)',
            marginBottom: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Activity size={16} />
            Упражнение {currentExerciseIndex + 1} из {totalExercises}
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

      <div style={{ padding: '16px 16px 0', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
          {getExerciseIcon()}
        </div>
        <Title level="1" weight="2" style={{ fontSize: '24px', marginBottom: '4px' }}>
          {currentExercise.exercise_name}
        </Title>
        <Caption level="1" style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>
          {getTargetDescription()}
        </Caption>
      </div>

      {currentExercisePR && (
        <div style={{ padding: '12px 16px' }}>
          <div style={{
            padding: '12px',
            backgroundColor: 'var(--tg-theme-link-color)',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '6px',
              marginBottom: '4px'
            }}>
              <Trophy size={16} color="white" />
              <span style={{ 
                fontSize: '13px',
                color: 'rgba(255,255,255,0.9)',
                fontWeight: '500'
              }}>
                Твой рекорд
              </span>
            </div>
            <div style={{ 
              fontSize: '18px',
              fontWeight: '700',
              color: 'white',
              marginBottom: '2px'
            }}>
              {formatPR()}
            </div>
            <div style={{ 
              fontSize: '11px',
              color: 'rgba(255,255,255,0.8)'
            }}>
              {formatDate(currentExercisePR.achieved_at)}
            </div>
          </div>
        </div>
      )}

      {currentExercise.notes && (
        <div style={{ padding: '0 16px 12px' }}>
          <div style={{
            padding: '12px 14px',
            backgroundColor: 'rgba(255, 193, 7, 0.15)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            borderRadius: '10px',
            display: 'flex',
            gap: '12px',
            alignItems: 'center'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              minWidth: '32px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 193, 7, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Lightbulb size={18} color="#FFC107" />
            </div>
            <div style={{ 
              fontSize: '14px',
              color: 'var(--tg-theme-text-color)',
              lineHeight: '1.4',
              flex: 1
            }}>
              {currentExercise.notes}
            </div>
          </div>
        </div>
      )}

      <Section 
        header={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '10px',
            padding: '0 16px'
          }}>
            <span>Подход {currentSetNumber} из {effectiveTargetSets}</span>
            <button
              onClick={handleAddSet}
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'var(--tg-theme-link-color)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0
              }}
            >
              <Plus size={16} />
            </button>
          </div>
        }
        style={{ marginTop: '8px' }}
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
        <Section header="История подходов" style={{ marginTop: '8px' }}>
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
                key={`set-${index}`}
                before={<CheckCircle size={18} color="var(--tg-theme-link-color)" />}
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
          {saving ? 'Сохранение...' : 'Выполнить подход'}
        </Button>

        <Button
          size="m"
          stretched
          mode="outline"
          onClick={handleSkipSet}
          disabled={saving}
          style={{ fontSize: '14px' }}
        >
          {isLastSetOfExercise ? 'Следующее упражнение' : 'Пропустить подход'}
        </Button>
      </div>
    </div>
  );
};

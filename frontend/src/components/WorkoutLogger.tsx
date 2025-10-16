import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Plus,
  Edit2
} from 'lucide-react';
import { telegramService } from '../lib/telegram';
import { supabaseService } from '../lib/supabase';
import { normalizeExerciseName } from '../lib/personalRecords';
import { formatDuration, formatTime, formatDate } from '../lib/utils/formatters';
import { Stepper } from './Stepper';
import { ConfirmModal } from './ConfirmModal';
import { AlertModal } from './AlertModal';
import { EditSetModal } from './EditSetModal';
import type { WorkoutSession, PersonalRecord, CompletedSet, EditSetData, WorkoutLogUpdate } from '../types';

interface WorkoutLoggerProps {
  session: WorkoutSession;
  userId: string;
  onFinish: (completedSets: CompletedSet[], duration: number, sessionId: string) => void;
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
  const [completedSets, setCompletedSets] = useState<CompletedSet[]>([]);
  const [skippedSets, setSkippedSets] = useState<Set<string>>(new Set());
  const [extraSets, setExtraSets] = useState<Map<string, number>>(new Map());
  const [currentExercisePR, setCurrentExercisePR] = useState<PersonalRecord | null>(null);
  
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);
  
  const [elapsedTime, setElapsedTime] = useState(0);
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(true);

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    danger: false
  });

  const [alertModal, setAlertModal] = useState({
    isOpen: false,
    message: '',
    type: 'info' as 'info' | 'error' | 'success'
  });

  const [editSetModal, setEditSetModal] = useState<{
    isOpen: boolean;
    setData: EditSetData | null;
  }>({
    isOpen: false,
    setData: null
  });

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
  const isLastSetOfExercise = currentSetNumber > effectiveTargetSets;

  const exerciseType = currentExercise?.exercise_type || 'reps';

  useEffect(() => {
    sessionIdRef.current = sessionId;
  }, [sessionId]);

  const handleBack = useCallback(() => {
    telegramService.hapticFeedback('impact', 'medium');
    setConfirmModal({
      isOpen: true,
      title: 'Отменить тренировку?',
      message: 'Прогресс будет сохранён',
      danger: true,
      onConfirm: async () => {
        telegramService.hapticFeedback('impact', 'heavy');
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
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          onCancel();
        }
      }
    });
  }, [onCancel]);

  useEffect(() => {
    telegramService.showBackButton(handleBack);
    return () => {};
  }, [handleBack]);

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
              const exercise = session.exercises[lastExerciseIndex];
              const targetSets = exercise.target_sets;
              const extraForExercise = extraSets.get(exercise.id) || 0;
              const totalSetsForExercise = targetSets + extraForExercise;
              
              if (setsForLastEx >= totalSetsForExercise && lastExerciseIndex < session.exercises.length - 1) {
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
        setAlertModal({
          isOpen: true,
          message: 'Ошибка создания сессии. Попробуйте позже',
          type: 'error'
        });
      } finally {
        setInitializing(false);
      }
    };

    initializeSession();
  }, [userId, session.program_id, session.program_name, session.started_at, session.exercises]);

  const loadCurrentExercisePR = useCallback(async () => {
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
  }, [currentExercise, userId, exerciseType]);

  useEffect(() => {
    if (currentExercise && userId) {
      loadCurrentExercisePR();
    }
  }, [currentExercise, userId, loadCurrentExercisePR]);

  useEffect(() => {
    if (currentExercise) {
      if (exerciseType === 'reps') {
        setReps(currentExercise.target_reps);
        setWeight(currentExercise.target_weight);
      } else if (exerciseType === 'time') {
        setDuration(currentExercise.duration || 60);
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

  const formatPR = () => {
    if (!currentExercisePR) return '';
    if (currentExercisePR.exercise_type === 'reps') {
      return `${currentExercisePR.record_weight}кг × ${currentExercisePR.record_reps}`;
    } else if (currentExercisePR.exercise_type === 'time') {
      return formatDuration(currentExercisePR.record_duration || 0);
    } else if (currentExercisePR.exercise_type === 'distance') {
      return `${currentExercisePR.record_distance}м`;
    }
    return '';
  };

  const handleAddSet = useCallback(() => {
    if (!currentExercise) return;
    telegramService.hapticFeedback('impact', 'light');
    const current = extraSets.get(currentExercise.id) || 0;
    setExtraSets(new Map(extraSets.set(currentExercise.id, current + 1)));
  }, [currentExercise, extraSets]);

  const handleCompleteSet = useCallback(async () => {
    if (saving || !currentExercise || !sessionId) return;

    if (exerciseType === 'reps' && reps <= 0) {
      telegramService.hapticFeedback('impact', 'medium');
      setAlertModal({
        isOpen: true,
        message: 'Введите количество повторений больше 0',
        type: 'error'
      });
      return;
    }
    if (exerciseType === 'time' && duration <= 0) {
      telegramService.hapticFeedback('impact', 'medium');
      setAlertModal({
        isOpen: true,
        message: 'Введите время больше 0 секунд',
        type: 'error'
      });
      return;
    }
    if (exerciseType === 'distance' && distance <= 0) {
      telegramService.hapticFeedback('impact', 'medium');
      setAlertModal({
        isOpen: true,
        message: 'Введите расстояние больше 0 метров',
        type: 'error'
      });
      return;
    }

    const newSet: Partial<CompletedSet> = {
      exercise_id: currentExercise.id,
      exercise_name: currentExercise.exercise_name,
      set_no: currentSetNumber,
      timestamp: new Date().toISOString(),
      reps: 0,
      weight: 0,
      duration: 0,
      distance: 0
    };

    if (exerciseType === 'reps') {
      newSet.reps = reps;
      newSet.weight = weight;
    } else if (exerciseType === 'time') {
      newSet.duration = duration;
    } else if (exerciseType === 'distance') {
      newSet.distance = distance;
    }

    try {
      setSaving(true);
      telegramService.hapticFeedback('impact', 'light');

      const savedLog = await supabaseService.saveWorkoutLog({
        user_id: userId,
        program_id: session.program_id,
        exercise_id: currentExercise.id,
        exercise_name: currentExercise.exercise_name,
        set_no: currentSetNumber,
        reps: newSet.reps || 0,
        weight: newSet.weight || 0,
        duration: newSet.duration || 0,
        distance: newSet.distance || 0,
        datetime: newSet.timestamp!,
        session_id: sessionId
      });

      newSet.id = savedLog.id;

      const updatedSets = [...completedSets, newSet as CompletedSet];
      setCompletedSets(updatedSets);
      
      telegramService.hapticFeedback('impact', 'light');

    } catch (error) {
      telegramService.hapticFeedback('impact', 'heavy');
      setAlertModal({
        isOpen: true,
        message: 'Ошибка сохранения. Попробуйте ещё раз',
        type: 'error'
      });
      return;
    } finally {
      setSaving(false);
    }

    if (currentSetNumber >= effectiveTargetSets) {
      if (currentExerciseIndex < totalExercises - 1) {
        telegramService.hapticFeedback('impact', 'medium');
        setConfirmModal({
          isOpen: true,
          title: 'Упражнение завершено!',
          message: 'Перейти к следующему?',
          danger: false,
          onConfirm: () => {
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            handleNextExercise();
          }
        });
      } else {
        handleFinishWorkout();
      }
    }
  }, [saving, currentExercise, sessionId, exerciseType, reps, duration, distance, weight, currentSetNumber, userId, session.program_id, completedSets, currentExerciseIndex, effectiveTargetSets, totalExercises]);

  const handleNextExercise = useCallback(() => {
    if (currentExerciseIndex < totalExercises - 1) {
      telegramService.hapticFeedback('impact', 'light');
      setCurrentExerciseIndex(currentExerciseIndex + 1);
      setSkippedSets(new Set());
    }
  }, [currentExerciseIndex, totalExercises]);

  const handleSkipSet = useCallback(() => {
    if (!currentExercise) return;

    telegramService.hapticFeedback('impact', 'light');

    if (isLastSetOfExercise) {
      if (currentExerciseIndex < totalExercises - 1) {
        setConfirmModal({
          isOpen: true,
          title: 'Завершить упражнение?',
          message: 'Перейти к следующему упражнению?',
          danger: false,
          onConfirm: () => {
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            handleNextExercise();
          }
        });
      } else {
        setConfirmModal({
          isOpen: true,
          title: 'Последнее упражнение',
          message: 'Завершить тренировку?',
          danger: false,
          onConfirm: () => {
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            handleFinishWorkout();
          }
        });
      }
    } else {
      const skipKey = `${currentExercise.id}_${currentSetNumber}`;
      setSkippedSets(prev => new Set([...prev, skipKey]));
    }
  }, [currentExercise, isLastSetOfExercise, currentExerciseIndex, totalExercises, currentSetNumber, handleNextExercise]);

  const handleFinishWorkout = useCallback(async () => {
    try {
      telegramService.hapticFeedback('impact', 'heavy');
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
  }, [sessionId, elapsedTime, completedSets, onFinish]);

  const handleEditSet = useCallback((set: CompletedSet) => {
    telegramService.hapticFeedback('impact', 'light');
    setEditSetModal({
      isOpen: true,
      setData: {
        id: set.id,
        exercise_type: exerciseType,
        set_no: set.set_no,
        reps: set.reps,
        weight: set.weight,
        duration: set.duration,
        distance: set.distance
      }
    });
  }, [exerciseType]);

  const handleSaveEditedSet = useCallback(async (updatedData: EditSetData & WorkoutLogUpdate) => {
    try {
      if (updatedData.id) {
        await supabaseService.updateWorkoutLog(updatedData.id, {
          reps: updatedData.reps || 0,
          weight: updatedData.weight || 0,
          duration: updatedData.duration || 0,
          distance: updatedData.distance || 0
        });
      }
      
      setCompletedSets(prev => prev.map(set => 
        set.id === updatedData.id ? { ...set, ...updatedData } : set
      ));
      
      setEditSetModal({ isOpen: false, setData: null });
      
      setAlertModal({
        isOpen: true,
        message: 'Подход обновлён',
        type: 'success'
      });
    } catch (error) {
      setAlertModal({
        isOpen: true,
        message: 'Ошибка обновления подхода',
        type: 'error'
      });
    }
  }, []);

  const getTargetDescription = () => {
    if (exerciseType === 'reps') {
      return `${currentExercise.target_sets} подхода × ${currentExercise.target_reps} повторений`;
    } else if (exerciseType === 'time') {
      const formattedDuration = formatDuration(currentExercise.duration || 0);
      return `${currentExercise.target_sets} подхода × ${formattedDuration}`;
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
    <>
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
              </>
            )}

            {exerciseType === 'time' && (
              <Stepper
                label={duration >= 60 ? `Время (${formatDuration(duration)})` : 'Время (сек)'}
                value={duration}
                onChange={setDuration}
                min={5}
                max={600}
                step={5}
                suffix=" сек"
              />
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
                subtitle = `${set.reps} повт • ${set.weight} кг`;
              } else if (exerciseType === 'time') {
                subtitle = formatDuration(set.duration || 0);
              } else if (exerciseType === 'distance') {
                subtitle = `${set.distance} м`;
              }

              return (
                <Cell
                  key={`set-${index}`}
                  before={<CheckCircle size={18} color="var(--tg-theme-link-color)" />}
                  after={
                    <button
                      onClick={() => handleEditSet(set)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        padding: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Edit2 size={18} color="var(--tg-theme-hint-color)" />
                    </button>
                  }
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

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        danger={confirmModal.danger}
      />
      
      <AlertModal
        isOpen={alertModal.isOpen}
        message={alertModal.message}
        type={alertModal.type}
        onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
      />

      <EditSetModal
        isOpen={editSetModal.isOpen}
        setData={editSetModal.setData}
        onSave={handleSaveEditedSet}
        onClose={() => setEditSetModal({ isOpen: false, setData: null })}
      />
    </>
  );
};

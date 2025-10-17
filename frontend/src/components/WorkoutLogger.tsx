import React, { useState, useEffect, useCallback } from 'react';
import { Text } from '@telegram-apps/telegram-ui';
import { Loader2 } from 'lucide-react';
import { telegramService } from '../lib/telegram';
import { ConfirmModal } from './ConfirmModal';
import { AlertModal } from './AlertModal';
import { EditSetModal } from './EditSetModal';
import { WorkoutHeader } from './workout/WorkoutHeader';
import { ExerciseProgress } from './workout/ExerciseProgress';
import { ExerciseCard } from './workout/ExerciseCard';
import { PersonalRecordBadge } from './workout/PersonalRecordBadge';
import { ExerciseNotes } from './workout/ExerciseNotes';
import { SetControls } from './workout/SetControls';
import { SetHistory } from './workout/SetHistory';
import { WorkoutActions } from './workout/WorkoutActions';
import { useWorkoutSession } from '../hooks/useWorkoutSession';
import { useExerciseNavigation } from '../hooks/useExerciseNavigation';
import { useSetLogger } from '../hooks/useSetLogger';
import { usePersonalRecords } from '../hooks/usePersonalRecords';
import type { WorkoutSession, CompletedSet, EditSetData, WorkoutLogUpdate } from '../types';

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
  const {
    sessionId,
    completedSets,
    initializing,
    elapsedTime,
    initializeSession,
    cancelSession,
    completeSession,
    addCompletedSet,
    updateCompletedSet
  } = useWorkoutSession({
    userId,
    programId: session.program_id,
    programName: session.program_name,
    startedAt: session.started_at
  });

  const [sessionLogs, setSessionLogs] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const result = await initializeSession();
        if (result) {
          setSessionLogs(result.logs);
        }
      } catch (error) {
        setAlertModal({
          isOpen: true,
          message: 'Ошибка создания сессии. Попробуйте позже',
          type: 'error'
        });
      }
    };
    init();
  }, []);

  const {
    currentExercise,
    currentExerciseIndex,
    totalExercises,
    exerciseCompletedSets,
    currentSetNumber,
    effectiveTargetSets,
    isLastSetOfExercise,
    isLastExercise,
    exerciseSkippedCount,
    addExtraSet,
    skipCurrentSet,
    goToNextExercise
  } = useExerciseNavigation({
    exercises: session.exercises,
    completedSets,
    sessionLogs
  });

  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);
  const [duration, setDuration] = useState(0);
  const [distance, setDistance] = useState(0);

  const { saving, logSet, updateSet } = useSetLogger({
    userId,
    programId: session.program_id,
    sessionId,
    currentExercise: currentExercise!,
    currentSetNumber,
    onSetCompleted: addCompletedSet
  });

  const { currentExercisePR } = usePersonalRecords(userId, currentExercise);

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

  const exerciseType = currentExercise?.exercise_type || 'reps';

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
          await cancelSession();
        } catch (error) {
          
        } finally {
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
          onCancel();
        }
      }
    });
  }, [onCancel, cancelSession]);

  useEffect(() => {
    telegramService.showBackButton(handleBack);
    return () => {};
  }, [handleBack]);

  const handleAddSet = useCallback(() => {
    telegramService.hapticFeedback('impact', 'light');
    addExtraSet();
  }, [addExtraSet]);

  const handleCompleteSet = useCallback(async () => {
    const result = await logSet({ reps, weight, duration, distance });
    
    if (!result.success) {
      telegramService.hapticFeedback('impact', 'medium');
      setAlertModal({
        isOpen: true,
        message: result.error || 'Ошибка',
        type: 'error'
      });
      return;
    }

    if (currentSetNumber >= effectiveTargetSets) {
      if (!isLastExercise) {
        telegramService.hapticFeedback('impact', 'medium');
        setConfirmModal({
          isOpen: true,
          title: 'Упражнение завершено!',
          message: 'Перейти к следующему?',
          danger: false,
          onConfirm: () => {
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            goToNextExercise();
          }
        });
      } else {
        handleFinishWorkout();
      }
    }
  }, [logSet, reps, weight, duration, distance, currentSetNumber, effectiveTargetSets, isLastExercise, goToNextExercise]);

  const handleSkipSet = useCallback(() => {
    telegramService.hapticFeedback('impact', 'light');

    skipCurrentSet();
    
    const newSkippedCount = exerciseSkippedCount + 1;
    const totalDone = exerciseCompletedSets.length + newSkippedCount;
    const willBeLastSet = totalDone >= effectiveTargetSets;
    
    if (willBeLastSet) {
      if (!isLastExercise) {
        const hasCompletedAnySets = exerciseCompletedSets.length > 0;
        
        if (hasCompletedAnySets) {
          setConfirmModal({
            isOpen: true,
            title: 'Перейти к следующему?',
            message: `Упражнение "${currentExercise?.exercise_name}" завершено`,
            danger: false,
            onConfirm: () => {
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
              goToNextExercise();
            }
          });
        } else {
          setConfirmModal({
            isOpen: true,
            title: 'Пропустить упражнение?',
            message: `Вы не выполните "${currentExercise?.exercise_name}"`,
            danger: false,
            onConfirm: () => {
              setConfirmModal(prev => ({ ...prev, isOpen: false }));
              goToNextExercise();
            }
          });
        }
      } else {
        setConfirmModal({
          isOpen: true,
          title: 'Завершить тренировку?',
          message: 'Последнее упражнение будет пропущено',
          danger: false,
          onConfirm: () => {
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
            handleFinishWorkout();
          }
        });
      }
    }
  }, [skipCurrentSet, exerciseSkippedCount, exerciseCompletedSets.length, effectiveTargetSets, isLastExercise, currentExercise, goToNextExercise]);

  const handleFinishWorkout = useCallback(async () => {
    try {
      telegramService.hapticFeedback('impact', 'heavy');
      await completeSession();
      onFinish(completedSets, elapsedTime, sessionId!);
    } catch (error) {
      onFinish(completedSets, elapsedTime, sessionId!);
    }
  }, [completeSession, completedSets, elapsedTime, sessionId, onFinish]);

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
    const result = await updateSet(updatedData.id, {
      reps: updatedData.reps || 0,
      weight: updatedData.weight || 0,
      duration: updatedData.duration || 0,
      distance: updatedData.distance || 0
    });

    if (result.success) {
      updateCompletedSet(updatedData.id, updatedData);
      setEditSetModal({ isOpen: false, setData: null });
      setAlertModal({
        isOpen: true,
        message: 'Подход обновлён',
        type: 'success'
      });
    } else {
      setAlertModal({
        isOpen: true,
        message: result.error || 'Ошибка обновления подхода',
        type: 'error'
      });
    }
  }, [updateSet, updateCompletedSet]);

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
        <WorkoutHeader
          programName={session.program_name}
          elapsedTime={elapsedTime}
        />

        <ExerciseProgress
          currentIndex={currentExerciseIndex}
          total={totalExercises}
        />

        <ExerciseCard exercise={currentExercise} />

        {currentExercisePR && (
          <PersonalRecordBadge record={currentExercisePR} />
        )}

        {currentExercise.notes && (
          <ExerciseNotes notes={currentExercise.notes} />
        )}

        <SetControls
          exerciseType={exerciseType}
          currentSetNumber={currentSetNumber}
          effectiveTargetSets={effectiveTargetSets}
          reps={reps}
          weight={weight}
          duration={duration}
          distance={distance}
          onRepsChange={setReps}
          onWeightChange={setWeight}
          onDurationChange={setDuration}
          onDistanceChange={setDistance}
          onAddSet={handleAddSet}
        />

        <SetHistory
          sets={exerciseCompletedSets}
          exerciseType={exerciseType}
          onEditSet={handleEditSet}
        />

        <WorkoutActions
          saving={saving}
          isLastSetOfExercise={isLastSetOfExercise}
          isLastExercise={isLastExercise}
          currentSetNumber={currentSetNumber}
          effectiveTargetSets={effectiveTargetSets}
          hasCompletedSets={exerciseCompletedSets.length > 0}
          onComplete={handleCompleteSet}
          onSkip={handleSkipSet}
        />
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

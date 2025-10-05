import React, { useState, useEffect, useCallback } from 'react';
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
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(session.current_exercise_index || 0);
  const [completedSets, setCompletedSets] = useState<any[]>([]);
  const [skippedSets, setSkippedSets] = useState<Set<string>>(new Set());
  const [extraSets, setExtraSets] = useState<Map<string, number>>(new Map());
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);
  const [rpe, setRpe] = useState(8);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    if (currentExercise) {
      setReps(currentExercise.target_reps);
      setWeight(currentExercise.target_weight);
      setRpe(8);
    }
  }, [currentExerciseIndex, currentExercise]);

  useEffect(() => {
    const startTime = new Date(session.started_at).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [session.started_at]);

  // ✅ ИСПРАВЛЕНО: BackButton с правильным callback
  const handleBackButtonClick = useCallback(() => {
    telegramService.showConfirm(
      'Вы уверены, что хотите завершить тренировку? Прогресс будет потерян.',
      (confirmed: boolean) => {
        if (confirmed) {
          onCancel();
        }
        // Если отменил - просто закрываем диалог, ничего не делаем
      }
    );
  }, [onCancel]);

  useEffect(() => {
    telegramService.showBackButton(handleBackButtonClick);

    return () => {
      telegramService.hideBackButton();
    };
  }, [handleBackButtonClick]);

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
    if (saving || !currentExercise) return;

    const newSet = {
      exercise_id: currentExercise.id,
      exercise_name: currentExercise.exercise_name,
      set_no: currentSetNumber,
      reps,
      weight,
      rpe,
      timestamp: new Date().toISOString()
    };

    try {
      setSaving(true);

      await supabaseService.saveWorkoutLog({
        user_id: userId,
        program_id: session.program_id,
        exercise_id: currentExercise.id,
        exercise_name: currentExercise.exercise_name,
        set_no: currentSetNumber,
        reps,
        weight,
        rpe,
        datetime: newSet.timestamp
      });

      console.log('✅ Set saved to DB:', newSet);

      const updatedSets = [...completedSets, newSet];
      setCompletedSets(updatedSets);

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
          onFinish(updatedSets, elapsedTime);
        }
      }
    } catch (error) {
      console.error('❌ Failed to save set:', error);
      telegramService.showAlert('Ошибка сохранения. Попробуйте ещё раз.');
    } finally {
      setSaving(false);
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
              onFinish(completedSets, elapsedTime);
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
          💪 {currentExercise.exercise_name}
        </Title>
        <Caption level="1" style={{ fontSize: '15px', color: 'var(--tg-theme-hint-color)' }}>
          {currentExercise.target_sets} подхода × {currentExercise.target_reps} повторений
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

      {/* ✅ ИСПРАВЛЕНО: Уменьшена кнопка +1 */}
      <Section 
        header={
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '0 16px'
          }}>
            <span>Подход {currentSetNumber} из {effectiveTargetSets}</span>
            <Button
              size="s"
              mode="bezeled"
              onClick={handleAddSet}
              style={{ 
                fontSize: '12px',
                padding: '2px 8px',
                minHeight: '24px',
                lineHeight: '1'
              }}
            >
              +1
            </Button>
          </div>
        }
      >
        <div style={{ padding: '0 16px' }}>
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
        </div>
      </Section>

      {exerciseCompletedSets.length > 0 && (
        <Section header="История подходов">
          {exerciseCompletedSets.map((set, index) => (
            <Cell
              key={index}
              before="✅"
              subtitle={`${set.reps} повт • ${set.weight} кг • RPE ${set.rpe}`}
            >
              Подход {set.set_no}
            </Cell>
          ))}
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

import React, { useState, useEffect } from 'react';
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
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);
  const [rpe, setRpe] = useState(8);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [saving, setSaving] = useState(false);

  const currentExercise = session.exercises[currentExerciseIndex];
  const totalExercises = session.exercises.length;
  const currentSetNumber = completedSets.filter(
    set => set.exercise_id === currentExercise?.id
  ).length + 1;

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

  useEffect(() => {
    telegramService.showBackButton(() => {
      telegramService.showConfirm(
        'Вы уверены, что хотите завершить тренировку? Прогресс будет потерян.',
        (confirmed: boolean) => {
          if (confirmed) {
            onCancel();
          }
        }
      );
    });

    return () => {
      telegramService.hideBackButton();
    };
  }, [onCancel]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
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

      const exerciseSets = updatedSets.filter(
        set => set.exercise_id === currentExercise.id
      );

      if (exerciseSets.length >= currentExercise.target_sets) {
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
          // ✅ ИЗМЕНЕНО: Передаём данные для экрана итогов
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
    }
  };

  const handleRepeatSet = () => {
    const exerciseSets = completedSets.filter(
      set => set.exercise_id === currentExercise?.id
    );
    
    if (exerciseSets.length > 0) {
      const lastSet = exerciseSets[exerciseSets.length - 1];
      setReps(lastSet.reps);
      setWeight(lastSet.weight);
      setRpe(lastSet.rpe);
    }
  };

  const handleSkipExercise = () => {
    telegramService.showConfirm(
      'Пропустить это упражнение?',
      (confirmed: boolean) => {
        if (confirmed) {
          handleNextExercise();
        }
      }
    );
  };

  if (!currentExercise) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Text>Упражнения не найдены</Text>
      </div>
    );
  }

  const exerciseCompletedSets = completedSets.filter(
    set => set.exercise_id === currentExercise.id
  );

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

      <Section header={`Подход ${currentSetNumber} из ${currentExercise.target_sets}`}>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Button
            size="m"
            mode="outline"
            onClick={handleSkipExercise}
            disabled={saving}
            style={{ fontSize: '14px' }}
          >
            ⏭️ Пропустить
          </Button>

          <Button
            size="m"
            mode="outline"
            onClick={handleRepeatSet}
            disabled={exerciseCompletedSets.length === 0 || saving}
            style={{ fontSize: '14px' }}
          >
            🔄 Повторить
          </Button>
        </div>
      </div>
    </div>
  );
};

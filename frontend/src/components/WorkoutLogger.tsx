import React, { useState, useEffect } from 'react';
import { Section, Cell, Title, Caption, Text, Button, Divider } from '@telegram-apps/telegram-ui';
import { telegramService } from '../lib/telegram';
import { Stepper } from './Stepper';
import type { WorkoutSession } from '../types';

interface WorkoutLoggerProps {
  session: WorkoutSession;
  onFinish: () => void;
  onCancel: () => void;
}

export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({
  session,
  onFinish,
  onCancel
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(session.current_exercise_index || 0);
  const [completedSets, setCompletedSets] = useState<any[]>([]);
  const [reps, setReps] = useState(0);
  const [weight, setWeight] = useState(0);
  const [rpe, setRpe] = useState(8);
  const [elapsedTime, setElapsedTime] = useState(0);

  const currentExercise = session.exercises[currentExerciseIndex];
  const totalExercises = session.exercises.length;
  const currentSetNumber = completedSets.length + 1;

  // Инициализация значений из целевых параметров
  useEffect(() => {
    if (currentExercise) {
      setReps(currentExercise.target_reps);
      setWeight(currentExercise.target_weight);
      setRpe(8);
      setCompletedSets([]);
    }
  }, [currentExerciseIndex, currentExercise]);

  // Таймер тренировки
  useEffect(() => {
    const startTime = new Date(session.started_at).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [session.started_at]);

  // BackButton для отмены тренировки
  useEffect(() => {
    telegramService.showBackButton(() => {
      telegramService.showConfirm(
        'Вы уверены, что хотите завершить тренировку? Прогресс будет потерян.',
        (confirmed) => {
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

  // Форматирование времени
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Обработчик выполнения подхода
  const handleCompleteSet = () => {
    const newSet = {
      set_no: currentSetNumber,
      reps,
      weight,
      rpe,
      timestamp: new Date().toISOString()
    };

    setCompletedSets([...completedSets, newSet]);

    // TODO: Сохранить в БД
    console.log('Set completed:', newSet);

    // Если выполнены все подходы - предложить следующее упражнение
    if (currentSetNumber >= currentExercise.target_sets) {
      if (currentExerciseIndex < totalExercises - 1) {
        telegramService.showConfirm(
          'Упражнение завершено! Перейти к следующему?',
          (confirmed) => {
            if (confirmed) {
              handleNextExercise();
            }
          }
        );
      } else {
        // Последнее упражнение завершено
        telegramService.showConfirm(
          'Поздравляем! Тренировка завершена!',
          () => {
            onFinish();
          }
        );
      }
    }
  };

  // Следующее упражнение
  const handleNextExercise = () => {
    if (currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    }
  };

  // Повторить предыдущий подход
  const handleRepeatSet = () => {
    if (completedSets.length > 0) {
      const lastSet = completedSets[completedSets.length - 1];
      setReps(lastSet.reps);
      setWeight(lastSet.weight);
      setRpe(lastSet.rpe);
    }
  };

  // Пропустить упражнение
  const handleSkipExercise = () => {
    telegramService.showConfirm(
      'Пропустить это упражнение?',
      (confirmed) => {
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

  return (
    <div style={{ 
      minHeight: '100vh',
      paddingBottom: '40px',
      backgroundColor: 'var(--tg-theme-bg-color)'
    }}>
      {/* Header: Название программы + Таймер */}
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

      {/* Progress */}
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
          {/* Progress Bar */}
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

      {/* Exercise Title */}
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <Title level="1" weight="2" style={{ fontSize: '28px', marginBottom: '8px' }}>
          💪 {currentExercise.exercise_name}
        </Title>
        <Caption level="1" style={{ fontSize: '15px', color: 'var(--tg-theme-hint-color)' }}>
          {currentExercise.target_sets} подхода × {currentExercise.target_reps} повторений
        </Caption>
      </div>

      {/* Notes (если есть) */}
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

      {/* Current Set */}
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

      {/* History of completed sets */}
      {completedSets.length > 0 && (
        <Section header="История подходов">
          {completedSets.map((set, index) => (
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

      {/* Actions */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Button
          size="l"
          stretched
          mode="filled"
          onClick={handleCompleteSet}
          style={{ fontSize: '16px' }}
        >
          ✅ Выполнить подход
        </Button>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Button
            size="m"
            mode="outline"
            onClick={handleSkipExercise}
            style={{ fontSize: '14px' }}
          >
            ⏭️ Пропустить
          </Button>

          <Button
            size="m"
            mode="outline"
            onClick={handleRepeatSet}
            disabled={completedSets.length === 0}
            style={{ fontSize: '14px' }}
          >
            🔄 Повторить
          </Button>
        </div>
      </div>
    </div>
  );
};

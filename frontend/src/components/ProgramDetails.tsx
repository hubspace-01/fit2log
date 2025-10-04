import React, { useEffect } from 'react';
import {
  Section,
  Button,
  Title,
  Text,
  Card,
  List,
  Cell
} from '@telegram-apps/telegram-ui';
import type { Program } from '../types';
import { telegramService } from '../lib/telegram';

interface Props {
  program: Program;
  onBack: () => void;
  onEdit: (program: Program) => void;
  onDelete: (programId: string) => void;
  onStartWorkout: (program: Program) => void;
}

export const ProgramDetails: React.FC<Props> = ({
  program,
  onBack,
  onEdit,
  onDelete,
  onStartWorkout
}) => {
  // Управление BackButton
  useEffect(() => {
    telegramService.showBackButton(onBack);
    return () => {
      telegramService.hideBackButton();
    };
  }, [onBack]);

  // Сортируем упражнения по order_index
  const exercises = [...(program.exercises || [])].sort(
    (a, b) => a.order_index - b.order_index
  );

  const handleDelete = () => {
    // Подтверждение удаления
    if (window.Telegram?.WebApp?.showConfirm) {
      window.Telegram.WebApp.showConfirm(
        `Удалить программу "${program.program_name}"?`,
        (confirmed) => {
          if (confirmed) {
            onDelete(program.id);
          }
        }
      );
    } else {
      // Fallback для браузера
      if (confirm(`Удалить программу "${program.program_name}"?`)) {
        onDelete(program.id);
      }
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'var(--tg-theme-bg-color, #ffffff)',
      paddingBottom: '80px'
    }}>
      {/* Заголовок программы */}
      <Section
        header={
          <Title level="1" weight="1" style={{ padding: '16px 0' }}>
            {program.program_name}
          </Title>
        }
      >
        <Text style={{ color: 'var(--tg-theme-hint-color)' }}>
          {exercises.length} {exercises.length === 1 ? 'упражнение' : 'упражнений'}
        </Text>
      </Section>

      {/* Список упражнений */}
      {exercises.length > 0 ? (
        <Section header="Упражнения">
          <List style={{ background: 'transparent' }}>
            {exercises.map((exercise, index) => (
              <Cell
                key={exercise.id}
                before={
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--tg-theme-button-color)',
                      color: 'var(--tg-theme-button-text-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold'
                    }}
                  >
                    {index + 1}
                  </div>
                }
                subtitle={
                  <Text style={{ color: 'var(--tg-theme-hint-color)' }}>
                    {exercise.target_sets} × {exercise.target_reps} повторений
                    {exercise.target_weight > 0 && ` • ${exercise.target_weight} кг`}
                  </Text>
                }
              >
                {exercise.exercise_name}
              </Cell>
            ))}
          </List>
        </Section>
      ) : (
        <Section>
          <Card style={{ padding: '20px', textAlign: 'center' }}>
            <Text style={{ color: 'var(--tg-theme-hint-color)' }}>
              В программе пока нет упражнений
            </Text>
          </Card>
        </Section>
      )}

      {/* Кнопки действий */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '12px 16px',
          backgroundColor: 'var(--tg-theme-bg-color)',
          borderTop: '1px solid var(--tg-theme-hint-color, #e0e0e0)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {/* Главная кнопка - Начать тренировку */}
        {exercises.length > 0 && (
          <Button
            size="l"
            stretched
            onClick={() => onStartWorkout(program)}
            style={{
              backgroundColor: 'var(--tg-theme-button-color)',
              color: 'var(--tg-theme-button-text-color)'
            }}
          >
            🏋️ Начать тренировку
          </Button>
        )}

        {/* Дополнительные действия */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            size="m"
            mode="outline"
            stretched
            onClick={() => onEdit(program)}
          >
            ✏️ Редактировать
          </Button>
          <Button
            size="m"
            mode="outline"
            stretched
            onClick={handleDelete}
            style={{
              borderColor: 'var(--tg-theme-destructive-text-color, #ff3b30)',
              color: 'var(--tg-theme-destructive-text-color, #ff3b30)'
            }}
          >
            🗑️ Удалить
          </Button>
        </div>
      </div>
    </div>
  );
};

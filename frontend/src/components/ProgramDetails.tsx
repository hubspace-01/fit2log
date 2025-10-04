import React, { useEffect } from 'react';
import {
  Section,
  Button,
  Title,
  Text,
  List,
  Cell,
  Placeholder
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
  useEffect(() => {
    telegramService.showBackButton(onBack);
    return () => {
      telegramService.hideBackButton();
    };
  }, [onBack]);

  const exercises = [...(program.exercises || [])].sort(
    (a, b) => a.order_index - b.order_index
  );

  const handleDelete = () => {
    const webApp = window.Telegram?.WebApp;
    
    if (webApp && 'showConfirm' in webApp && typeof (webApp as any).showConfirm === 'function') {
      (webApp as any).showConfirm(
        `Удалить программу "${program.program_name}"?`,
        (confirmed: boolean) => {
          if (confirmed) {
            onDelete(program.id);
          }
        }
      );
    } else {
      if (confirm(`Удалить программу "${program.program_name}"?`)) {
        onDelete(program.id);
      }
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      paddingBottom: '120px'
    }}>
      {/* Заголовок программы */}
      <Section>
        <div style={{ 
          padding: '20px 0',
          textAlign: 'center'
        }}>
          <Title 
            level="1" 
            weight="2"
          >
            {program.program_name}
          </Title>
          <Text style={{ 
            color: 'var(--tg-theme-hint-color)',
            marginTop: '8px',
            display: 'block'
          }}>
            {exercises.length} {exercises.length === 1 ? 'упражнение' : exercises.length < 5 ? 'упражнения' : 'упражнений'}
          </Text>
        </div>
      </Section>

      {/* Список упражнений или Placeholder */}
      {exercises.length > 0 ? (
        <Section header="Упражнения">
          <List>
            {exercises.map((exercise, index) => (
              <Cell
                key={exercise.id}
                before={
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      minWidth: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--tg-theme-button-color)',
                      color: 'var(--tg-theme-button-text-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '600',
                      fontSize: '17px'
                    }}
                  >
                    {index + 1}
                  </div>
                }
                subtitle={
                  <div style={{ marginTop: '4px' }}>
                    <Text style={{ color: 'var(--tg-theme-hint-color)' }}>
                      {exercise.target_sets} подходов • {exercise.target_reps} повторений
                      {exercise.target_weight > 0 && ` • ${exercise.target_weight} кг`}
                    </Text>
                  </div>
                }
              >
                {exercise.exercise_name}
              </Cell>
            ))}
          </List>
        </Section>
      ) : (
        <Section>
          <Placeholder
            description="Добавьте упражнения, чтобы начать тренировку"
          >
            <div style={{ 
              fontSize: '64px',
              marginBottom: '16px'
            }}>
              💪
            </div>
          </Placeholder>
        </Section>
      )}

      {/* Кнопки действий */}
      <div
        style={{
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          padding: '12px 16px 16px',
          backgroundColor: 'var(--tg-theme-bg-color)',
          borderTop: '0.5px solid var(--tg-theme-section-separator-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {/* Главная кнопка */}
        {exercises.length > 0 && (
          <Button
            size="l"
            stretched
            onClick={() => onStartWorkout(program)}
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
          >
            🗑️ Удалить
          </Button>
        </div>
      </div>
    </div>
  );
};

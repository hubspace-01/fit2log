import React, { useState, useEffect } from 'react';
import { 
  Input,
  Title, 
  Text,
  Button
} from '@telegram-apps/telegram-ui';
import { telegramService } from '../lib/telegram';
import type { Program } from '../types';

interface Props {
  onSave: (data: any) => void;
  onBack: () => void;
  initialData?: Program; // ✅ НОВОЕ: Опциональные данные для редактирования
}

export const ProgramEditor: React.FC<Props> = ({ onSave, onBack, initialData }) => {
  const [programName, setProgramName] = useState('');
  const [exercises, setExercises] = useState<any[]>([]);

  // ✅ НОВОЕ: Загружаем данные при редактировании
  useEffect(() => {
    if (initialData) {
      setProgramName(initialData.program_name);
      
      // Сортируем упражнения по order_index и загружаем
      const sortedExercises = [...(initialData.exercises || [])].sort(
        (a, b) => a.order_index - b.order_index
      );
      
      setExercises(sortedExercises.map(ex => ({
        exercise_name: ex.exercise_name,
        target_sets: ex.target_sets,
        target_reps: ex.target_reps,
        target_weight: ex.target_weight,
        notes: ex.notes || ''
      })));
    }
  }, [initialData]);

  const addExercise = () => {
    setExercises([...exercises, {
      exercise_name: '',
      target_sets: 3,
      target_reps: 10,
      target_weight: 0
    }]);
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const updated = [...exercises];
    updated[index][field] = value;
    setExercises(updated);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (programName.trim() && exercises.length > 0) {
      const validExercises = exercises.filter(ex => ex.exercise_name.trim());
      onSave({ program_name: programName, exercises: validExercises });
    }
  };

  useEffect(() => {
    telegramService.showBackButton(() => {
      onBack();
    });

    return () => {
      telegramService.hideBackButton();
    };
  }, [onBack]);

  // ✅ НОВОЕ: Разные заголовки для создания/редактирования
  const title = initialData ? '✏️ Редактирование программы' : '➕ Новая программа';

  return (
    <div style={{ 
      minHeight: '100vh',
      paddingBottom: '40px',
      backgroundColor: 'var(--tg-theme-bg-color)'
    }}>
      {/* Заголовок */}
      <div style={{ 
        padding: '16px',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <Title level="2" weight="2" style={{ fontSize: '24px' }}>
          {title}
        </Title>
      </div>

      {/* Название программы */}
      <div style={{ padding: '0 16px', marginBottom: '24px' }}>
        <div style={{ 
          backgroundColor: 'var(--tg-theme-secondary-bg-color)',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <Text weight="2" style={{ 
            fontSize: '14px', 
            marginBottom: '10px', 
            display: 'block',
            color: 'var(--tg-theme-text-color)',
            textAlign: 'center'
          }}>
            Название программы
          </Text>
          <Input
            placeholder="Введите название"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            style={{ 
              fontSize: '15px', 
              width: '100%',
              backgroundColor: 'var(--tg-theme-bg-color)',
              textAlign: 'center'
            }}
          />
        </div>
      </div>

      {/* Список упражнений */}
      <div style={{ padding: '0 16px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <Title level="3" weight="2" style={{ fontSize: '18px' }}>
            Упражнения ({exercises.length})
          </Title>
          <Button 
            size="s" 
            mode="filled" 
            onClick={addExercise} 
            style={{ fontSize: '14px' }}
          >
            + Добавить
          </Button>
        </div>

        {/* Пустое состояние */}
        {exercises.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💪</div>
            <Text style={{ 
              color: 'var(--tg-theme-hint-color)', 
              fontSize: '15px',
              display: 'block',
              marginBottom: '8px'
            }}>
              Добавьте упражнения в программу
            </Text>
            <Text style={{ 
              color: 'var(--tg-theme-hint-color)', 
              fontSize: '13px',
              display: 'block'
            }}>
              Нажмите кнопку "+ Добавить"
            </Text>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            {exercises.map((ex, i) => (
              <div 
                key={i} 
                style={{ 
                  backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                  borderRadius: '12px',
                  padding: '16px'
                }}
              >
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <Text weight="2" style={{ 
                    fontSize: '14px', 
                    color: 'var(--tg-theme-hint-color)' 
                  }}>
                    Упражнение #{i + 1}
                  </Text>
                  <Button 
                    size="s" 
                    mode="outline"
                    onClick={() => removeExercise(i)}
                    style={{ 
                      color: 'var(--tg-theme-destructive-text-color)',
                      borderColor: 'var(--tg-theme-destructive-text-color)',
                      fontSize: '12px',
                      padding: '4px 10px'
                    }}
                  >
                    🗑️
                  </Button>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <Text weight="2" style={{ 
                    fontSize: '13px', 
                    marginBottom: '8px', 
                    display: 'block',
                    color: 'var(--tg-theme-text-color)',
                    textAlign: 'center'
                  }}>
                    Название упражнения
                  </Text>
                  <Input
                    placeholder="Например: Жим лежа"
                    value={ex.exercise_name}
                    onChange={(e) => updateExercise(i, 'exercise_name', e.target.value)}
                    style={{ 
                      fontSize: '15px', 
                      width: '100%',
                      backgroundColor: 'var(--tg-theme-bg-color)'
                    }}
                  />
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr', 
                  gap: '10px'
                }}>
                  <div>
                    <Text weight="2" style={{ 
                      fontSize: '12px', 
                      marginBottom: '8px', 
                      display: 'block',
                      color: 'var(--tg-theme-text-color)',
                      textAlign: 'center'
                    }}>
                      Подходы
                    </Text>
                    <Input
                      type="number"
                      value={ex.target_sets}
                      onChange={(e) => updateExercise(i, 'target_sets', parseInt(e.target.value) || 0)}
                      style={{ 
                        fontSize: '14px', 
                        width: '100%', 
                        textAlign: 'center',
                        backgroundColor: 'var(--tg-theme-bg-color)'
                      }}
                    />
                  </div>
                  <div>
                    <Text weight="2" style={{ 
                      fontSize: '12px', 
                      marginBottom: '8px', 
                      display: 'block',
                      color: 'var(--tg-theme-text-color)',
                      textAlign: 'center'
                    }}>
                      Повторы
                    </Text>
                    <Input
                      type="number"
                      value={ex.target_reps}
                      onChange={(e) => updateExercise(i, 'target_reps', parseInt(e.target.value) || 0)}
                      style={{ 
                        fontSize: '14px', 
                        width: '100%', 
                        textAlign: 'center',
                        backgroundColor: 'var(--tg-theme-bg-color)'
                      }}
                    />
                  </div>
                  <div>
                    <Text weight="2" style={{ 
                      fontSize: '12px', 
                      marginBottom: '8px', 
                      display: 'block',
                      color: 'var(--tg-theme-text-color)',
                      textAlign: 'center'
                    }}>
                      Вес (кг)
                    </Text>
                    <Input
                      type="number"
                      value={ex.target_weight}
                      onChange={(e) => updateExercise(i, 'target_weight', parseFloat(e.target.value) || 0)}
                      style={{ 
                        fontSize: '14px', 
                        width: '100%', 
                        textAlign: 'center',
                        backgroundColor: 'var(--tg-theme-bg-color)'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Кнопка сохранить */}
            <div style={{ marginTop: '8px' }}>
              <Button 
                size="l"
                stretched
                mode="filled"
                onClick={handleSave}
                disabled={!programName.trim() || exercises.length === 0}
                style={{ fontSize: '16px' }}
              >
                💾 Сохранить программу
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

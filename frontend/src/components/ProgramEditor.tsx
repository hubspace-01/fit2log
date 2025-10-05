import React, { useState, useEffect } from 'react';
import { 
  Input,
  Textarea,
  Title, 
  Text,
  Button
} from '@telegram-apps/telegram-ui';
import { telegramService } from '../lib/telegram';
import type { Program } from '../types';

interface Props {
  onSave: (data: any) => void;
  onBack: () => void;
  initialData?: Program;
}

export const ProgramEditor: React.FC<Props> = ({ onSave, onBack, initialData }) => {
  const [programName, setProgramName] = useState('');
  const [exercises, setExercises] = useState<any[]>([]);

  useEffect(() => {
    if (initialData) {
      setProgramName(initialData.program_name);
      
      const sortedExercises = [...(initialData.exercises || [])].sort(
        (a, b) => a.order_index - b.order_index
      );
      
      setExercises(sortedExercises.map(ex => ({
        exercise_name: ex.exercise_name,
        exercise_type: ex.exercise_type || 'reps',
        target_sets: ex.target_sets,
        target_reps: ex.target_reps,
        target_weight: ex.target_weight,
        duration: ex.duration || 0,
        distance: ex.distance || 0,
        notes: ex.notes || ''
      })));
    }
  }, [initialData]);

  const addExercise = () => {
    setExercises([...exercises, {
      exercise_name: '',
      exercise_type: 'reps',
      target_sets: 3,
      target_reps: 10,
      target_weight: 0,
      duration: 0,
      distance: 0,
      notes: ''
    }]);
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const updated = [...exercises];
    updated[index][field] = value;
    
    if (field === 'exercise_type') {
      if (value === 'reps') {
        updated[index].duration = 0;
        updated[index].distance = 0;
      } else if (value === 'time') {
        updated[index].target_reps = 0;
        updated[index].distance = 0;
        updated[index].duration = updated[index].duration || 60;
      } else if (value === 'distance') {
        updated[index].target_reps = 0;
        updated[index].target_weight = 0;
        updated[index].duration = 0;
        updated[index].distance = updated[index].distance || 1000;
      }
    }
    
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

  const title = initialData ? '✏️ Редактирование программы' : '➕ Новая программа';

  return (
    <div style={{ 
      minHeight: '100vh',
      paddingBottom: '40px',
      backgroundColor: 'var(--tg-theme-bg-color)'
    }}>
      <div style={{ 
        padding: '16px',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <Title level="2" weight="2" style={{ fontSize: '24px' }}>
          {title}
        </Title>
      </div>

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

                {/* Выбор типа упражнения */}
                <div style={{ marginBottom: '14px' }}>
                  <Text weight="2" style={{ 
                    fontSize: '13px', 
                    marginBottom: '8px', 
                    display: 'block',
                    color: 'var(--tg-theme-text-color)',
                    textAlign: 'center'
                  }}>
                    Тип упражнения
                  </Text>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr 1fr', 
                    gap: '8px'
                  }}>
                    <Button
                      size="s"
                      mode={ex.exercise_type === 'reps' ? 'filled' : 'outline'}
                      onClick={() => updateExercise(i, 'exercise_type', 'reps')}
                      style={{ fontSize: '11px' }}
                    >
                      💪 Повт
                    </Button>
                    <Button
                      size="s"
                      mode={ex.exercise_type === 'time' ? 'filled' : 'outline'}
                      onClick={() => updateExercise(i, 'exercise_type', 'time')}
                      style={{ fontSize: '11px' }}
                    >
                      ⏱ Время
                    </Button>
                    <Button
                      size="s"
                      mode={ex.exercise_type === 'distance' ? 'filled' : 'outline'}
                      onClick={() => updateExercise(i, 'exercise_type', 'distance')}
                      style={{ fontSize: '11px' }}
                    >
                      🏃 Расст
                    </Button>
                  </div>
                </div>

                {/* Название упражнения */}
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

                {/* Для reps-based */}
                {ex.exercise_type === 'reps' && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr 1fr', 
                    gap: '10px',
                    marginBottom: '14px'
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
                )}

                {/* Для time-based */}
                {ex.exercise_type === 'time' && (
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '10px',
                    marginBottom: '14px'
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
                        Время (сек)
                      </Text>
                      <Input
                        type="number"
                        value={ex.duration}
                        onChange={(e) => updateExercise(i, 'duration', parseInt(e.target.value) || 0)}
                        style={{ 
                          fontSize: '14px', 
                          width: '100%', 
                          textAlign: 'center',
                          backgroundColor: 'var(--tg-theme-bg-color)'
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Для distance-based */}
                {ex.exercise_type === 'distance' && (
                  <div style={{ marginBottom: '14px' }}>
                    <Text weight="2" style={{ 
                      fontSize: '12px', 
                      marginBottom: '8px', 
                      display: 'block',
                      color: 'var(--tg-theme-text-color)',
                      textAlign: 'center'
                    }}>
                      Расстояние (метры)
                    </Text>
                    <Input
                      type="number"
                      value={ex.distance}
                      onChange={(e) => updateExercise(i, 'distance', parseInt(e.target.value) || 0)}
                      style={{ 
                        fontSize: '14px', 
                        width: '100%', 
                        textAlign: 'center',
                        backgroundColor: 'var(--tg-theme-bg-color)'
                      }}
                    />
                  </div>
                )}

                {/* Заметки */}
                <div>
                  <Text weight="2" style={{ 
                    fontSize: '13px', 
                    marginBottom: '8px', 
                    display: 'block',
                    color: 'var(--tg-theme-text-color)',
                    textAlign: 'center'
                  }}>
                    Заметки (опционально)
                  </Text>
                  <Textarea
                    placeholder="Техника, особенности..."
                    value={ex.notes}
                    onChange={(e) => updateExercise(i, 'notes', e.target.value)}
                    style={{ 
                      fontSize: '14px', 
                      width: '100%',
                      minHeight: '60px',
                      backgroundColor: 'var(--tg-theme-bg-color)'
                    }}
                  />
                </div>
              </div>
            ))}

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

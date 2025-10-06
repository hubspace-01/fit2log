import React, { useState, useEffect } from 'react';
import { 
  Input,
  Textarea,
  Title, 
  Text,
  Button,
  Select,
  Checkbox
} from '@telegram-apps/telegram-ui';
import { telegramService } from '../lib/telegram';
import { supabaseService } from '../lib/supabase';
import type { Program } from '../types';

interface Props {
  onSave: (data: any) => void;
  onBack: () => void;
  initialData?: Program;
}

export const ProgramEditor: React.FC<Props> = ({ onSave, onBack, initialData }) => {
  const [programName, setProgramName] = useState('');
  const [exercises, setExercises] = useState<any[]>([]);
  const [isInWeeklySplit, setIsInWeeklySplit] = useState(false);
  const [dayOrder, setDayOrder] = useState<number>(1);
  const [weekdayHint, setWeekdayHint] = useState<string>('');
  const [existingPrograms, setExistingPrograms] = useState<Program[]>([]);

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        const programs = await supabaseService.getPrograms();
        setExistingPrograms(programs);
      } catch (error) {
        console.error('Error loading programs:', error);
      }
    };
    loadPrograms();
  }, []);

  useEffect(() => {
    if (initialData) {
      setProgramName(initialData.program_name);
      
      if (initialData.day_order && initialData.day_order > 0) {
        setIsInWeeklySplit(true);
        setDayOrder(initialData.day_order);
        setWeekdayHint(initialData.weekday_hint || '');
      }
      
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

  const validateDayOrder = (): boolean => {
    if (!isInWeeklySplit) return true;
    
    const duplicate = existingPrograms.find(p => 
      p.day_order === dayOrder && 
      p.id !== initialData?.id
    );
    
    if (duplicate) {
      telegramService.showAlert(`Тренировка с номером ${dayOrder} уже существует: "${duplicate.program_name}". Выберите другой номер.`);
      return false;
    }
    
    return true;
  };

  const handleSave = () => {
    if (!programName.trim()) {
      telegramService.showAlert('Введите название программы');
      return;
    }
    
    if (exercises.length === 0) {
      telegramService.showAlert('Добавьте хотя бы одно упражнение');
      return;
    }
    
    if (!validateDayOrder()) {
      return;
    }
    
    const validExercises = exercises.filter(ex => ex.exercise_name.trim());
    
    // ✅ ИСПРАВЛЕНО: NULL вместо 0
    onSave({ 
      program_name: programName, 
      exercises: validExercises,
      day_order: isInWeeklySplit ? dayOrder : null,
      weekday_hint: isInWeeklySplit && weekdayHint ? weekdayHint : null
    });
  };

  useEffect(() => {
    telegramService.showBackButton(() => {
      onBack();
    });

    return () => {
      // Не скрываем BackButton
    };
  }, [onBack]);

  const title = initialData ? '✏️ Редактирование программы' : '➕ Новая программа';

  const getPlaceholder = (type: string) => {
    switch(type) {
      case 'reps':
        return 'Например: Жим лежа';
      case 'time':
        return 'Например: Планка';
      case 'distance':
        return 'Например: Бег';
      default:
        return 'Введите название';
    }
  };

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

      <div style={{ padding: '0 16px', marginBottom: '24px' }}>
        <div style={{ 
          backgroundColor: 'var(--tg-theme-secondary-bg-color)',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '12px',
            marginBottom: isInWeeklySplit ? '16px' : '0'
          }}>
            <Checkbox
              checked={isInWeeklySplit}
              onChange={(e) => setIsInWeeklySplit(e.target.checked)}
            />
            <div>
              <Text weight="2" style={{ fontSize: '15px', display: 'block' }}>
                Добавить в основной сплит
              </Text>
              <Text style={{ 
                fontSize: '12px', 
                color: 'var(--tg-theme-hint-color)',
                display: 'block',
                marginTop: '2px'
              }}>
                Программа будет выделена зелёным
              </Text>
            </div>
          </div>

          {isInWeeklySplit && (
            <>
              <div style={{ marginBottom: '14px' }}>
                <Text weight="2" style={{ 
                  fontSize: '13px', 
                  marginBottom: '8px', 
                  display: 'block',
                  color: 'var(--tg-theme-text-color)',
                  textAlign: 'center'
                }}>
                  Номер тренировки
                </Text>
                <Select
                  value={dayOrder}
                  onChange={(e) => setDayOrder(parseInt(e.target.value))}
                  style={{ 
                    fontSize: '15px', 
                    width: '100%',
                    backgroundColor: 'var(--tg-theme-bg-color)',
                    textAlign: 'center'
                  }}
                >
                  <option value={1}>1</option>
                  <option value={2}>2</option>
                  <option value={3}>3</option>
                  <option value={4}>4</option>
                  <option value={5}>5</option>
                  <option value={6}>6</option>
                  <option value={7}>7</option>
                </Select>
              </div>

              <div>
                <Text weight="2" style={{ 
                  fontSize: '13px', 
                  marginBottom: '8px', 
                  display: 'block',
                  color: 'var(--tg-theme-text-color)',
                  textAlign: 'center'
                }}>
                  День недели (опционально)
                </Text>
                <Select
                  value={weekdayHint}
                  onChange={(e) => setWeekdayHint(e.target.value)}
                  style={{ 
                    fontSize: '15px', 
                    width: '100%',
                    backgroundColor: 'var(--tg-theme-bg-color)',
                    textAlign: 'center'
                  }}
                >
                  <option value="">Не указано</option>
                  <option value="ПН">Понедельник</option>
                  <option value="ВТ">Вторник</option>
                  <option value="СР">Среда</option>
                  <option value="ЧТ">Четверг</option>
                  <option value="ПТ">Пятница</option>
                  <option value="СБ">Суббота</option>
                  <option value="ВС">Воскресенье</option>
                </Select>
              </div>
            </>
          )}
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
                      �� Расст
                    </Button>
                  </div>
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
                    placeholder={getPlaceholder(ex.exercise_type)}
                    value={ex.exercise_name}
                    onChange={(e) => updateExercise(i, 'exercise_name', e.target.value)}
                    style={{ 
                      fontSize: '15px', 
                      width: '100%',
                      backgroundColor: 'var(--tg-theme-bg-color)'
                    }}
                  />
                </div>

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

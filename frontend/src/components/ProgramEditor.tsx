import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Input,
  Textarea,
  Title, 
  Text,
  Button,
  Select,
  Checkbox,
  Card,
  Spinner
} from '@telegram-apps/telegram-ui';
import { 
  Edit3, 
  Plus, 
  Dumbbell, 
  Clock, 
  Route, 
  Trash2, 
  Save 
} from 'lucide-react';
import { telegramService } from '../lib/telegram';
import { supabaseService } from '../lib/supabase';
import type { Program } from '../types';

interface Props {
  onSave: (data: Partial<Program>) => void;
  onBack: () => void;
  initialData?: Program;
  userId: string;
}

interface ExerciseFormData {
  exercise_name: string;
  exercise_type: 'reps' | 'time' | 'distance';
  target_sets: number;
  target_reps: number;
  target_weight: number;
  target_rpe: number;
  duration: number;
  distance: number;
  notes: string;
}

export const ProgramEditor: React.FC<Props> = ({ onSave, onBack, initialData, userId }) => {
  const [programName, setProgramName] = useState('');
  const [exercises, setExercises] = useState<ExerciseFormData[]>([]);
  const [isInWeeklySplit, setIsInWeeklySplit] = useState(false);
  const [dayOrder, setDayOrder] = useState<number>(1);
  const [weekdayHint, setWeekdayHint] = useState<string>('');
  const [existingPrograms, setExistingPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    telegramService.showBackButton(onBack);
    return () => telegramService.hideBackButton();
  }, [onBack]);

  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setLoading(true);
        const programs = await supabaseService.getPrograms(userId);
        setExistingPrograms(programs);
        telegramService.hapticFeedback('impact', 'light');
      } catch (error) {
        telegramService.showAlert('Ошибка загрузки программ');
        telegramService.hapticFeedback('impact', 'medium');
      } finally {
        setLoading(false);
      }
    };
    loadPrograms();
  }, [userId]);

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
        target_rpe: ex.target_rpe || 0,
        duration: ex.duration || 0,
        distance: ex.distance || 0,
        notes: ex.notes || ''
      })));
    }
  }, [initialData]);

  const addExercise = useCallback(() => {
    telegramService.hapticFeedback('impact', 'light');
    setExercises([...exercises, {
      exercise_name: '',
      exercise_type: 'reps',
      target_sets: 3,
      target_reps: 10,
      target_weight: 0,
      target_rpe: 0,
      duration: 0,
      distance: 0,
      notes: ''
    }]);
  }, [exercises]);

  const updateExercise = useCallback((index: number, field: keyof ExerciseFormData, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    
    if (field === 'exercise_type') {
      telegramService.hapticFeedback('impact', 'light');
      if (value === 'reps') {
        updated[index].duration = 0;
        updated[index].distance = 0;
      } else if (value === 'time') {
        updated[index].target_reps = 0;
        updated[index].target_rpe = 0;
        updated[index].distance = 0;
        updated[index].duration = updated[index].duration || 60;
      } else if (value === 'distance') {
        updated[index].target_reps = 0;
        updated[index].target_weight = 0;
        updated[index].target_rpe = 0;
        updated[index].duration = 0;
        updated[index].distance = updated[index].distance || 1000;
      }
    }
    
    setExercises(updated);
  }, [exercises]);

  const removeExercise = useCallback((index: number) => {
    telegramService.hapticFeedback('impact', 'light');
    telegramService.showConfirm(
      'Удалить упражнение?',
      (confirmed: boolean) => {
        if (confirmed) {
          telegramService.hapticFeedback('impact', 'medium');
          setExercises(exercises.filter((_, i) => i !== index));
        }
      }
    );
  }, [exercises]);

  const validateDayOrder = useCallback((): boolean => {
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
  }, [isInWeeklySplit, dayOrder, existingPrograms, initialData]);

  const handleSave = useCallback(() => {
    if (!programName.trim()) {
      telegramService.hapticFeedback('impact', 'medium');
      telegramService.showAlert('Введите название программы');
      return;
    }
    
    if (exercises.length === 0) {
      telegramService.hapticFeedback('impact', 'medium');
      telegramService.showAlert('Добавьте хотя бы одно упражнение');
      return;
    }
    
    if (!validateDayOrder()) {
      telegramService.hapticFeedback('impact', 'medium');
      return;
    }
    
    const validExercises = exercises.filter(ex => ex.exercise_name.trim());
    
    if (validExercises.length === 0) {
      telegramService.hapticFeedback('impact', 'medium');
      telegramService.showAlert('Заполните названия упражнений');
      return;
    }
    
    telegramService.hapticFeedback('impact', 'light');
    onSave({ 
      program_name: programName, 
      exercises: validExercises as any,
      day_order: isInWeeklySplit ? dayOrder : undefined,
      weekday_hint: isInWeeklySplit && weekdayHint ? weekdayHint : undefined
    });
  }, [programName, exercises, isInWeeklySplit, dayOrder, weekdayHint, validateDayOrder, onSave]);

  const getPlaceholder = useCallback((type: string) => {
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
  }, []);

  const isEditing = useMemo(() => !!initialData, [initialData]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: 'var(--tg-theme-bg-color)'
      }}>
        <Spinner size="l" />
        <Text style={{ color: 'var(--tg-theme-hint-color)' }}>
          Загрузка...
        </Text>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ 
      minHeight: '100vh',
      paddingBottom: '88px',
      backgroundColor: 'var(--tg-theme-bg-color)'
    }}>
      <div style={{
        padding: '20px 16px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          {isEditing ? (
            <Edit3 size={32} color="var(--tg-theme-link-color)" strokeWidth={2} />
          ) : (
            <Plus size={32} color="var(--tg-theme-link-color)" strokeWidth={2} />
          )}
        </div>
        <Title level="1" weight="2" style={{ fontSize: '24px', marginBottom: '4px' }}>
          {isEditing ? 'Редактирование программы' : 'Новая программа'}
        </Title>
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <Card style={{ padding: '0 16px 16px', marginBottom: '16px' }}>
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
        </Card>

        <Card style={{ padding: '0 16px 16px', marginBottom: '16px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: '12px',
            marginBottom: isInWeeklySplit ? '16px' : '0'
          }}>
            <Checkbox
              checked={isInWeeklySplit}
              onChange={(e) => {
                telegramService.hapticFeedback('impact', 'light');
                setIsInWeeklySplit(e.target.checked);
              }}
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
                  onChange={(e) => {
                    telegramService.hapticFeedback('impact', 'light');
                    setDayOrder(parseInt(e.target.value));
                  }}
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
                  value={weekdayHint || ''}
                  onChange={(e) => {
                    telegramService.hapticFeedback('impact', 'light');
                    setWeekdayHint(e.target.value);
                  }}
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
        </Card>

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Plus size={16} strokeWidth={2} />
              <span>Добавить</span>
            </div>
          </Button>
        </div>

        {exercises.length === 0 ? (
          <Card style={{
            textAlign: 'center',
            padding: '60px 16px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '16px'
            }}>
              <Dumbbell 
                size={64} 
                color="var(--tg-theme-hint-color)" 
                strokeWidth={1.5}
              />
            </div>
            <Title level="3" weight="2" style={{ 
              marginBottom: '8px', 
              fontSize: '18px'
            }}>
              Нет упражнений
            </Title>
            <Text style={{ 
              color: 'var(--tg-theme-hint-color)', 
              fontSize: '14px',
              display: 'block'
            }}>
              Добавьте упражнения в программу
            </Text>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {exercises.map((ex, i) => (
              <Card key={i} style={{ padding: '0 16px 16px' }}>
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
                      fontSize: '12px'
                    }}
                  >
                    <Trash2 size={14} strokeWidth={2} />
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
                    gridTemplateColumns: 'repeat(3, 1fr)', 
                    gap: '8px'
                  }}>
                    <Button
                      size="s"
                      mode={ex.exercise_type === 'reps' ? 'filled' : 'outline'}
                      onClick={() => updateExercise(i, 'exercise_type', 'reps')}
                      style={{ fontSize: '11px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                        <Dumbbell size={14} strokeWidth={2} />
                        <span>Повт</span>
                      </div>
                    </Button>
                    <Button
                      size="s"
                      mode={ex.exercise_type === 'time' ? 'filled' : 'outline'}
                      onClick={() => updateExercise(i, 'exercise_type', 'time')}
                      style={{ fontSize: '11px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                        <Clock size={14} strokeWidth={2} />
                        <span>Время</span>
                      </div>
                    </Button>
                    <Button
                      size="s"
                      mode={ex.exercise_type === 'distance' ? 'filled' : 'outline'}
                      onClick={() => updateExercise(i, 'exercise_type', 'distance')}
                      style={{ fontSize: '11px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                        <Route size={14} strokeWidth={2} />
                        <span>Расст</span>
                      </div>
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
                  <>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(3, 1fr)', 
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
                          min="1"
                          value={ex.target_sets}
                          onChange={(e) => updateExercise(i, 'target_sets', Math.max(1, parseInt(e.target.value) || 1))}
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
                          min="1"
                          value={ex.target_reps}
                          onChange={(e) => updateExercise(i, 'target_reps', Math.max(1, parseInt(e.target.value) || 1))}
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
                          min="0"
                          step="0.5"
                          value={ex.target_weight}
                          onChange={(e) => updateExercise(i, 'target_weight', Math.max(0, parseFloat(e.target.value) || 0))}
                          style={{ 
                            fontSize: '14px', 
                            width: '100%', 
                            textAlign: 'center',
                            backgroundColor: 'var(--tg-theme-bg-color)'
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: '14px' }}>
                      <Text weight="2" style={{ 
                        fontSize: '12px', 
                        marginBottom: '8px', 
                        display: 'block',
                        color: 'var(--tg-theme-text-color)',
                        textAlign: 'center'
                      }}>
                        RPE (опционально, 0-10)
                      </Text>
                      <Input
                        type="number"
                        min="0"
                        max="10"
                        step="0.5"
                        placeholder="0"
                        value={ex.target_rpe || ''}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          updateExercise(i, 'target_rpe', isNaN(val) ? 0 : Math.min(10, Math.max(0, val)));
                        }}
                        style={{ 
                          fontSize: '14px', 
                          width: '100%', 
                          textAlign: 'center',
                          backgroundColor: 'var(--tg-theme-bg-color)'
                        }}
                      />
                      <Text style={{ 
                        fontSize: '11px', 
                        color: 'var(--tg-theme-hint-color)',
                        display: 'block',
                        marginTop: '4px',
                        textAlign: 'center'
                      }}>
                        Оценка нагрузки (1-10)
                      </Text>
                    </div>
                  </>
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
                        min="1"
                        value={ex.target_sets}
                        onChange={(e) => updateExercise(i, 'target_sets', Math.max(1, parseInt(e.target.value) || 1))}
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
                        min="1"
                        value={ex.duration}
                        onChange={(e) => updateExercise(i, 'duration', Math.max(1, parseInt(e.target.value) || 1))}
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
                      min="1"
                      value={ex.distance}
                      onChange={(e) => updateExercise(i, 'distance', Math.max(1, parseInt(e.target.value) || 1))}
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
              </Card>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          padding: '12px 16px',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          backgroundColor: 'var(--tg-theme-bg-color)',
          borderTop: '0.5px solid var(--tg-theme-hint-color)',
          zIndex: 10
        }}
      >
        <Button 
          size="l"
          stretched
          mode="filled"
          onClick={handleSave}
          disabled={!programName.trim() || exercises.length === 0}
          style={{ fontSize: '16px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
            <Save size={20} strokeWidth={2} />
            <span>Сохранить программу</span>
          </div>
        </Button>
      </div>
    </div>
  );
};

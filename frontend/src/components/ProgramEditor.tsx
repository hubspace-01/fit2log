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
  Save,
  ChevronUp,
  ChevronDown,
  Info
} from 'lucide-react';
import { telegramService } from '../lib/telegram';
import { supabaseService } from '../lib/supabase';
import type { Program } from '../types';


const ONBOARDING_KEY = 'fit2log_program_editor_onboarding';


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
  duration: number;
  distance: number;
  notes: string;
  time_minutes: number;
  time_seconds: number;
}


export const ProgramEditor: React.FC<Props> = ({ onSave, onBack, initialData, userId }) => {
  const [programName, setProgramName] = useState('');
  const [exercises, setExercises] = useState<ExerciseFormData[]>([]);
  const [isInWeeklySplit, setIsInWeeklySplit] = useState(false);
  const [dayOrder, setDayOrder] = useState<number>(1);
  const [weekdayHint, setWeekdayHint] = useState<string>('');
  const [existingPrograms, setExistingPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);


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
    const hasSeenOnboarding = localStorage.getItem(ONBOARDING_KEY);
    if (!hasSeenOnboarding && !loading) {
      setShowOnboarding(true);
    }
  }, [loading]);


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
      
      setExercises(sortedExercises.map(ex => {
        const totalSeconds = ex.duration || 0;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        return {
          exercise_name: ex.exercise_name,
          exercise_type: ex.exercise_type || 'reps',
          target_sets: ex.target_sets,
          target_reps: ex.target_reps,
          target_weight: ex.target_weight,
          duration: ex.duration || 0,
          distance: ex.distance || 0,
          notes: ex.notes || '',
          time_minutes: minutes,
          time_seconds: seconds
        };
      }));
    }
  }, [initialData]);


  const showHelp = useCallback(() => {
    telegramService.hapticFeedback('impact', 'light');
    telegramService.showAlert(
      '📝 Как заполнять программу:\n\n' +
      'Тип упражнения:\n' +
      '• Повт - упражнения на количество (жим, присед)\n' +
      '• Время - статические (планка)\n' +
      '• Расст - кардио (бег, велосипед)\n\n' +
      'Вес (кг):\n' +
      'Для упражнений с собственным весом (подтягивания, отжимания) оставьте 0 или пусто.\n\n' +
      'Заметки:\n' +
      'Укажите технику выполнения или особенности.'
    );
  }, []);


  useEffect(() => {
    if (showOnboarding) {
      showHelp();
      localStorage.setItem(ONBOARDING_KEY, 'true');
      setShowOnboarding(false);
    }
  }, [showOnboarding, showHelp]);


  const addExercise = useCallback(() => {
    telegramService.hapticFeedback('impact', 'light');
    setExercises([...exercises, {
      exercise_name: '',
      exercise_type: 'reps',
      target_sets: 3,
      target_reps: 10,
      target_weight: 0,
      duration: 0,
      distance: 0,
      notes: '',
      time_minutes: 0,
      time_seconds: 0
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
        updated[index].time_minutes = 0;
        updated[index].time_seconds = 0;
      } else if (value === 'time') {
        updated[index].target_reps = 0;
        updated[index].distance = 0;
        if (updated[index].duration === 0) {
          updated[index].time_minutes = 1;
          updated[index].time_seconds = 0;
          updated[index].duration = 60;
        }
      } else if (value === 'distance') {
        updated[index].target_reps = 0;
        updated[index].target_weight = 0;
        updated[index].duration = 0;
        updated[index].time_minutes = 0;
        updated[index].time_seconds = 0;
        updated[index].distance = updated[index].distance || 0;
      }
    }
    
    if (field === 'time_minutes' || field === 'time_seconds') {
      const minutes = field === 'time_minutes' ? value : updated[index].time_minutes;
      const seconds = field === 'time_seconds' ? value : updated[index].time_seconds;
      updated[index].duration = minutes * 60 + seconds;
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


  const moveExerciseUp = useCallback((index: number) => {
    if (index === 0) return;
    telegramService.hapticFeedback('impact', 'light');
    const updated = [...exercises];
    [updated[index - 1], updated[index]] = [updated[index], updated[index - 1]];
    setExercises(updated);
  }, [exercises]);


  const moveExerciseDown = useCallback((index: number) => {
    if (index === exercises.length - 1) return;
    telegramService.hapticFeedback('impact', 'light');
    const updated = [...exercises];
    [updated[index], updated[index + 1]] = [updated[index + 1], updated[index]];
    setExercises(updated);
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


  const handleNumericKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    if (allowedKeys.includes(e.key)) return;
    if (e.key === '.' && (e.currentTarget.step === '0.5' || e.currentTarget.step === '0.1')) return;
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
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
      paddingBottom: '24px',
      backgroundColor: 'var(--tg-theme-bg-color)'
    }}>
      <div style={{
        padding: '20px 16px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div
          onClick={showHelp}
          style={{
            position: 'absolute',
            top: '20px',
            right: '16px',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'transform 0.15s ease-out',
            WebkitTapHighlightColor: 'transparent'
          }}
          onTouchStart={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(0.9)';
          }}
          onTouchEnd={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
          }}
        >
          <Info size={24} color="var(--tg-theme-hint-color)" strokeWidth={2} />
        </div>

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
        <Card style={{ width: '100%', padding: '16px', marginBottom: '16px' }}>
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
              backgroundColor: 'var(--tg-theme-bg-color)'
            }}
          />
        </Card>


        <Card style={{ width: '100%', padding: '16px', marginBottom: '16px' }}>
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
                    backgroundColor: 'var(--tg-theme-bg-color)'
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
                    backgroundColor: 'var(--tg-theme-bg-color)'
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
            width: '100%',
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
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {exercises.map((ex, i) => (
                <Card key={`exercise-${i}`} style={{ width: '100%', padding: '16px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Text weight="2" style={{ 
                        fontSize: '14px', 
                        color: 'var(--tg-theme-hint-color)' 
                      }}>
                        Упражнение #{i + 1}
                      </Text>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {i > 0 && (
                          <div
                            onClick={() => moveExerciseUp(i)}
                            style={{
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '4px',
                              backgroundColor: 'var(--tg-theme-secondary-bg-color)'
                            }}
                          >
                            <ChevronUp size={16} color="var(--tg-theme-link-color)" strokeWidth={2} />
                          </div>
                        )}
                        {i < exercises.length - 1 && (
                          <div
                            onClick={() => moveExerciseDown(i)}
                            style={{
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '4px',
                              backgroundColor: 'var(--tg-theme-secondary-bg-color)'
                            }}
                          >
                            <ChevronDown size={16} color="var(--tg-theme-link-color)" strokeWidth={2} />
                          </div>
                        )}
                      </div>
                    </div>
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
                          inputMode="numeric"
                          pattern="[0-9]*"
                          min="1"
                          placeholder="3"
                          value={ex.target_sets || ''}
                          onKeyDown={handleNumericKeyDown}
                          onChange={(e) => updateExercise(i, 'target_sets', e.target.value === '' ? 0 : Math.max(1, parseInt(e.target.value) || 1))}
                          style={{ 
                            fontSize: '14px', 
                            width: '100%',
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
                          inputMode="numeric"
                          pattern="[0-9]*"
                          min="1"
                          placeholder="10"
                          value={ex.target_reps || ''}
                          onKeyDown={handleNumericKeyDown}
                          onChange={(e) => updateExercise(i, 'target_reps', e.target.value === '' ? 0 : Math.max(1, parseInt(e.target.value) || 1))}
                          style={{ 
                            fontSize: '14px', 
                            width: '100%',
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
                          inputMode="decimal"
                          min="0"
                          step="0.5"
                          placeholder="0"
                          value={ex.target_weight || ''}
                          onKeyDown={handleNumericKeyDown}
                          onChange={(e) => updateExercise(i, 'target_weight', e.target.value === '' ? 0 : Math.max(0, parseFloat(e.target.value) || 0))}
                          style={{ 
                            fontSize: '14px', 
                            width: '100%',
                            backgroundColor: 'var(--tg-theme-bg-color)'
                          }}
                        />
                      </div>
                    </div>
                  )}


                  {ex.exercise_type === 'time' && (
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
                          inputMode="numeric"
                          pattern="[0-9]*"
                          min="1"
                          placeholder="3"
                          value={ex.target_sets || ''}
                          onKeyDown={handleNumericKeyDown}
                          onChange={(e) => updateExercise(i, 'target_sets', e.target.value === '' ? 0 : Math.max(1, parseInt(e.target.value) || 1))}
                          style={{ 
                            fontSize: '14px', 
                            width: '100%',
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
                          Минуты
                        </Text>
                        <Input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          min="0"
                          placeholder="1"
                          value={ex.time_minutes || ''}
                          onKeyDown={handleNumericKeyDown}
                          onChange={(e) => updateExercise(i, 'time_minutes', e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value) || 0))}
                          style={{ 
                            fontSize: '14px', 
                            width: '100%',
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
                          Секунды
                        </Text>
                        <Input
                          type="number"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          min="0"
                          max="59"
                          placeholder="0"
                          value={ex.time_seconds || ''}
                          onKeyDown={handleNumericKeyDown}
                          onChange={(e) => updateExercise(i, 'time_seconds', e.target.value === '' ? 0 : Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))}
                          style={{ 
                            fontSize: '14px', 
                            width: '100%',
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
                        inputMode="numeric"
                        pattern="[0-9]*"
                        min="1"
                        placeholder="1000"
                        value={ex.distance || ''}
                        onKeyDown={handleNumericKeyDown}
                        onChange={(e) => updateExercise(i, 'distance', e.target.value === '' ? 0 : Math.max(1, parseInt(e.target.value) || 1))}
                        style={{ 
                          fontSize: '14px', 
                          width: '100%',
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

            <Button 
              size="m" 
              stretched
              mode="filled" 
              onClick={addExercise} 
              style={{ fontSize: '15px', marginTop: '16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <Plus size={20} strokeWidth={2} />
                <span>Добавить упражнение</span>
              </div>
            </Button>

            <Button 
              size="l"
              stretched
              mode="filled"
              onClick={handleSave}
              disabled={!programName.trim() || exercises.length === 0}
              style={{ fontSize: '16px', marginTop: '16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <Save size={20} strokeWidth={2} />
                <span>Сохранить программу</span>
              </div>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

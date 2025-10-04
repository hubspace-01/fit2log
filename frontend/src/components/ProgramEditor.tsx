import React, { useState } from 'react';
import { 
  Button, 
  Input,
  Title, 
  Text
} from '@telegram-apps/telegram-ui';

interface Props {
  onSave: (data: any) => void;
  onBack: () => void;
}

export const ProgramEditor: React.FC<Props> = ({ onSave, onBack }) => {
  const [programName, setProgramName] = useState('');
  const [exercises, setExercises] = useState<any[]>([]);

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

  return (
    <div style={{ 
      minHeight: '100vh',
      paddingBottom: '200px',
      backgroundColor: 'var(--tg-theme-bg-color)'
    }}>
      {/* Заголовок */}
      <div style={{ 
        padding: '16px',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <Title level="2" weight="2" style={{ fontSize: '24px' }}>
          ➕ Новая программа
        </Title>
      </div>

      {/* Название программы - растянуто */}
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

        {/* Пустое состояние - текст по центру без фона */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
            {exercises.map((ex, i) => (
              <div 
                key={i} 
                style={{ 
                  backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                  borderRadius: '12px',
                  padding: '16px'
                }}
              >
                {/* Номер упражнения и кнопка удалить */}
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
                
                {/* Параметры */}
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
          </div>
        )}
      </div>

      {/* Нижняя панель с кнопками - обе outline как Шаблоны/Создать */}
      <div style={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '12px 16px',
        paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
        backgroundColor: 'var(--tg-theme-bg-color)',
        borderTop: '1px solid var(--tg-theme-section-separator-color)',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
        zIndex: 1000
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <Button 
            size="m"
            stretched
            mode="outline"
            onClick={handleSave}
            disabled={!programName.trim() || exercises.length === 0}
            style={{ fontSize: '14px' }}
          >
            💾 Сохранить
          </Button>
          <Button 
            size="m"
            stretched
            mode="outline"
            onClick={onBack}
            style={{ fontSize: '14px' }}
          >
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
};

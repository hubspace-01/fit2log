import React, { useState } from 'react';
import { 
  Section, 
  Button, 
  Input,
  Title, 
  Text,
  Card
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
    <div className="app-container fade-in" style={{ 
      padding: '16px', 
      paddingBottom: '120px',
      minHeight: '100vh'
    }}>
      {/* Заголовок */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <Title level="2" weight="2" style={{ fontSize: '24px' }}>
          ➕ Новая программа
        </Title>
      </div>

      {/* Название программы */}
      <Section style={{ marginBottom: '20px' }}>
        <Card style={{ padding: '16px' }}>
          <Text weight="2" style={{ fontSize: '14px', marginBottom: '8px', display: 'block' }}>
            Название программы
          </Text>
          <Input
            placeholder="Введите название"
            value={programName}
            onChange={(e) => setProgramName(e.target.value)}
            style={{ fontSize: '15px', width: '100%' }}
          />
        </Card>
      </Section>

      {/* Список упражнений */}
      <Section>
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
          <Card style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>💪</div>
            <Text style={{ 
              color: 'var(--tg-theme-hint-color)', 
              fontSize: '14px',
              marginBottom: '8px',
              display: 'block'
            }}>
              Добавьте упражнения в программу
            </Text>
            <Text style={{ 
              color: 'var(--tg-theme-hint-color)', 
              fontSize: '12px'
            }}>
              Нажмите кнопку "+ Добавить"
            </Text>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {exercises.map((ex, i) => (
              <Card key={i} style={{ padding: '16px' }}>
                {/* Номер упражнения */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <Text weight="2" style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>
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
                      padding: '4px 12px'
                    }}
                  >
                    🗑️ Удалить
                  </Button>
                </div>

                {/* Название упражнения */}
                <div style={{ marginBottom: '12px' }}>
                  <Text weight="2" style={{ fontSize: '13px', marginBottom: '6px', display: 'block' }}>
                    Название
                  </Text>
                  <Input
                    placeholder="Например: Жим лежа"
                    value={ex.exercise_name}
                    onChange={(e) => updateExercise(i, 'exercise_name', e.target.value)}
                    style={{ fontSize: '15px', width: '100%' }}
                  />
                </div>
                
                {/* Параметры */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr', 
                  gap: '10px'
                }}>
                  <div>
                    <Text weight="2" style={{ fontSize: '12px', marginBottom: '6px', display: 'block' }}>
                      Подходы
                    </Text>
                    <Input
                      type="number"
                      value={ex.target_sets}
                      onChange={(e) => updateExercise(i, 'target_sets', parseInt(e.target.value) || 0)}
                      style={{ fontSize: '14px', width: '100%', textAlign: 'center' }}
                    />
                  </div>
                  <div>
                    <Text weight="2" style={{ fontSize: '12px', marginBottom: '6px', display: 'block' }}>
                      Повторы
                    </Text>
                    <Input
                      type="number"
                      value={ex.target_reps}
                      onChange={(e) => updateExercise(i, 'target_reps', parseInt(e.target.value) || 0)}
                      style={{ fontSize: '14px', width: '100%', textAlign: 'center' }}
                    />
                  </div>
                  <div>
                    <Text weight="2" style={{ fontSize: '12px', marginBottom: '6px', display: 'block' }}>
                      Вес (кг)
                    </Text>
                    <Input
                      type="number"
                      value={ex.target_weight}
                      onChange={(e) => updateExercise(i, 'target_weight', parseFloat(e.target.value) || 0)}
                      style={{ fontSize: '14px', width: '100%', textAlign: 'center' }}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Section>

      {/* Нижняя панель с кнопками */}
      <div style={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px',
        backgroundColor: 'var(--tg-theme-bg-color)',
        borderTop: '1px solid var(--tg-theme-section-separator-color)',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
        zIndex: 100
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
          <Button 
            size="l"
            stretched
            mode="filled"
            onClick={handleSave}
            disabled={!programName.trim() || exercises.length === 0}
            style={{ fontSize: '15px' }}
          >
            💾 Сохранить
          </Button>
          <Button 
            size="l"
            mode="outline"
            onClick={onBack}
            style={{ fontSize: '15px' }}
          >
            Отмена
          </Button>
        </div>
      </div>
    </div>
  );
};

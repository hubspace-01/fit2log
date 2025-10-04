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
    <div className="app-container fade-in" style={{ padding: '16px', paddingBottom: '100px' }}>
      <Title level="1" weight="1" style={{ marginBottom: '24px' }}>
        ➕ Новая программа
      </Title>

      <Section header="Название программы">
        <Input
          header="Название"
          placeholder="Введите название программы"
          value={programName}
          onChange={(e) => setProgramName(e.target.value)}
        />
      </Section>

      <Section 
        header={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Title level="2" weight="2">Упражнения ({exercises.length})</Title>
            <Button size="s" mode="filled" onClick={addExercise}>
              + Добавить
            </Button>
          </div>
        }
      >
        {exercises.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>💪</div>
            <Text style={{ color: 'var(--tg-theme-hint-color)' }}>
              Добавьте упражнения в программу
            </Text>
          </Card>
        ) : (
          exercises.map((ex, i) => (
            <Card key={i} style={{ marginBottom: '12px', padding: '16px' }}>
              <Input
                header="Упражнение"
                placeholder="Название упражнения"
                value={ex.exercise_name}
                onChange={(e) => updateExercise(i, 'exercise_name', e.target.value)}
                style={{ marginBottom: '12px' }}
              />
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr', 
                gap: '8px',
                marginBottom: '12px'
              }}>
                <Input
                  header="Подходы"
                  type="number"
                  value={ex.target_sets}
                  onChange={(e) => updateExercise(i, 'target_sets', parseInt(e.target.value) || 0)}
                />
                <Input
                  header="Повторы"
                  type="number"
                  value={ex.target_reps}
                  onChange={(e) => updateExercise(i, 'target_reps', parseInt(e.target.value) || 0)}
                />
                <Input
                  header="Вес (кг)"
                  type="number"
                  value={ex.target_weight}
                  onChange={(e) => updateExercise(i, 'target_weight', parseFloat(e.target.value) || 0)}
                />
              </div>

              <Button 
                size="s" 
                mode="outline" 
                stretched
                onClick={() => removeExercise(i)}
                style={{ color: 'var(--tg-theme-destructive-text-color)' }}
              >
                🗑️ Удалить
              </Button>
            </Card>
          ))
        )}
      </Section>

      <div style={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px',
        backgroundColor: 'var(--tg-theme-bg-color)',
        borderTop: '1px solid var(--tg-theme-section-separator-color)',
        display: 'flex',
        gap: '12px'
      }}>
        <Button 
          size="l"
          stretched
          mode="filled"
          onClick={handleSave}
          disabled={!programName.trim() || exercises.length === 0}
        >
          💾 Сохранить
        </Button>
        <Button 
          size="l"
          mode="outline"
          onClick={onBack}
        >
          Отмена
        </Button>
      </div>
    </div>
  );
};

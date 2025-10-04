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
    <div className="app-container fade-in" style={{ padding: '12px', paddingBottom: '100px' }}>
      <Title level="2" weight="2" style={{ marginBottom: '20px', fontSize: '24px', padding: '4px' }}>
        ➕ Новая программа
      </Title>

      <Section>
        <Input
          header="Название программы"
          placeholder="Введите название"
          value={programName}
          onChange={(e) => setProgramName(e.target.value)}
          style={{ fontSize: '15px' }}
        />
      </Section>

      <Section 
        header={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
            <Title level="3" weight="2" style={{ fontSize: '17px' }}>
              Упражнения ({exercises.length})
            </Title>
            <Button size="s" mode="filled" onClick={addExercise} style={{ fontSize: '13px' }}>
              + Добавить
            </Button>
          </div>
        }
      >
        {exercises.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '24px 12px' }}>
            <div style={{ fontSize: '36px', marginBottom: '10px' }}>💪</div>
            <Text style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px' }}>
              Добавьте упражнения
            </Text>
          </Card>
        ) : (
          exercises.map((ex, i) => (
            <Card key={i} style={{ marginBottom: '10px', padding: '12px' }}>
              <Input
                header="Упражнение"
                placeholder="Название"
                value={ex.exercise_name}
                onChange={(e) => updateExercise(i, 'exercise_name', e.target.value)}
                style={{ marginBottom: '10px', fontSize: '14px' }}
              />
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr', 
                gap: '6px',
                marginBottom: '10px'
              }}>
                <Input
                  header="Подходы"
                  type="number"
                  value={ex.target_sets}
                  onChange={(e) => updateExercise(i, 'target_sets', parseInt(e.target.value) || 0)}
                  style={{ fontSize: '14px' }}
                />
                <Input
                  header="Повторы"
                  type="number"
                  value={ex.target_reps}
                  onChange={(e) => updateExercise(i, 'target_reps', parseInt(e.target.value) || 0)}
                  style={{ fontSize: '14px' }}
                />
                <Input
                  header="Вес"
                  type="number"
                  value={ex.target_weight}
                  onChange={(e) => updateExercise(i, 'target_weight', parseFloat(e.target.value) || 0)}
                  style={{ fontSize: '14px' }}
                />
              </div>

              <Button 
                size="s" 
                mode="outline" 
                stretched
                onClick={() => removeExercise(i)}
                style={{ color: 'var(--tg-theme-destructive-text-color)', fontSize: '13px' }}
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
        padding: '12px',
        backgroundColor: 'var(--tg-theme-bg-color)',
        borderTop: '1px solid var(--tg-theme-section-separator-color)',
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '10px'
      }}>
        <Button 
          size="m"
          stretched
          mode="filled"
          onClick={handleSave}
          disabled={!programName.trim() || exercises.length === 0}
          style={{ fontSize: '15px' }}
        >
          💾 Сохранить
        </Button>
        <Button 
          size="m"
          mode="outline"
          onClick={onBack}
          style={{ fontSize: '15px' }}
        >
          Отмена
        </Button>
      </div>
    </div>
  );
};

import React, { useState } from 'react';

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

  const handleSave = () => {
    if (programName.trim() && exercises.length > 0) {
      onSave({ program_name: programName, exercises });
    }
  };

  return (
    <div style={{ padding: '16px' }}>
      <h1>Новая программа</h1>
      
      <div style={{ marginBottom: '16px' }}>
        <label>Название программы</label>
        <input
          type="text"
          value={programName}
          onChange={(e) => setProgramName(e.target.value)}
          placeholder="Введите название"
          style={{ width: '100%', padding: '8px', marginTop: '4px' }}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <h3>Упражнения ({exercises.length})</h3>
        {exercises.map((ex, i) => (
          <div key={i} style={{ marginBottom: '12px', padding: '12px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <input
              type="text"
              value={ex.exercise_name}
              onChange={(e) => updateExercise(i, 'exercise_name', e.target.value)}
              placeholder="Название упражнения"
              style={{ width: '100%', marginBottom: '8px' }}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              <input
                type="number"
                value={ex.target_sets}
                onChange={(e) => updateExercise(i, 'target_sets', parseInt(e.target.value))}
                placeholder="Подходы"
              />
              <input
                type="number"
                value={ex.target_reps}
                onChange={(e) => updateExercise(i, 'target_reps', parseInt(e.target.value))}
                placeholder="Повторы"
              />
              <input
                type="number"
                value={ex.target_weight}
                onChange={(e) => updateExercise(i, 'target_weight', parseFloat(e.target.value))}
                placeholder="Вес"
              />
            </div>
          </div>
        ))}
        <button onClick={addExercise} style={{ width: '100%' }}>
          + Добавить упражнение
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={handleSave} disabled={!programName || exercises.length === 0} style={{ flex: 1 }}>
          Сохранить
        </button>
        <button onClick={onBack} style={{ flex: 1 }}>
          Отмена
        </button>
      </div>
    </div>
  );
};

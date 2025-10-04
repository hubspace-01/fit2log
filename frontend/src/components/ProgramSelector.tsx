import React from 'react';
import type { Program } from '../types';

interface Props {
  programs: Program[];
  onCreateProgram: () => void;
  onSelectTemplate: () => void;
  onSelectProgram: (program: Program) => void;
}

export const ProgramSelector: React.FC<Props> = ({
  programs,
  onCreateProgram,
  onSelectTemplate,
  onSelectProgram
}) => {
  return (
    <div style={{ padding: '16px' }}>
      <h1>Fit2Log</h1>
      
      {programs.length === 0 ? (
        <div>
          <p>У вас пока нет программ тренировок</p>
          <button onClick={onSelectTemplate} style={{ marginBottom: '8px', width: '100%' }}>
            �� Выбрать готовую программу
          </button>
          <button onClick={onCreateProgram} style={{ width: '100%' }}>
            ✏️ Создать свою программу
          </button>
        </div>
      ) : (
        <div>
          {programs.map((program) => (
            <div 
              key={program.id} 
              onClick={() => onSelectProgram(program)}
              style={{ 
                padding: '12px', 
                marginBottom: '8px', 
                border: '1px solid #ccc',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <strong>{program.program_name}</strong>
              <div style={{ fontSize: '14px', color: '#666' }}>
                {program.exercises?.length || 0} упражнений
              </div>
            </div>
          ))}
          
          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button onClick={onSelectTemplate} style={{ flex: 1 }}>
              📋 Шаблоны
            </button>
            <button onClick={onCreateProgram} style={{ flex: 1 }}>
              ➕ Создать
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

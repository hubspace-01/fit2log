import React from 'react';
import { Lightbulb } from 'lucide-react';

interface ExerciseNotesProps {
  notes: string;
}

export const ExerciseNotes: React.FC<ExerciseNotesProps> = ({ notes }) => {
  return (
    <div style={{ padding: '0 16px 12px' }}>
      <div style={{
        padding: '12px 14px',
        backgroundColor: 'rgba(255, 193, 7, 0.15)',
        border: '1px solid rgba(255, 193, 7, 0.3)',
        borderRadius: '10px',
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          minWidth: '32px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 193, 7, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Lightbulb size={18} color="#FFC107" />
        </div>
        <div style={{ 
          fontSize: '14px',
          color: 'var(--tg-theme-text-color)',
          lineHeight: '1.4',
          flex: 1
        }}>
          {notes}
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Section, Caption } from '@telegram-apps/telegram-ui';
import { Activity } from 'lucide-react';

interface ExerciseProgressProps {
  currentIndex: number;
  total: number;
}

export const ExerciseProgress: React.FC<ExerciseProgressProps> = ({
  currentIndex,
  total
}) => {
  const progress = ((currentIndex + 1) / total) * 100;

  return (
    <Section>
      <div style={{ padding: '12px 16px' }}>
        <Caption level="1" style={{ 
          fontSize: '14px', 
          color: 'var(--tg-theme-hint-color)',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Activity size={16} />
          Упражнение {currentIndex + 1} из {total}
        </Caption>
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: 'var(--tg-theme-secondary-bg-color)',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: 'var(--tg-theme-button-color)',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>
    </Section>
  );
};

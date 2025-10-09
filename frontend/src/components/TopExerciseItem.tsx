import React from 'react';
import { Cell, Caption } from '@telegram-apps/telegram-ui';

interface TopExerciseItemProps {
  rank: number;
  name: string;
  sets: number;
  secondaryMetric?: string;
}

export const TopExerciseItem: React.FC<TopExerciseItemProps> = ({ 
  rank, 
  name, 
  sets, 
  secondaryMetric 
}) => {
  const getGradient = (rank: number) => {
    if (rank === 1) return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
    if (rank === 2) return 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)';
    if (rank === 3) return 'linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)';
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  const formatSets = (sets: number): string => {
    if (sets === 1) return '1 подход';
    if (sets < 5) return `${sets} подхода`;
    return `${sets} подходов`;
  };

  return (
    <Cell
      before={
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: getGradient(rank),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '16px',
          fontWeight: '700'
        }}>
          {rank}
        </div>
      }
      subtitle={
        <Caption level="1" style={{ 
          fontSize: '13px',
          color: 'var(--tg-theme-hint-color)',
          marginTop: '4px'
        }}>
          {formatSets(sets)}
          {secondaryMetric && ` • ${secondaryMetric}`}
        </Caption>
      }
    >
      <div style={{
        fontSize: '15px',
        fontWeight: '500',
        color: 'var(--tg-theme-text-color)'
      }}>
        {name}
      </div>
    </Cell>
  );
};

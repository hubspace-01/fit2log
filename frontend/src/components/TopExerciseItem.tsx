import React from 'react';
import { Cell, Caption } from '@telegram-apps/telegram-ui';
import { TrendingUp } from 'lucide-react';

interface TopExerciseItemProps {
  rank: number;
  name: string;
  sets: number;
}

export const TopExerciseItem: React.FC<TopExerciseItemProps> = ({ rank, name, sets }) => {
  const getGradient = (rank: number) => {
    if (rank === 1) return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
    if (rank === 2) return 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)';
    if (rank === 3) return 'linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)';
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
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
      after={
        <TrendingUp size={20} color="var(--tg-theme-hint-color)" />
      }
      subtitle={
        <Caption level="1" style={{ 
          fontSize: '13px',
          color: 'var(--tg-theme-hint-color)',
          marginTop: '4px'
        }}>
          {sets} {sets === 1 ? 'подход' : sets < 5 ? 'подхода' : 'подходов'}
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

import React from 'react';
import { Cell, Caption } from '@telegram-apps/telegram-ui';
import { Award, Trophy } from 'lucide-react';

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
  const getMedalConfig = (rank: number) => {
    if (rank === 1) {
      return {
        gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
        icon: <Trophy size={20} strokeWidth={2.5} />
      };
    }
    if (rank === 2) {
      return {
        gradient: 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)',
        icon: <Award size={20} strokeWidth={2.5} />
      };
    }
    if (rank === 3) {
      return {
        gradient: 'linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)',
        icon: <Award size={20} strokeWidth={2.5} />
      };
    }
    return {
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      icon: <span style={{ fontSize: '16px', fontWeight: '700' }}>{rank}</span>
    };
  };

  const formatSets = (sets: number): string => {
    if (sets === 1) return '1 подход';
    if (sets < 5) return `${sets} подхода`;
    return `${sets} подходов`;
  };

  const medalConfig = getMedalConfig(rank);

  return (
    <Cell
      before={
        <div style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: medalConfig.gradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          {medalConfig.icon}
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

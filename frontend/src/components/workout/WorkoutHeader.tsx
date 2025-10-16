import React from 'react';
import { Text, Caption } from '@telegram-apps/telegram-ui';
import { Clock } from 'lucide-react';
import { formatTime } from '../../lib/utils/formatters';

interface WorkoutHeaderProps {
  programName: string;
  elapsedTime: number;
}

export const WorkoutHeader: React.FC<WorkoutHeaderProps> = ({
  programName,
  elapsedTime
}) => {
  return (
    <div style={{
      padding: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: 'var(--tg-theme-secondary-bg-color)',
      marginBottom: '8px'
    }}>
      <Text weight="2" style={{ fontSize: '15px' }}>
        {programName}
      </Text>
      <Caption level="1" style={{ 
        fontSize: '14px', 
        color: 'var(--tg-theme-hint-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <Clock size={16} />
        {formatTime(elapsedTime)}
      </Caption>
    </div>
  );
};

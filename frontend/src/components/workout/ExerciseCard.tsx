import React from 'react';
import { Title, Caption } from '@telegram-apps/telegram-ui';
import { Dumbbell, Timer, Footprints } from 'lucide-react';
import { formatDuration } from '../../lib/utils/formatters';
import type { Exercise } from '../../types';

interface ExerciseCardProps {
  exercise: Exercise;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise }) => {
  const exerciseType = exercise.exercise_type || 'reps';

  const getIcon = () => {
    if (exerciseType === 'time') return <Timer size={28} color="var(--tg-theme-link-color)" />;
    if (exerciseType === 'distance') return <Footprints size={28} color="var(--tg-theme-link-color)" />;
    return <Dumbbell size={28} color="var(--tg-theme-link-color)" />;
  };

  const getDescription = () => {
    if (exerciseType === 'reps') {
      return `${exercise.target_sets} подхода × ${exercise.target_reps} повторений`;
    } else if (exerciseType === 'time') {
      const formattedDuration = formatDuration(exercise.duration || 0);
      return `${exercise.target_sets} подхода × ${formattedDuration}`;
    } else if (exerciseType === 'distance') {
      return `${exercise.distance}м`;
    }
    return '';
  };

  return (
    <div style={{ padding: '16px 16px 0', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
        {getIcon()}
      </div>
      <Title level="1" weight="2" style={{ fontSize: '24px', marginBottom: '4px' }}>
        {exercise.exercise_name}
      </Title>
      <Caption level="1" style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>
        {getDescription()}
      </Caption>
    </div>
  );
};

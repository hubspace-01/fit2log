import React from 'react';
import { Button, Divider } from '@telegram-apps/telegram-ui';

interface WorkoutActionsProps {
  saving: boolean;
  isLastSetOfExercise: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const WorkoutActions: React.FC<WorkoutActionsProps> = ({
  saving,
  isLastSetOfExercise,
  onComplete,
  onSkip
}) => {
  return (
    <>
      <Divider />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <Button
          size="l"
          stretched
          mode="filled"
          onClick={onComplete}
          disabled={saving}
          style={{ fontSize: '16px' }}
        >
          {saving ? 'Сохранение...' : 'Выполнить подход'}
        </Button>

        <Button
          size="m"
          stretched
          mode="outline"
          onClick={onSkip}
          disabled={saving}
          style={{ fontSize: '14px' }}
        >
          {isLastSetOfExercise ? 'Следующее упражнение' : 'Пропустить подход'}
        </Button>
      </div>
    </>
  );
};

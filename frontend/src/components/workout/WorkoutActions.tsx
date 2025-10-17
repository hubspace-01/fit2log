import React from 'react';
import { Button, Divider } from '@telegram-apps/telegram-ui';

interface WorkoutActionsProps {
  saving: boolean;
  isLastSetOfExercise: boolean;
  isLastExercise: boolean;
  currentSetNumber: number;
  effectiveTargetSets: number;
  hasCompletedSets: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export const WorkoutActions: React.FC<WorkoutActionsProps> = ({
  saving,
  isLastSetOfExercise,
  isLastExercise,
  currentSetNumber,
  effectiveTargetSets,
  hasCompletedSets,
  onComplete,
  onSkip
}) => {
  const getSkipButtonText = () => {
    // Если упражнение на 1 подход и он ещё не выполнен
    if (effectiveTargetSets === 1 && currentSetNumber === 1 && !hasCompletedSets) {
      return isLastExercise ? 'Завершить тренировку' : 'Пропустить упражнение';
    }
    
    // Если на последнем подходе (или уже все выполнены)
    if (isLastSetOfExercise || currentSetNumber === effectiveTargetSets) {
      return isLastExercise ? 'Завершить тренировку' : 'Следующее упражнение';
    }
    
    // Обычный промежуточный подход
    return 'Пропустить подход';
  };

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
          {getSkipButtonText()}
        </Button>
      </div>
    </>
  );
};

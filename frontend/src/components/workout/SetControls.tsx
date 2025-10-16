import React from 'react';
import { Section } from '@telegram-apps/telegram-ui';
import { Plus } from 'lucide-react';
import { Stepper } from '../Stepper';
import { formatDuration } from '../../lib/utils/formatters';

interface SetControlsProps {
  exerciseType: 'reps' | 'time' | 'distance';
  currentSetNumber: number;
  effectiveTargetSets: number;
  reps: number;
  weight: number;
  duration: number;
  distance: number;
  onRepsChange: (value: number) => void;
  onWeightChange: (value: number) => void;
  onDurationChange: (value: number) => void;
  onDistanceChange: (value: number) => void;
  onAddSet: () => void;
}

export const SetControls: React.FC<SetControlsProps> = ({
  exerciseType,
  currentSetNumber,
  effectiveTargetSets,
  reps,
  weight,
  duration,
  distance,
  onRepsChange,
  onWeightChange,
  onDurationChange,
  onDistanceChange,
  onAddSet
}) => {
  return (
    <Section 
      header={
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '10px',
          padding: '0 16px'
        }}>
          <span>Подход {currentSetNumber} из {effectiveTargetSets}</span>
          <button
            onClick={onAddSet}
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: 'var(--tg-theme-link-color)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0
            }}
          >
            <Plus size={16} />
          </button>
        </div>
      }
      style={{ marginTop: '8px' }}
    >
      <div style={{ padding: '0 16px' }}>
        {exerciseType === 'reps' && (
          <>
            <Stepper
              label="Повторения"
              value={reps}
              onChange={onRepsChange}
              min={1}
              max={50}
              step={1}
            />

            <Stepper
              label="Вес (кг)"
              value={weight}
              onChange={onWeightChange}
              min={0}
              max={500}
              step={2.5}
              suffix=" кг"
            />
          </>
        )}

        {exerciseType === 'time' && (
          <Stepper
            label={duration >= 60 ? `Время (${formatDuration(duration)})` : 'Время (сек)'}
            value={duration}
            onChange={onDurationChange}
            min={5}
            max={600}
            step={5}
            suffix=" сек"
          />
        )}

        {exerciseType === 'distance' && (
          <Stepper
            label="Расстояние (м)"
            value={distance}
            onChange={onDistanceChange}
            min={100}
            max={50000}
            step={100}
            suffix=" м"
          />
        )}
      </div>
    </Section>
  );
};

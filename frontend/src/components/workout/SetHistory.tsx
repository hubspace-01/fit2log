import React from 'react';
import { Section, Cell } from '@telegram-apps/telegram-ui';
import { CheckCircle, Edit2 } from 'lucide-react';
import { formatDuration } from '../../lib/utils/formatters';
import type { CompletedSet } from '../../types';

interface SetHistoryProps {
  sets: CompletedSet[];
  exerciseType: 'reps' | 'time' | 'distance';
  onEditSet: (set: CompletedSet) => void;
}

export const SetHistory: React.FC<SetHistoryProps> = ({
  sets,
  exerciseType,
  onEditSet
}) => {
  if (sets.length === 0) return null;

  return (
    <Section header="История подходов" style={{ marginTop: '8px' }}>
      {sets.map((set, index) => {
        let subtitle = '';
        if (exerciseType === 'reps') {
          subtitle = `${set.reps} повт • ${set.weight} кг`;
        } else if (exerciseType === 'time') {
          subtitle = formatDuration(set.duration || 0);
        } else if (exerciseType === 'distance') {
          subtitle = `${set.distance} м`;
        }

        return (
          <Cell
            key={`set-${index}`}
            before={<CheckCircle size={18} color="var(--tg-theme-link-color)" />}
            after={
              <button
                onClick={() => onEditSet(set)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  padding: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Edit2 size={18} color="var(--tg-theme-hint-color)" />
              </button>
            }
            subtitle={subtitle}
          >
            Подход {set.set_no}
          </Cell>
        );
      })}
    </Section>
  );
};

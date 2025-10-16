import React from 'react';
import { Trophy } from 'lucide-react';
import { formatDuration, formatDate } from '../../lib/utils/formatters';
import type { PersonalRecord } from '../../types';

interface PersonalRecordBadgeProps {
  record: PersonalRecord;
}

export const PersonalRecordBadge: React.FC<PersonalRecordBadgeProps> = ({ record }) => {
  const formatPR = () => {
    if (record.exercise_type === 'reps') {
      return `${record.record_weight}кг × ${record.record_reps}`;
    } else if (record.exercise_type === 'time') {
      return formatDuration(record.record_duration || 0);
    } else if (record.exercise_type === 'distance') {
      return `${record.record_distance}м`;
    }
    return '';
  };

  return (
    <div style={{ padding: '12px 16px' }}>
      <div style={{
        padding: '12px',
        backgroundColor: 'var(--tg-theme-link-color)',
        borderRadius: '10px',
        textAlign: 'center'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          gap: '6px',
          marginBottom: '4px'
        }}>
          <Trophy size={16} color="white" />
          <span style={{ 
            fontSize: '13px',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: '500'
          }}>
            Твой рекорд
          </span>
        </div>
        <div style={{ 
          fontSize: '18px',
          fontWeight: '700',
          color: 'white',
          marginBottom: '2px'
        }}>
          {formatPR()}
        </div>
        <div style={{ 
          fontSize: '11px',
          color: 'rgba(255,255,255,0.8)'
        }}>
          {formatDate(record.achieved_at)}
        </div>
      </div>
    </div>
  );
};

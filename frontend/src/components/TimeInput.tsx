import React, { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { telegramService } from '../lib/telegram';
import { formatDuration } from '../lib/utils/formatters';

interface TimeInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export const TimeInput: React.FC<TimeInputProps> = ({
  label,
  value,
  onChange,
  min = 5,
  max = 3600
}) => {
  const [isMinuteMode, setIsMinuteMode] = useState(value >= 60);

  useEffect(() => {
    setIsMinuteMode(value >= 60);
  }, [value]);

  const step = isMinuteMode ? 30 : 5;

  const handleDecrement = () => {
    if (value > min) {
      telegramService.hapticFeedback('impact', 'light');
      const newValue = Math.max(min, value - step);
      onChange(newValue);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      telegramService.hapticFeedback('impact', 'light');
      const newValue = Math.min(max, value + step);
      onChange(newValue);
    }
  };

  const displayValue = isMinuteMode ? formatDuration(value) : `${value} сек`;

  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ 
        fontSize: '14px', 
        color: 'var(--tg-theme-hint-color)', 
        marginBottom: '8px',
        fontWeight: '500'
      }}>
        {label}
      </div>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '12px 16px',
        backgroundColor: 'var(--tg-theme-secondary-bg-color)',
        borderRadius: '10px'
      }}>
        <button
          onClick={handleDecrement}
          disabled={value <= min}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: value <= min 
              ? 'rgba(var(--tgui--plain_foreground), 0.06)' 
              : 'var(--tg-theme-link-color)',
            color: value <= min 
              ? 'var(--tg-theme-hint-color)' 
              : 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: value <= min ? 'not-allowed' : 'pointer',
            padding: 0,
            transition: 'all 0.2s ease'
          }}
        >
          <Minus size={18} />
        </button>

        <div style={{ 
          fontSize: '20px', 
          fontWeight: '600',
          color: 'var(--tg-theme-text-color)',
          minWidth: '120px',
          textAlign: 'center'
        }}>
          {displayValue}
        </div>

        <button
          onClick={handleIncrement}
          disabled={value >= max}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: value >= max 
              ? 'rgba(var(--tgui--plain_foreground), 0.06)' 
              : 'var(--tg-theme-link-color)',
            color: value >= max 
              ? 'var(--tg-theme-hint-color)' 
              : 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: value >= max ? 'not-allowed' : 'pointer',
            padding: 0,
            transition: 'all 0.2s ease'
          }}
        >
          <Plus size={18} />
        </button>
      </div>
      
      {isMinuteMode && (
        <div style={{ 
          fontSize: '12px', 
          color: 'var(--tg-theme-hint-color)',
          marginTop: '4px',
          textAlign: 'center'
        }}>
          Шаг: 30 сек
        </div>
      )}
    </div>
  );
};

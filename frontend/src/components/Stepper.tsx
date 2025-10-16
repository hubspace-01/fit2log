import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { telegramService } from '../lib/telegram';

interface StepperProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix = ''
}) => {
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
          minWidth: '80px',
          textAlign: 'center'
        }}>
          {value}{suffix}
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
    </div>
  );
};

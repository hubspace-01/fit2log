import React from 'react';
import { Button, Text } from '@telegram-apps/telegram-ui';

interface StepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  suffix?: string;
}

export const Stepper: React.FC<StepperProps> = ({
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  label,
  suffix = ''
}) => {
  const handleDecrement = () => {
    const newValue = value - step;
    if (newValue >= min) {
      onChange(newValue);
    }
  };

  const handleIncrement = () => {
    const newValue = value + step;
    if (newValue <= max) {
      onChange(newValue);
    }
  };

  const isMinDisabled = value <= min;
  const isMaxDisabled = value >= max;

  return (
    <div style={{ marginBottom: '16px' }}>
      {/* Label */}
      {label && (
        <Text 
          weight="2" 
          style={{ 
            fontSize: '13px',
            marginBottom: '8px',
            display: 'block',
            color: 'var(--tg-theme-text-color)',
            textAlign: 'center'
          }}
        >
          {label}
        </Text>
      )}

      {/* Stepper */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 2fr 1fr',
        gap: '8px',
        alignItems: 'center'
      }}>
        {/* Minus Button */}
        <Button
          mode="bezeled"
          size="m"
          onClick={handleDecrement}
          disabled={isMinDisabled}
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            padding: '12px',
            minHeight: '48px',
            backgroundColor: isMinDisabled 
              ? 'var(--tg-theme-secondary-bg-color)' 
              : 'var(--tg-theme-bg-color)',
            opacity: isMinDisabled ? 0.5 : 1
          }}
        >
          −
        </Button>

        {/* Value Display */}
        <div style={{
          backgroundColor: 'var(--tg-theme-secondary-bg-color)',
          borderRadius: '12px',
          padding: '12px',
          textAlign: 'center',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Text style={{ 
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--tg-theme-text-color)'
          }}>
            {value}{suffix}
          </Text>
        </div>

        {/* Plus Button */}
        <Button
          mode="bezeled"
          size="m"
          onClick={handleIncrement}
          disabled={isMaxDisabled}
          style={{
            fontSize: '20px',
            fontWeight: 'bold',
            padding: '12px',
            minHeight: '48px',
            backgroundColor: isMaxDisabled 
              ? 'var(--tg-theme-secondary-bg-color)' 
              : 'var(--tg-theme-bg-color)',
            opacity: isMaxDisabled ? 0.5 : 1
          }}
        >
          +
        </Button>
      </div>
    </div>
  );
};

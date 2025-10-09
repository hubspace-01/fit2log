import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { Text } from '@telegram-apps/telegram-ui';

interface WeekActivityBarProps {
  workoutDates: string[];
}

export const WeekActivityBar: React.FC<WeekActivityBarProps> = ({ workoutDates }) => {
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      days.push(date);
    }
    return days;
  };

  const last7Days = getLast7Days();

  const hasWorkout = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return workoutDates.includes(dateStr);
  };

  const getDayLabel = (date: Date) => {
    const dayIndex = date.getDay();
    return weekDays[dayIndex === 0 ? 6 : dayIndex - 1];
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '16px 0',
      gap: '8px'
    }}>
      {last7Days.map((date, index) => (
        <div
          key={index}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
            flex: 1
          }}
        >
          <Text style={{
            fontSize: '11px',
            color: 'var(--tg-theme-hint-color)',
            fontWeight: '500'
          }}>
            {getDayLabel(date)}
          </Text>
          {hasWorkout(date) ? (
            <CheckCircle
              size={24}
              color="var(--tg-theme-link-color)"
              fill="var(--tg-theme-link-color)"
              strokeWidth={0}
            />
          ) : (
            <Circle
              size={24}
              color="var(--tg-theme-hint-color)"
              strokeWidth={1.5}
            />
          )}
        </div>
      ))}
    </div>
  );
};

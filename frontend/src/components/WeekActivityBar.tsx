import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';
import { Text } from '@telegram-apps/telegram-ui';

interface WeekActivityBarProps {
  workoutDates: string[];
}

export const WeekActivityBar: React.FC<WeekActivityBarProps> = ({ workoutDates }) => {
  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  
  const getCurrentWeekDays = () => {
    const days = [];
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + mondayOffset + i);
      date.setHours(0, 0, 0, 0);
      days.push(date);
    }
    return days;
  };

  const currentWeekDays = getCurrentWeekDays();

  const hasWorkout = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return workoutDates.includes(dateStr);
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      padding: '16px 0',
      gap: '8px'
    }}>
      {currentWeekDays.map((date, index) => (
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
            {weekDays[index]}
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

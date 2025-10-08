import React, { useEffect, useState } from 'react';
import { 
  Section, 
  Button, 
  Title, 
  Text,
  Card,
  Spinner
} from '@telegram-apps/telegram-ui';
import type { WorkoutHistoryItem } from '../types';
import { supabaseService } from '../lib/supabase';
import { telegramService } from '../lib/telegram';


interface Props {
  userId: string;
  onBack: () => void;
  onViewDetail: (workout: WorkoutHistoryItem) => void;
}


export const WorkoutHistory: React.FC<Props> = ({ userId, onBack, onViewDetail }) => {
  const [workouts, setWorkouts] = useState<WorkoutHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();


  useEffect(() => {
    telegramService.showBackButton(onBack);
    return () => telegramService.hideBackButton();
  }, [onBack]);


  useEffect(() => {
    const loadWorkouts = async () => {
      try {
        setLoading(true);
        setError(undefined);
        const data = await supabaseService.getCompletedWorkouts(userId);
        setWorkouts(data);
      } catch (err) {
        console.error('Error loading workout history:', err);
        setError('Ошибка загрузки истории тренировок');
      } finally {
        setLoading(false);
      }
    };

    loadWorkouts();
  }, [userId]);


  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Сегодня в ${date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Вчера в ${date.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else {
      return date.toLocaleDateString('ru-RU', { 
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };


  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}с`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}мин`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}ч ${remainingMinutes}мин`;
  };


  if (loading) {
    return (
      <div className="app-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '50vh' 
      }}>
        <Spinner size="m" />
      </div>
    );
  }


  if (error) {
    return (
      <div className="app-container" style={{ padding: '16px' }}>
        <Section>
          <Card style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <Title level="3" weight="2" style={{ marginBottom: '8px', fontSize: '18px' }}>
              Ошибка
            </Title>
            <Text style={{ 
              color: 'var(--tg-theme-hint-color)', 
              marginBottom: '24px', 
              fontSize: '14px',
              display: 'block'
            }}>
              {error}
            </Text>
            <Button 
              size="m" 
              stretched 
              onClick={() => window.location.reload()}
            >
              Попробовать снова
            </Button>
          </Card>
        </Section>
      </div>
    );
  }


  return (
    <div className="app-container fade-in" style={{ padding: '16px' }}>
      <div style={{ 
        marginBottom: '24px', 
        textAlign: 'center'
      }}>
        <Title level="2" weight="2" style={{ fontSize: '22px' }}>
          📖 История тренировок
        </Title>
      </div>


      {workouts.length === 0 ? (
        <Section>
          <Card style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
            <Title level="3" weight="2" style={{ marginBottom: '8px', fontSize: '18px' }}>
              История пуста
            </Title>
            <Text style={{ 
              color: 'var(--tg-theme-hint-color)', 
              fontSize: '14px',
              display: 'block'
            }}>
              Завершите первую тренировку, и она появится здесь
            </Text>
          </Card>
        </Section>
      ) : (
        <Section>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {workouts.map((workout) => (
              <Card key={workout.id} style={{ width: '100%' }}>
                <div style={{ 
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text weight="2" style={{ 
                      fontSize: '16px',
                      display: 'block',
                      marginBottom: '4px'
                    }}>
                      {workout.program_name}
                    </Text>
                    <Text style={{ 
                      fontSize: '13px',
                      color: 'var(--tg-theme-hint-color)',
                      display: 'block',
                      marginBottom: '4px'
                    }}>
                      {formatDate(workout.completed_at)}
                    </Text>
                    <Text style={{ 
                      fontSize: '13px',
                      color: 'var(--tg-theme-hint-color)'
                    }}>
                      ⏱️ {formatDuration(workout.total_duration || 0)} | 
                      🏋️ {workout.exercises_count} упражн. | 
                      📊 {workout.total_sets} подходов
                    </Text>
                  </div>
                  <Button 
                    size="s" 
                    mode="outline"
                    onClick={() => onViewDetail(workout)}
                    style={{ 
                      fontSize: '13px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    Подробнее
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
};

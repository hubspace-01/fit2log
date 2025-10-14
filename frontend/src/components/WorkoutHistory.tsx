import React, { useEffect, useState, useCallback } from 'react';
import { 
  Section, 
  Button, 
  Title, 
  Text,
  Card,
  Spinner
} from '@telegram-apps/telegram-ui';
import { 
  History,
  AlertCircle, 
  Calendar, 
  Clock, 
  Dumbbell, 
  BarChart2,
  ChevronRight
} from 'lucide-react';
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

  const loadWorkouts = useCallback(async () => {
    try {
      setLoading(true);
      setError(undefined);
      const data = await supabaseService.getCompletedWorkouts(userId);
      setWorkouts(data);
      telegramService.hapticFeedback('impact', 'light');
    } catch (err) {
      telegramService.hapticFeedback('impact', 'medium');
      setError('Ошибка загрузки истории тренировок');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadWorkouts();
  }, [loadWorkouts]);

  const handleRetry = useCallback(() => {
    telegramService.hapticFeedback('impact', 'light');
    loadWorkouts();
  }, [loadWorkouts]);

  const handleViewDetail = useCallback((workout: WorkoutHistoryItem) => {
    telegramService.hapticFeedback('impact', 'light');
    onViewDetail(workout);
  }, [onViewDetail]);

  const formatDate = useCallback((dateString: string) => {
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
  }, []);

  const formatDuration = useCallback((seconds: number) => {
    if (seconds < 60) return `${seconds}с`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}мин`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}ч ${remainingMinutes}мин`;
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        backgroundColor: 'var(--tg-theme-bg-color)'
      }}>
        <Spinner size="m" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in" style={{ padding: '16px', minHeight: '100vh', backgroundColor: 'var(--tg-theme-bg-color)' }}>
        <div style={{ 
          marginBottom: '24px', 
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px'
        }}>
          <History size={24} color="var(--tg-theme-link-color)" strokeWidth={2} />
          <Title level="2" weight="2" style={{ fontSize: '22px' }}>
            История тренировок
          </Title>
        </div>
        <Section>
          <Card style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '16px'
            }}>
              <AlertCircle 
                size={48} 
                color="var(--tg-theme-destructive-text-color)" 
                strokeWidth={1.5}
              />
            </div>
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
              onClick={handleRetry}
              style={{ fontSize: '15px' }}
            >
              Попробовать снова
            </Button>
          </Card>
        </Section>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '16px', minHeight: '100vh', backgroundColor: 'var(--tg-theme-bg-color)' }}>
      <div style={{ 
        marginBottom: '24px', 
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px'
      }}>
        <History size={24} color="var(--tg-theme-link-color)" strokeWidth={2} />
        <Title level="2" weight="2" style={{ fontSize: '22px' }}>
          История тренировок
        </Title>
      </div>

      {workouts.length === 0 ? (
        <Section>
          <Card style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '16px'
            }}>
              <Calendar 
                size={48} 
                color="var(--tg-theme-hint-color)" 
                strokeWidth={1.5}
              />
            </div>
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
              <Card 
                key={workout.id} 
                style={{ 
                  width: '100%',
                  cursor: 'pointer'
                }}
                onClick={() => handleViewDetail(workout)}
              >
                <div style={{ 
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text weight="2" style={{ 
                      fontSize: '16px',
                      display: 'block',
                      marginBottom: '6px'
                    }}>
                      {workout.program_name}
                    </Text>
                    <Text style={{ 
                      fontSize: '13px',
                      color: 'var(--tg-theme-hint-color)',
                      display: 'block',
                      marginBottom: '8px'
                    }}>
                      {formatDate(workout.completed_at)}
                    </Text>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      flexWrap: 'wrap'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock 
                          size={14} 
                          color="var(--tg-theme-hint-color)" 
                          strokeWidth={2}
                        />
                        <Text style={{ 
                          fontSize: '13px',
                          color: 'var(--tg-theme-hint-color)'
                        }}>
                          {formatDuration(workout.total_duration || 0)}
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Dumbbell 
                          size={14} 
                          color="var(--tg-theme-hint-color)" 
                          strokeWidth={2}
                        />
                        <Text style={{ 
                          fontSize: '13px',
                          color: 'var(--tg-theme-hint-color)'
                        }}>
                          {workout.exercises_count} упр.
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <BarChart2 
                          size={14} 
                          color="var(--tg-theme-hint-color)" 
                          strokeWidth={2}
                        />
                        <Text style={{ 
                          fontSize: '13px',
                          color: 'var(--tg-theme-hint-color)'
                        }}>
                          {workout.total_sets} подх.
                        </Text>
                      </div>
                    </div>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    paddingTop: '4px'
                  }}>
                    <ChevronRight 
                      size={20} 
                      color="var(--tg-theme-hint-color)" 
                      strokeWidth={2}
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
};

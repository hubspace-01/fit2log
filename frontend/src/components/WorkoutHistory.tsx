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
  AlertCircle, 
  Calendar, 
  Clock, 
  Dumbbell, 
  BarChart2 
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
    } catch (err) {
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

  const getDateInfo = useCallback((dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    let label = '';
    let badgeColor = '';

    if (date.toDateString() === today.toDateString()) {
      label = 'Сегодня';
      badgeColor = '#10B981';
    } else if (date.toDateString() === yesterday.toDateString()) {
      label = 'Вчера';
      badgeColor = '#F59E0B';
    }

    const timeString = date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const dateString = date.toLocaleDateString('ru-RU', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    return { label, badgeColor, timeString, dateString };
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
        minHeight: '60vh'
      }}>
        <Spinner size="m" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in" style={{ padding: '16px', minHeight: '60vh' }}>
        <Section>
          <Card style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '16px'
            }}>
              <AlertCircle 
                size={48} 
                color="#EF4444"
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
            >
              Попробовать снова
            </Button>
          </Card>
        </Section>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ padding: '16px', minHeight: '60vh' }}>
      <div style={{ 
        marginBottom: '24px', 
        textAlign: 'center'
      }}>
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
            {workouts.map((workout) => {
              const dateInfo = getDateInfo(workout.completed_at);
              return (
                <Card 
                  key={workout.id} 
                  style={{ 
                    width: '100%',
                    border: '1px solid var(--tg-theme-hint-color)',
                    borderOpacity: 0.1
                  }}
                >
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
                        marginBottom: '6px'
                      }}>
                        {workout.program_name}
                      </Text>
                      
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        {dateInfo.label && (
                          <div style={{
                            backgroundColor: dateInfo.badgeColor,
                            color: '#FFFFFF',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: '600'
                          }}>
                            {dateInfo.label}
                          </div>
                        )}
                        <Text style={{ 
                          fontSize: '13px',
                          color: 'var(--tg-theme-hint-color)'
                        }}>
                          {dateInfo.label ? dateInfo.timeString : `${dateInfo.dateString} ${dateInfo.timeString}`}
                        </Text>
                      </div>

                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        flexWrap: 'wrap'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock 
                            size={14} 
                            color="#3B82F6"
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
                            color="#8B5CF6"
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
                            color="#10B981"
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
                    <Button 
                      size="s" 
                      mode="outline"
                      onClick={() => handleViewDetail(workout)}
                      style={{ 
                        fontSize: '13px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      Подробнее
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
};

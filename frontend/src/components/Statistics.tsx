import React, { useEffect, useState, useCallback } from 'react';
import { Section, Title, Text, Spinner, Card, Caption } from '@telegram-apps/telegram-ui';
import { Dumbbell, Flame, Clock, CalendarDays, BarChart3 } from 'lucide-react';
import { telegramService } from '../lib/telegram';
import { supabaseService } from '../lib/supabase';
import { StatCard } from './StatCard';
import { WeekActivityBar } from './WeekActivityBar';
import { TopExerciseItem } from './TopExerciseItem';
import type { BasicStats, Last7DaysStats, TopExercise } from '../types';

interface StatisticsProps {
  userId: string;
  onBack: () => void;
}

export const Statistics: React.FC<StatisticsProps> = ({ userId, onBack }) => {
  const [loading, setLoading] = useState(true);
  const [basicStats, setBasicStats] = useState<BasicStats | null>(null);
  const [last7Days, setLast7Days] = useState<Last7DaysStats | null>(null);
  const [topExercises, setTopExercises] = useState<TopExercise[]>([]);

  useEffect(() => {
    telegramService.showBackButton(onBack);
    return () => telegramService.hideBackButton();
  }, [onBack]);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const [basic, last7, topEx] = await Promise.all([
        supabaseService.getBasicStats(userId),
        supabaseService.getLast7Days(userId),
        supabaseService.getTopExercises(userId, 5)
      ]);

      setBasicStats(basic);
      setLast7Days(last7);
      setTopExercises(topEx);
      telegramService.hapticFeedback('impact', 'light');
    } catch (error) {
      telegramService.hapticFeedback('notification', 'error');
      telegramService.showAlert('Ошибка загрузки статистики');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const formatDuration = useCallback((minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}ч ${mins}мин`;
    }
    return `${mins}мин`;
  }, []);

  const formatWeeks = useCallback((weeks: number): string => {
    if (weeks === 0) return 'нет';
    if (weeks === 1) return '1 неделя';
    if (weeks < 5) return `${weeks} недели`;
    return `${weeks} недель`;
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '12px',
        backgroundColor: 'var(--tg-theme-bg-color)'
      }}>
        <Spinner size="l" />
        <Text style={{ color: 'var(--tg-theme-hint-color)' }}>
          Загрузка статистики...
        </Text>
      </div>
    );
  }

  if (!basicStats || basicStats.total_workouts === 0) {
    return (
      <div className="fade-in" style={{
        minHeight: '100vh',
        paddingBottom: '40px',
        backgroundColor: 'var(--tg-theme-bg-color)'
      }}>
        <div style={{
          padding: '20px 16px',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <BarChart3 size={32} color="var(--tg-theme-link-color)" strokeWidth={2} />
          </div>
          <Title level="1" weight="2" style={{ fontSize: '24px', marginBottom: '4px' }}>
            Статистика
          </Title>
        </div>
        <Section style={{ marginTop: '16px' }}>
          <Card style={{
            textAlign: 'center',
            padding: '60px 16px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '16px' 
            }}>
              <BarChart3 
                size={64} 
                color="var(--tg-theme-hint-color)" 
                strokeWidth={1.5}
              />
            </div>
            <Title level="3" weight="2" style={{ 
              marginBottom: '8px', 
              fontSize: '18px'
            }}>
              Пока нет данных
            </Title>
            <Text style={{ 
              fontSize: '14px',
              color: 'var(--tg-theme-hint-color)'
            }}>
              Завершите первую тренировку, чтобы увидеть статистику
            </Text>
          </Card>
        </Section>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{
      minHeight: '100vh',
      paddingBottom: '40px',
      backgroundColor: 'var(--tg-theme-bg-color)'
    }}>
      <div style={{
        padding: '20px 16px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <BarChart3 size={32} color="var(--tg-theme-link-color)" strokeWidth={2} />
        </div>
        <Title level="1" weight="2" style={{ fontSize: '24px', marginBottom: '4px' }}>
          Статистика
        </Title>
      </div>

      <Section header="Общая статистика" style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <StatCard
            icon={<Dumbbell size={24} strokeWidth={2} />}
            label="Всего тренировок"
            value={basicStats.total_workouts}
          />
          <StatCard
            icon={<Flame size={24} strokeWidth={2} />}
            label="Активных недель"
            value={formatWeeks(basicStats.active_weeks_streak)}
            subtitle={basicStats.active_weeks_streak > 0 ? 'подряд' : 'возобновите тренировки'}
          />
          <StatCard
            icon={<Clock size={24} strokeWidth={2} />}
            label="Общее время"
            value={formatDuration(basicStats.total_duration_minutes)}
          />
        </div>
      </Section>

      {last7Days && (
        <Section header="Эта неделя" style={{ marginTop: '16px' }}>
          <Card style={{ width: '100%', padding: '16px' }}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                backgroundColor: 'var(--tg-theme-link-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--tg-theme-button-text-color)'
              }}>
                <CalendarDays size={24} strokeWidth={2} />
              </div>

              <Title level="2" weight="2" style={{ 
                fontSize: '28px',
                margin: '0',
                color: 'var(--tg-theme-text-color)'
              }}>
                {last7Days.split_size 
                  ? `${last7Days.workout_count} из ${last7Days.split_size}`
                  : last7Days.workout_count
                }
              </Title>

              {last7Days.split_size && (
                <Caption level="1" style={{
                  fontSize: '13px',
                  color: 'var(--tg-theme-hint-color)',
                  textAlign: 'center'
                }}>
                  тренировок основного сплита
                </Caption>
              )}
            </div>

            {last7Days.split_size && last7Days.progress_percent !== undefined && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '4px'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${last7Days.progress_percent}%`,
                    backgroundColor: 'var(--tg-theme-link-color)',
                    borderRadius: '4px',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <Caption level="1" style={{
                  fontSize: '12px',
                  color: 'var(--tg-theme-hint-color)',
                  textAlign: 'center'
                }}>
                  {last7Days.progress_percent}% выполнено
                </Caption>
              </div>
            )}

            <WeekActivityBar workoutDates={last7Days.workout_dates} />
          </Card>
        </Section>
      )}

      {topExercises.length > 0 && (
        <Section header="Топ упражнения" style={{ marginTop: '16px' }}>
          {topExercises.map((exercise, index) => (
            <TopExerciseItem
              key={exercise.exercise_name}
              rank={index + 1}
              name={exercise.exercise_name}
              sets={exercise.total_sets}
              secondaryMetric={exercise.secondary_metric}
            />
          ))}
        </Section>
      )}
    </div>
  );
};

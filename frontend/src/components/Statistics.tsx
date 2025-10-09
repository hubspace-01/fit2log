import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    loadStats();
  }, [userId]);

  const loadStats = async () => {
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
    } catch (error) {
      telegramService.showAlert('Ошибка загрузки статистики');
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}ч ${mins}мин`;
    }
    return `${mins}мин`;
  };

  const formatWeeks = (weeks: number): string => {
    if (weeks === 0) return 'нет';
    if (weeks === 1) return '1 неделя';
    if (weeks < 5) return `${weeks} недели`;
    return `${weeks} недель`;
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <Spinner size="l" />
        <Text>Загрузка статистики...</Text>
      </div>
    );
  }

  if (!basicStats || basicStats.total_workouts === 0) {
    return (
      <div style={{
        minHeight: '100vh',
        paddingBottom: '40px',
        backgroundColor: 'var(--tg-theme-bg-color)'
      }}>
        <div style={{
          padding: '20px 16px',
          backgroundColor: 'var(--tg-theme-secondary-bg-color)',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
            <BarChart3 size={32} color="var(--tg-theme-link-color)" />
          </div>
          <Title level="1" weight="2" style={{ fontSize: '24px', marginBottom: '4px' }}>
            Статистика
          </Title>
        </div>
        <Section style={{ marginTop: '16px' }}>
          <div style={{
            textAlign: 'center',
            padding: '60px 16px',
            color: 'var(--tg-theme-hint-color)'
          }}>
            <BarChart3 size={64} style={{ opacity: 0.2, marginBottom: '16px' }} />
            <Title level="3" style={{ marginBottom: '8px', color: 'var(--tg-theme-text-color)' }}>
              Пока нет данных
            </Title>
            <Text style={{ fontSize: '14px' }}>
              Завершите первую тренировку, чтобы увидеть статистику
            </Text>
          </div>
        </Section>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      paddingBottom: '40px',
      backgroundColor: 'var(--tg-theme-bg-color)'
    }}>
      <div style={{
        padding: '20px 16px',
        backgroundColor: 'var(--tg-theme-secondary-bg-color)',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <BarChart3 size={32} color="var(--tg-theme-link-color)" />
        </div>
        <Title level="1" weight="2" style={{ fontSize: '24px', marginBottom: '4px' }}>
          Статистика
        </Title>
      </div>

      <Section header="Общая статистика" style={{ marginTop: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <StatCard
            icon={<Dumbbell size={24} />}
            label="Всего тренировок"
            value={basicStats.total_workouts}
          />
          <StatCard
            icon={<Flame size={24} />}
            label="Активных недель"
            value={formatWeeks(basicStats.active_weeks_streak)}
            subtitle={basicStats.active_weeks_streak > 0 ? 'подряд' : 'возобновите тренировки'}
          />
          <StatCard
            icon={<Clock size={24} />}
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
                background: 'linear-gradient(135deg, var(--tg-theme-link-color) 0%, var(--tg-theme-button-color) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white'
              }}>
                <CalendarDays size={24} />
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
                  backgroundColor: 'var(--tg-theme-hint-color)',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  opacity: 0.2,
                  marginBottom: '4px'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${last7Days.progress_percent}%`,
                    backgroundColor: 'var(--tg-theme-link-color)',
                    borderRadius: '4px',
                    opacity: 1,
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

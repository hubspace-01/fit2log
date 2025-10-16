import React, { useEffect, useState } from 'react';
import { 
  Section, 
  Title, 
  Text,
  Card,
  Spinner
} from '@telegram-apps/telegram-ui';
import type { WorkoutHistoryItem, WorkoutDetailLog } from '../types';
import { supabaseService } from '../lib/supabase';
import { telegramService } from '../lib/telegram';

interface Props {
  workout: WorkoutHistoryItem;
  onBack: () => void;
}

export const WorkoutDetail: React.FC<Props> = ({ workout, onBack }) => {
  const [details, setDetails] = useState<WorkoutDetailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    telegramService.showBackButton(onBack);
    return () => telegramService.hideBackButton();
  }, [onBack]);

  useEffect(() => {
    const loadDetails = async () => {
      try {
        setLoading(true);
        setError(undefined);
        const data = await supabaseService.getWorkoutDetail(workout.id);
        setDetails(data);
      } catch (err) {
        setError('Ошибка загрузки деталей тренировки');
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [workout.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}с`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}мин`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}ч ${remainingMinutes}мин`;
  };

  const groupedDetails = details.reduce((acc, detail) => {
    if (!acc[detail.exercise_name]) {
      acc[detail.exercise_name] = [];
    }
    acc[detail.exercise_name].push(detail);
    return acc;
  }, {} as Record<string, WorkoutDetailLog[]>);

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
              fontSize: '14px',
              display: 'block'
            }}>
              {error}
            </Text>
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
        <Title level="2" weight="2" style={{ fontSize: '20px', marginBottom: '8px' }}>
          {workout.program_name}
        </Title>
        <Text style={{ 
          color: 'var(--tg-theme-hint-color)', 
          fontSize: '14px',
          display: 'block',
          marginBottom: '4px'
        }}>
          {formatDate(workout.completed_at)} в {formatTime(workout.completed_at)}
        </Text>
        <Text style={{ 
          color: 'var(--tg-theme-hint-color)', 
          fontSize: '13px'
        }}>
          ⏱️ Длительность: {formatDuration(workout.total_duration || 0)}
        </Text>
      </div>

      {Object.keys(groupedDetails).length === 0 ? (
        <Section>
          <Card style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
            <Title level="3" weight="2" style={{ marginBottom: '8px', fontSize: '18px' }}>
              Нет данных
            </Title>
            <Text style={{ 
              color: 'var(--tg-theme-hint-color)', 
              fontSize: '14px',
              display: 'block'
            }}>
              Детали этой тренировки не найдены
            </Text>
          </Card>
        </Section>
      ) : (
        <Section>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(groupedDetails).map(([exerciseName, sets]) => (
              <Card key={exerciseName} style={{ width: '100%' }}>
                <div style={{ padding: '16px' }}>
                  <Text weight="2" style={{ 
                    fontSize: '16px',
                    display: 'block',
                    marginBottom: '12px'
                  }}>
                    {exerciseName}
                  </Text>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {sets.map((set, index) => (
                      <div key={index} style={{ 
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingLeft: '12px'
                      }}>
                        <Text style={{ fontSize: '14px' }}>
                          Подход {set.set_no}:
                        </Text>
                        <Text style={{ 
                          fontSize: '14px',
                          fontWeight: '500'
                        }}>
                          {set.display_value}
                        </Text>
                      </div>
                    ))}
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

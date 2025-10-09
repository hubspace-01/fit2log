import React, { useEffect, useState } from 'react';
import { Section, Title, Text, Spinner, Card, Caption, Cell } from '@telegram-apps/telegram-ui';
import { 
  Dumbbell, 
  Flame, 
  Clock, 
  CalendarDays, 
  BarChart3,
  Trophy,
  Timer,
  Footprints,
  Calendar,
  ChevronDown,
  ChevronUp,
  History,
  Grid3x3,
  TrendingUp
} from 'lucide-react';
import { telegramService } from '../lib/telegram';
import { supabaseService } from '../lib/supabase';
import { StatCard } from './StatCard';
import { WeekActivityBar } from './WeekActivityBar';
import { TopExerciseItem } from './TopExerciseItem';
import { formatRecordValue, normalizeExerciseName } from '../lib/personalRecords';
import type { BasicStats, Last7DaysStats, TopExercise, PersonalRecord, ExerciseType } from '../types';

interface StatisticsWithTabsProps {
  userId: string;
  onBack: () => void;
}

type TabType = 'overview' | 'records' | 'charts';
type FilterType = 'all' | 'reps' | 'time' | 'distance';

export const StatisticsWithTabs: React.FC<StatisticsWithTabsProps> = ({ userId, onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [loading, setLoading] = useState(true);
  
  // Overview data
  const [basicStats, setBasicStats] = useState<BasicStats | null>(null);
  const [last7Days, setLast7Days] = useState<Last7DaysStats | null>(null);
  const [topExercises, setTopExercises] = useState<TopExercise[]>([]);
  
  // Records data
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());

  useEffect(() => {
    telegramService.showBackButton(onBack);
    return () => telegramService.hideBackButton();
  }, [onBack]);

  useEffect(() => {
    loadAllData();
  }, [userId]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [basic, last7, topEx, allRecords] = await Promise.all([
        supabaseService.getBasicStats(userId),
        supabaseService.getLast7Days(userId),
        supabaseService.getTopExercises(userId, 5),
        supabaseService.getAllPersonalRecords(userId)
      ]);

      setBasicStats(basic);
      setLast7Days(last7);
      setTopExercises(topEx);
      setRecords(allRecords);
    } catch (error) {
      telegramService.showAlert('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: TabType) => {
    telegramService.hapticFeedback('impact', 'light');
    setActiveTab(tab);
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

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const getExerciseIcon = (type: ExerciseType) => {
    if (type === 'time') return <Timer size={20} color="white" />;
    if (type === 'distance') return <Footprints size={20} color="white" />;
    return <Dumbbell size={20} color="white" />;
  };

  const getGradient = (type: ExerciseType) => {
    if (type === 'time') return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    if (type === 'distance') return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
    return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  };

  const toggleExpand = (exerciseName: string) => {
    const newExpanded = new Set(expandedRecords);
    if (newExpanded.has(exerciseName)) {
      newExpanded.delete(exerciseName);
    } else {
      newExpanded.add(exerciseName);
    }
    setExpandedRecords(newExpanded);
  };

  const filteredRecords = records.filter(record => {
    if (filter === 'all') return true;
    return record.exercise_type === filter;
  });

  const groupedRecords = filteredRecords.reduce((acc, record) => {
    const name = normalizeExerciseName(record.exercise_name);
    if (!acc[name]) {
      acc[name] = [];
    }
    acc[name].push(record);
    return acc;
  }, {} as Record<string, PersonalRecord[]>);

  const sortedExerciseNames = Object.keys(groupedRecords).sort();

  const TabButton: React.FC<{
    type: TabType;
    icon: React.ReactNode;
    label: string;
  }> = ({ type, icon, label }) => (
    <button
      onClick={() => handleTabChange(type)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '12px 8px',
        borderRadius: '12px',
        border: 'none',
        backgroundColor: activeTab === type ? 'var(--tg-theme-link-color)' : 'transparent',
        color: activeTab === type ? 'white' : 'var(--tg-theme-hint-color)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        flex: 1,
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <span style={{
        fontSize: '12px',
        fontWeight: activeTab === type ? '600' : '500',
        whiteSpace: 'nowrap'
      }}>
        {label}
      </span>
      {activeTab === type && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: '10%',
          right: '10%',
          height: '3px',
          backgroundColor: 'white',
          borderRadius: '3px 3px 0 0'
        }} />
      )}
    </button>
  );

  const FilterButton: React.FC<{
    type: FilterType;
    icon: React.ReactNode;
    label: string;
  }> = ({ type, icon, label }) => (
    <button
      onClick={() => {
        telegramService.hapticFeedback('impact', 'light');
        setFilter(type);
      }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '12px 16px',
        borderRadius: '12px',
        border: filter === type ? '2px solid var(--tg-theme-link-color)' : '1px solid var(--tg-theme-section-separator-color)',
        backgroundColor: filter === type ? 'var(--tg-theme-link-color)' : 'var(--tg-theme-secondary-bg-color)',
        color: filter === type ? 'white' : 'var(--tg-theme-text-color)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minWidth: '70px',
        flex: 1
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <span style={{
        fontSize: '12px',
        fontWeight: filter === type ? '600' : '500',
        whiteSpace: 'nowrap'
      }}>
        {label}
      </span>
    </button>
  );

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
        <Text>Загрузка данных...</Text>
      </div>
    );
  }

  const hasData = basicStats && basicStats.total_workouts > 0;
  const hasRecords = records.length > 0;

  return (
    <div style={{
      minHeight: '100vh',
      paddingBottom: '88px',
      backgroundColor: 'var(--tg-theme-bg-color)'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 16px 16px 16px',
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

      {/* Tabs */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 5,
        backgroundColor: 'var(--tg-theme-secondary-bg-color)',
        padding: '8px 16px',
        display: 'flex',
        gap: '8px',
        borderBottom: '0.5px solid var(--tg-theme-section-separator-color)'
      }}>
        <TabButton
          type="overview"
          icon={<BarChart3 size={20} />}
          label="Обзор"
        />
        <TabButton
          type="records"
          icon={<Trophy size={20} />}
          label="Рекорды"
        />
        <TabButton
          type="charts"
          icon={<TrendingUp size={20} />}
          label="Графики"
        />
      </div>

      {/* Content */}
      <div className="fade-in">
        {activeTab === 'overview' && (
          <>
            {!hasData ? (
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
            ) : (
              <>
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
              </>
            )}
          </>
        )}

        {activeTab === 'records' && (
          <>
            {!hasRecords ? (
              <Section style={{ marginTop: '16px' }}>
                <div style={{ 
                  textAlign: 'center', 
                  padding: '60px 16px',
                  color: 'var(--tg-theme-hint-color)'
                }}>
                  <Trophy size={64} style={{ opacity: 0.2, marginBottom: '16px' }} />
                  <Title level="3" style={{ marginBottom: '8px', color: 'var(--tg-theme-text-color)' }}>
                    Пока нет рекордов
                  </Title>
                  <Text style={{ fontSize: '14px' }}>
                    Завершите первую тренировку, чтобы увидеть свои рекорды
                  </Text>
                </div>
              </Section>
            ) : (
              <>
                <Section style={{ marginTop: '8px' }}>
                  <div style={{
                    padding: '12px 16px',
                    display: 'flex',
                    gap: '8px'
                  }}>
                    <FilterButton
                      type="all"
                      icon={<Grid3x3 size={20} color={filter === 'all' ? 'white' : 'var(--tg-theme-link-color)'} />}
                      label="Все"
                    />
                    <FilterButton
                      type="reps"
                      icon={<Dumbbell size={20} color={filter === 'reps' ? 'white' : 'var(--tg-theme-link-color)'} />}
                      label="Вес"
                    />
                    <FilterButton
                      type="time"
                      icon={<Timer size={20} color={filter === 'time' ? 'white' : 'var(--tg-theme-link-color)'} />}
                      label="Время"
                    />
                    <FilterButton
                      type="distance"
                      icon={<Footprints size={20} color={filter === 'distance' ? 'white' : 'var(--tg-theme-link-color)'} />}
                      label="Дистанция"
                    />
                  </div>
                </Section>

                {filteredRecords.length === 0 ? (
                  <Section style={{ marginTop: '16px' }}>
                    <div style={{ 
                      textAlign: 'center', 
                      padding: '40px 16px',
                      color: 'var(--tg-theme-hint-color)'
                    }}>
                      <Trophy size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
                      <Text>Нет рекордов в этой категории</Text>
                    </div>
                  </Section>
                ) : (
                  <Section header={`Упражнения (${sortedExerciseNames.length})`} style={{ marginTop: '8px' }}>
                    {sortedExerciseNames.map((exerciseName) => {
                      const exerciseRecords = groupedRecords[exerciseName].sort((a, b) => 
                        new Date(b.achieved_at).getTime() - new Date(a.achieved_at).getTime()
                      );
                      const currentRecord = exerciseRecords.find(r => r.is_current) || exerciseRecords[0];
                      const isExpanded = expandedRecords.has(exerciseName);
                      const oldRecords = exerciseRecords.filter(r => !r.is_current);
                      const hasHistory = oldRecords.length > 0;

                      return (
                        <div key={exerciseName} style={{ marginBottom: '8px' }}>
                          <Cell
                            onClick={() => hasHistory && toggleExpand(exerciseName)}
                            style={{ cursor: hasHistory ? 'pointer' : 'default' }}
                            before={
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: getGradient(currentRecord.exercise_type),
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {getExerciseIcon(currentRecord.exercise_type)}
                              </div>
                            }
                            after={hasHistory ? (
                              isExpanded ? <ChevronUp size={20} color="var(--tg-theme-hint-color)" /> : <ChevronDown size={20} color="var(--tg-theme-hint-color)" />
                            ) : null}
                            subtitle={
                              <div style={{ marginTop: '4px' }}>
                                <div style={{ 
                                  fontSize: '14px', 
                                  color: 'var(--tg-theme-hint-color)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px'
                                }}>
                                  <Calendar size={12} />
                                  {formatDate(currentRecord.achieved_at)}
                                </div>
                              </div>
                            }
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <Text style={{ fontSize: '15px', fontWeight: '500' }}>
                                {exerciseName}
                              </Text>
                              <Text style={{ fontSize: '18px', fontWeight: '700', color: 'var(--tg-theme-link-color)' }}>
                                {formatRecordValue(currentRecord)}
                              </Text>
                            </div>
                          </Cell>

                          {isExpanded && hasHistory && (
                            <div style={{
                              padding: '16px',
                              backgroundColor: 'var(--tg-theme-secondary-bg-color)',
                              borderTop: '0.5px solid var(--tg-theme-section-separator-color)'
                            }}>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '12px'
                              }}>
                                <History size={16} color="var(--tg-theme-hint-color)" />
                                <Caption level="1" style={{ 
                                  fontSize: '13px', 
                                  color: 'var(--tg-theme-hint-color)',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.5px'
                                }}>
                                  История рекордов
                                </Caption>
                              </div>
                              {oldRecords.map((record, index) => (
                                <div
                                  key={record.id}
                                  style={{
                                    padding: '12px 0',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    borderBottom: index < oldRecords.length - 1 ? '0.5px solid var(--tg-theme-section-separator-color)' : 'none'
                                  }}
                                >
                                  <div style={{ flex: 1 }}>
                                    <Text style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
                                      {formatRecordValue(record)}
                                    </Text>
                                    <div style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '6px'
                                    }}>
                                      <Calendar size={11} color="var(--tg-theme-hint-color)" />
                                      <Caption level="1" style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color)' }}>
                                        {formatDate(record.achieved_at)}
                                      </Caption>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </Section>
                )}
              </>
            )}
          </>
        )}

        {activeTab === 'charts' && (
          <Section style={{ marginTop: '16px' }}>
            <div style={{
              textAlign: 'center',
              padding: '60px 16px',
              color: 'var(--tg-theme-hint-color)'
            }}>
              <TrendingUp size={64} style={{ opacity: 0.2, marginBottom: '16px' }} />
              <Title level="3" style={{ marginBottom: '8px', color: 'var(--tg-theme-text-color)' }}>
                В разработке
              </Title>
              <Text style={{ fontSize: '14px' }}>
                Графики прогресса скоро появятся
              </Text>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
};

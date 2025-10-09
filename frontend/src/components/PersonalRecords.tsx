import React, { useEffect, useState } from 'react';
import { Section, Cell, Title, Caption, Text, Button, Spinner } from '@telegram-apps/telegram-ui';
import { 
  Trophy, 
  Dumbbell, 
  Timer, 
  Footprints,
  Calendar,
  ChevronDown,
  ChevronUp,
  History
} from 'lucide-react';
import { telegramService } from '../lib/telegram';
import { supabaseService } from '../lib/supabase';
import { formatRecordValue, normalizeExerciseName } from '../lib/personalRecords';
import type { PersonalRecord, ExerciseType } from '../types';

interface PersonalRecordsProps {
  userId: string;
  onBack: () => void;
}

type FilterType = 'all' | 'reps' | 'time' | 'distance';

export const PersonalRecords: React.FC<PersonalRecordsProps> = ({ userId, onBack }) => {
  const [records, setRecords] = useState<PersonalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedRecords, setExpandedRecords] = useState<Set<string>>(new Set());

  useEffect(() => {
    telegramService.showBackButton(onBack);
    return () => telegramService.hideBackButton();
  }, [onBack]);

  useEffect(() => {
    loadRecords();
  }, [userId]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await supabaseService.getPersonalRecords(userId);
      setRecords(data);
    } catch (error) {
      telegramService.showAlert('Ошибка загрузки рекордов');
    } finally {
      setLoading(false);
    }
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

  const toggleExpand = async (exerciseName: string) => {
    const newExpanded = new Set(expandedRecords);
    if (newExpanded.has(exerciseName)) {
      newExpanded.delete(exerciseName);
    } else {
      newExpanded.add(exerciseName);
    }
    setExpandedRecords(newExpanded);
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
        <Text>Загрузка рекордов...</Text>
      </div>
    );
  }

  const uniqueExercises = Object.keys(groupedRecords).length;

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
          <Trophy size={32} color="var(--tg-theme-link-color)" />
        </div>
        <Title level="1" weight="2" style={{ fontSize: '24px', marginBottom: '4px' }}>
          Мои рекорды
        </Title>
        <Caption level="1" style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>
          {uniqueExercises} {uniqueExercises === 1 ? 'упражнение' : uniqueExercises < 5 ? 'упражнения' : 'упражнений'}
        </Caption>
      </div>

      <Section style={{ marginTop: '8px' }}>
        <div style={{
          padding: '8px 16px',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          justifyContent: 'center'
        }}>
          <Button
            size="s"
            mode={filter === 'all' ? 'filled' : 'bezeled'}
            onClick={() => setFilter('all')}
            style={{ fontSize: '13px', whiteSpace: 'nowrap' }}
          >
            Все
          </Button>
          <Button
            size="s"
            mode={filter === 'reps' ? 'filled' : 'bezeled'}
            onClick={() => setFilter('reps')}
            style={{ fontSize: '13px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Dumbbell size={14} />
            Вес
          </Button>
          <Button
            size="s"
            mode={filter === 'time' ? 'filled' : 'bezeled'}
            onClick={() => setFilter('time')}
            style={{ fontSize: '13px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Timer size={14} />
            Время
          </Button>
          <Button
            size="s"
            mode={filter === 'distance' ? 'filled' : 'bezeled'}
            onClick={() => setFilter('distance')}
            style={{ fontSize: '13px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            <Footprints size={14} />
            Дистанция
          </Button>
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
        <Section header="Упражнения" style={{ marginTop: '8px' }}>
          {sortedExerciseNames.map((exerciseName) => {
            const exerciseRecords = groupedRecords[exerciseName].sort((a, b) => 
              new Date(b.achieved_at).getTime() - new Date(a.achieved_at).getTime()
            );
            const currentRecord = exerciseRecords[0];
            const isExpanded = expandedRecords.has(exerciseName);
            const hasHistory = exerciseRecords.length > 1;

            return (
              <div key={exerciseName} style={{ marginBottom: '8px' }}>
                <Cell
                  onClick={() => hasHistory && toggleExpand(exerciseName)}
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
                    <Text style={{ fontSize: '15px', fontWeight: '500', textTransform: 'capitalize' }}>
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
                    {exerciseRecords.slice(1).map((record, index) => (
                      <div
                        key={record.id}
                        style={{
                          padding: '12px 0',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: index < exerciseRecords.length - 2 ? '0.5px solid var(--tg-theme-section-separator-color)' : 'none'
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
    </div>
  );
};

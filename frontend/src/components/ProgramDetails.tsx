import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Section,
  Button,
  Title,
  Text,
  List,
  Cell,
  Card,
  Caption,
  Spinner
} from '@telegram-apps/telegram-ui';
import { 
  ClipboardList, 
  Clock, 
  Route, 
  Dumbbell, 
  Edit3, 
  Trash2,
  Zap
} from 'lucide-react';
import type { Program, Exercise } from '../types';
import { telegramService } from '../lib/telegram';
import { supabaseService } from '../lib/supabase';

interface Props {
  program: Program;
  userId: string;
  onBack: () => void;
  onEdit: (program: Program) => void;
  onDelete: (programId: string) => void;
  onStartWorkout: (program: Program) => void;
}

export const ProgramDetails: React.FC<Props> = ({
  program,
  userId,
  onBack,
  onEdit,
  onDelete,
  onStartWorkout
}) => {
  const [hasInProgressSession, setHasInProgressSession] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    telegramService.showBackButton(onBack);
    return () => telegramService.hideBackButton();
  }, [onBack]);

  useEffect(() => {
    const checkInProgressSession = async () => {
      try {
        const session = await supabaseService.getInProgressSession(userId, program.id);
        setHasInProgressSession(!!session);
        telegramService.hapticFeedback('impact', 'light');
      } catch (error) {
        telegramService.hapticFeedback('impact', 'medium');
      } finally {
        setLoading(false);
      }
    };

    if (userId && program.id) {
      checkInProgressSession();
    }
  }, [userId, program.id]);

  const exercises = useMemo(() => {
    return [...(program.exercises || [])].sort(
      (a, b) => a.order_index - b.order_index
    );
  }, [program.exercises]);

  const handleDelete = useCallback(() => {
    telegramService.hapticFeedback('impact', 'medium');
    telegramService.showConfirm(
      `Удалить программу "${program.program_name}"?`,
      (confirmed: boolean) => {
        if (confirmed) {
          telegramService.hapticFeedback('impact', 'light');
          onDelete(program.id);
        }
      }
    );
  }, [program.program_name, program.id, onDelete]);

  const handleEdit = useCallback(() => {
    telegramService.hapticFeedback('impact', 'light');
    onEdit(program);
  }, [program, onEdit]);

  const handleStartWorkout = useCallback(() => {
    telegramService.hapticFeedback('impact', 'medium');
    onStartWorkout(program);
  }, [program, onStartWorkout]);

  const getExerciseInfo = useCallback((exercise: Exercise) => {
    const type = exercise.exercise_type || 'reps';
    
    switch (type) {
      case 'reps':
        return (
          <>
            <Text style={{ 
              color: 'var(--tg-theme-hint-color)',
              display: 'block',
              marginTop: '4px',
              fontSize: '13px'
            }}>
              {exercise.target_sets} × {exercise.target_reps} повт
            </Text>
            {exercise.target_weight > 0 && (
              <Caption 
                level="1"
                weight="3"
                style={{ 
                  display: 'block',
                  marginTop: '2px',
                  fontSize: '12px'
                }}
              >
                Вес: {exercise.target_weight} кг
              </Caption>
            )}
          </>
        );
      case 'time':
        return (
          <Text style={{ 
            color: 'var(--tg-theme-hint-color)',
            display: 'block',
            marginTop: '4px',
            fontSize: '13px'
          }}>
            {exercise.target_sets} × {exercise.duration}с
          </Text>
        );
      case 'distance':
        return (
          <Text style={{ 
            color: 'var(--tg-theme-hint-color)',
            display: 'block',
            marginTop: '4px',
            fontSize: '13px'
          }}>
            {exercise.distance} м
          </Text>
        );
      default:
        return null;
    }
  }, []);

  const getExerciseIcon = useCallback((exercise: Exercise) => {
    const type = exercise.exercise_type || 'reps';
    
    switch (type) {
      case 'time':
        return <Clock size={20} strokeWidth={2} />;
      case 'distance':
        return <Route size={20} strokeWidth={2} />;
      default:
        return <Dumbbell size={20} strokeWidth={2} />;
    }
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
          Загрузка программы...
        </Text>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ 
      minHeight: '100vh',
      paddingBottom: exercises.length > 0 ? '140px' : '100px',
      backgroundColor: 'var(--tg-theme-bg-color)'
    }}>
      <div style={{
        padding: '20px 16px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <ClipboardList size={32} color="var(--tg-theme-link-color)" strokeWidth={2} />
        </div>
        
        {hasInProgressSession && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#FF9500',
            color: '#FFFFFF',
            padding: '6px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '12px'
          }}>
            <Zap size={14} fill="#FFFFFF" strokeWidth={0} />
            <span>В процессе</span>
          </div>
        )}
        
        <Title level="1" weight="2" style={{ fontSize: '24px', marginBottom: '4px' }}>
          {program.program_name}
        </Title>
        <Text style={{ 
          color: 'var(--tg-theme-hint-color)',
          fontSize: '14px'
        }}>
          {exercises.length} {exercises.length === 1 ? 'упражнение' : exercises.length < 5 ? 'упражнения' : 'упражнений'}
        </Text>
      </div>

      {exercises.length > 0 ? (
        <Section header={`Упражнения (${exercises.length})`} style={{ marginTop: '8px' }}>
          <List>
            {exercises.map((exercise) => (
              <Cell
                key={exercise.id}
                before={
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      minWidth: '40px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--tg-theme-link-color)',
                      color: 'var(--tg-theme-button-text-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {getExerciseIcon(exercise)}
                  </div>
                }
                subtitle={
                  <div>
                    {getExerciseInfo(exercise)}
                  </div>
                }
              >
                <Text weight="2" style={{ fontSize: '15px' }}>
                  {exercise.exercise_name}
                </Text>
              </Cell>
            ))}
          </List>
        </Section>
      ) : (
        <Section style={{ marginTop: '8px' }}>
          <Card style={{
            textAlign: 'center',
            padding: '60px 16px'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              marginBottom: '16px'
            }}>
              <Dumbbell 
                size={64} 
                color="var(--tg-theme-hint-color)" 
                strokeWidth={1.5}
              />
            </div>
            <Title level="3" weight="2" style={{ 
              marginBottom: '8px', 
              fontSize: '18px'
            }}>
              Нет упражнений
            </Title>
            <Text style={{ 
              color: 'var(--tg-theme-hint-color)', 
              fontSize: '14px',
              display: 'block'
            }}>
              Добавьте упражнения, чтобы начать тренировку
            </Text>
          </Card>
        </Section>
      )}

      <div
        style={{
          position: 'fixed',
          bottom: '0',
          left: '0',
          right: '0',
          padding: '12px 16px',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          backgroundColor: 'var(--tg-theme-bg-color)',
          borderTop: '0.5px solid var(--tg-theme-hint-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        {exercises.length > 0 && (
          <Button
            size="l"
            stretched
            onClick={handleStartWorkout}
          >
            {hasInProgressSession ? 'Продолжить тренировку' : 'Начать тренировку'}
          </Button>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            size="m"
            mode="outline"
            stretched
            onClick={handleEdit}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
              <Edit3 size={16} strokeWidth={2} />
              <span>Редактировать</span>
            </div>
          </Button>
          <Button
            size="m"
            mode="outline"
            stretched
            onClick={handleDelete}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'center' }}>
              <Trash2 size={16} strokeWidth={2} color="var(--tg-theme-destructive-text-color)" />
              <span style={{ color: 'var(--tg-theme-destructive-text-color)' }}>Удалить</span>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
};

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
  Zap,
  MoreVertical
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
  const [showActionsModal, setShowActionsModal] = useState(false);

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

  const handleOpenActions = useCallback(() => {
    telegramService.hapticFeedback('impact', 'light');
    setShowActionsModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    telegramService.hapticFeedback('impact', 'light');
    setShowActionsModal(false);
  }, []);

  const handleEdit = useCallback(() => {
    telegramService.hapticFeedback('impact', 'light');
    setShowActionsModal(false);
    onEdit(program);
  }, [program, onEdit]);

  const handleDelete = useCallback(() => {
    telegramService.hapticFeedback('impact', 'light');
    setShowActionsModal(false);
    
    telegramService.showConfirm(
      `Удалить программу "${program.program_name}"?`,
      (confirmed: boolean) => {
        if (confirmed) {
          telegramService.hapticFeedback('impact', 'medium');
          onDelete(program.id);
        }
      }
    );
  }, [program.program_name, program.id, onDelete]);

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
    <>
      <div className="fade-in" style={{ 
        minHeight: '100vh',
        paddingBottom: exercises.length > 0 ? '88px' : '40px',
        backgroundColor: 'var(--tg-theme-bg-color)'
      }}>
        <div style={{
          padding: '20px 16px',
          textAlign: 'center',
          position: 'relative'
        }}>
          <div 
            onClick={handleOpenActions}
            style={{
              position: 'absolute',
              top: '20px',
              right: '16px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '50%',
              transition: 'transform 0.15s ease-out',
              WebkitTapHighlightColor: 'transparent'
            }}
            onTouchStart={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(0.9)';
            }}
            onTouchEnd={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            <MoreVertical 
              size={24} 
              color="var(--tg-theme-text-color)" 
              strokeWidth={2}
            />
          </div>

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

        {exercises.length > 0 && (
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
              zIndex: 10
            }}
          >
            <Button
              size="l"
              stretched
              onClick={handleStartWorkout}
            >
              {hasInProgressSession ? 'Продолжить тренировку' : 'Начать тренировку'}
            </Button>
          </div>
        )}
      </div>

      {showActionsModal && (
        <div
          className="fade-in"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'flex-end',
            zIndex: 1000
          }}
          onClick={handleCloseModal}
        >
          <div
            style={{
              backgroundColor: 'var(--tg-theme-bg-color)',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              padding: '20px 16px',
              paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
              width: '100%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Button 
              size="l" 
              stretched 
              onClick={handleEdit}
              style={{ marginBottom: '12px', fontSize: '16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <Edit3 size={20} strokeWidth={2} />
                <span>Редактировать</span>
              </div>
            </Button>
            
            <Button 
              size="l" 
              stretched 
              mode="outline"
              onClick={handleDelete}
              style={{ marginBottom: '12px', fontSize: '16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                <Trash2 size={20} strokeWidth={2} color="var(--tg-theme-destructive-text-color)" />
                <span style={{ color: 'var(--tg-theme-destructive-text-color)' }}>Удалить</span>
              </div>
            </Button>

            <Button 
              size="l" 
              stretched 
              mode="plain"
              onClick={handleCloseModal}
              style={{ fontSize: '16px' }}
            >
              Отмена
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

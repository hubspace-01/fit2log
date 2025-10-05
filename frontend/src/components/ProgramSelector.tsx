import React, { useEffect, useState } from 'react';
import { 
  Section, 
  Button, 
  Title, 
  Text,
  Card,
  Spinner
} from '@telegram-apps/telegram-ui';
import type { Program } from '../types';
import { supabaseService } from '../lib/supabase';

interface Props {
  programs: Program[];
  userName: string;
  userId: string;
  onCreateProgram: () => void;
  onSelectTemplate: () => void;
  onSelectProgram: (program: Program) => void;
}

export const ProgramSelector: React.FC<Props> = ({
  programs,
  userName,
  userId,
  onCreateProgram,
  onSelectTemplate,
  onSelectProgram
}) => {
  const [inProgressSessions, setInProgressSessions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInProgressSessions = async () => {
      try {
        const { data } = await supabaseService.supabase
          .from('workout_sessions')
          .select('program_id')
          .eq('user_id', userId)
          .eq('status', 'in_progress');

        if (data) {
          const sessionSet = new Set(data.map((s: any) => s.program_id));
          setInProgressSessions(sessionSet);
        }
      } catch (error) {
        console.error('Error loading in-progress sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadInProgressSessions();
    }
  }, [userId, programs]);

  const hasInProgressSession = (programId: string) => {
    return inProgressSessions.has(programId);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spinner size="m" />
      </div>
    );
  }

  return (
    <div className="app-container fade-in" style={{ padding: '16px', paddingBottom: '24px' }}>
      <div style={{ 
        marginBottom: '28px', 
        padding: '8px',
        textAlign: 'center'
      }}>
        <Title level="2" weight="2" style={{ marginBottom: '6px', fontSize: '24px' }}>
          Привет, {userName}! 👋
        </Title>
        <Text style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px' }}>
          Готов к тренировке?
        </Text>
      </div>

      {programs.length === 0 ? (
        <Section>
          <Card style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💪</div>
            <Title level="3" weight="2" style={{ marginBottom: '8px', fontSize: '18px' }}>
              Начни свой путь
            </Title>
            <Text style={{ 
              color: 'var(--tg-theme-hint-color)', 
              marginBottom: '24px', 
              fontSize: '14px',
              display: 'block'
            }}>
              У тебя пока нет программ тренировок
            </Text>
            
            <Button 
              size="m" 
              stretched 
              onClick={onSelectTemplate}
              style={{ marginBottom: '12px', fontSize: '15px' }}
            >
              📋 Выбрать готовую программу
            </Button>
            
            <Button 
              size="m" 
              stretched 
              mode="outline"
              onClick={onCreateProgram}
              style={{ fontSize: '15px' }}
            >
              ✏️ Создать свою программу
            </Button>
          </Card>
        </Section>
      ) : (
        <>
          <Section 
            header={
              <Title level="3" weight="2" style={{ fontSize: '18px', marginBottom: '12px' }}>
                Мои программы
              </Title>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {programs.map((program) => {
                const inProgress = hasInProgressSession(program.id);
                
                return (
                  <Card 
                    key={program.id} 
                    style={{ 
                      width: '100%',
                      position: 'relative',
                      border: inProgress ? '2px solid #FF9500' : undefined
                    }}
                  >
                    {inProgress && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        backgroundColor: '#FF9500',
                        color: '#FFFFFF',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        В процессе
                      </div>
                    )}

                    <div style={{ 
                      padding: '14px',
                      paddingTop: inProgress ? '36px' : '14px',
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
                          {program.program_name}
                        </Text>
                        <Text style={{ 
                          fontSize: '13px',
                          color: 'var(--tg-theme-hint-color)'
                        }}>
                          {program.exercises?.length || 0} упражнений
                        </Text>
                      </div>
                      <Button 
                        size="s" 
                        mode="filled"
                        style={{ 
                          fontSize: '13px',
                          whiteSpace: 'nowrap'
                        }}
                        onClick={() => onSelectProgram(program)}
                      >
                        {inProgress ? 'Продолжить' : 'Начать'}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </Section>

          <Section style={{ marginTop: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Button 
                size="m" 
                stretched 
                mode="outline"
                onClick={onSelectTemplate}
                style={{ fontSize: '14px' }}
              >
                📋 Шаблоны
              </Button>
              <Button 
                size="m" 
                stretched 
                mode="outline"
                onClick={onCreateProgram}
                style={{ fontSize: '14px' }}
              >
                ➕ Создать
              </Button>
            </div>
          </Section>
        </>
      )}
    </div>
  );
};

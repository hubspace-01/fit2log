import React, { useEffect, useState, useMemo } from 'react';
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
import { telegramService } from '../lib/telegram';

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
    telegramService.hideBackButton();
  }, []);

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

  const { weeklySplit, otherPrograms } = useMemo(() => {
    const split = programs
      .filter(p => p.day_order && p.day_order > 0)
      .sort((a, b) => (a.day_order || 0) - (b.day_order || 0));
    
    const others = programs
      .filter(p => !p.day_order || p.day_order === 0);
    
    return { weeklySplit: split, otherPrograms: others };
  }, [programs]);

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

  const renderProgramCard = (program: Program, isInSplit: boolean) => {
    const inProgress = hasInProgressSession(program.id);
    const hasDayOrder = program.day_order && program.day_order > 0;
    
    return (
      <div 
        key={program.id}
        style={{ 
          position: 'relative',
          paddingTop: (hasDayOrder || inProgress) ? '12px' : '0'
        }}
      >
        {/* ✅ ИСПРАВЛЕНО: Flexbox контейнер для бейджей */}
        {hasDayOrder && (
          <div style={{
            position: 'absolute',
            top: '0',
            left: '10px',
            display: 'flex',
            gap: '5px', // ✅ 5px между бейджами
            alignItems: 'center',
            zIndex: 1
          }}>
            {/* Номер тренировки */}
            <div style={{
              backgroundColor: inProgress ? '#FF9500' : '#10B981',
              color: '#FFFFFF',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {program.day_order}
            </div>

            {/* "В ПРОЦЕССЕ" рядом */}
            {inProgress && (
              <div style={{
                backgroundColor: '#FF9500',
                color: '#FFFFFF',
                padding: '4px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                В ПРОЦЕССЕ
              </div>
            )}
          </div>
        )}

        {/* ✅ "В ПРОЦЕССЕ" по центру для программ БЕЗ day_order */}
        {!hasDayOrder && inProgress && (
          <div style={{
            position: 'absolute',
            top: '0',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#FF9500',
            color: '#FFFFFF',
            padding: '4px 10px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            zIndex: 1
          }}>
            В ПРОЦЕССЕ
          </div>
        )}

        <Card 
          style={{ 
            width: '100%',
            border: inProgress 
              ? '2px solid #FF9500'
              : isInSplit 
              ? '2px solid #10B981'
              : undefined
          }}
        >
          <div style={{ 
            padding: '14px',
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
                {program.weekday_hint && `${program.weekday_hint} • `}
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
      </div>
    );
  };

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
          {weeklySplit.length > 0 && (
            <Section 
              header={
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <Title level="3" weight="2" style={{ fontSize: '18px', margin: 0 }}>
                    Основной сплит
                  </Title>
                  <span 
                    style={{ 
                      fontSize: '16px', 
                      cursor: 'pointer',
                      color: 'var(--tg-theme-hint-color)'
                    }}
                    onClick={() => telegramService.showAlert('Основной сплит — это твои регулярные тренировки, выделенные зелёным.')}
                    title="Подсказка"
                  >
                    ℹ️
                  </span>
                </div>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {weeklySplit.map((program) => renderProgramCard(program, true))}
              </div>
            </Section>
          )}

          {otherPrograms.length > 0 && (
            <Section 
              header={
                <div style={{ textAlign: 'center' }}>
                  <Title level="3" weight="2" style={{ fontSize: '18px', marginTop: weeklySplit.length > 0 ? '16px' : '0' }}>
                    Другие программы
                  </Title>
                </div>
              }
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {otherPrograms.map((program) => renderProgramCard(program, false))}
              </div>
            </Section>
          )}

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

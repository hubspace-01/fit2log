import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Section, 
  Button, 
  Title, 
  Text,
  Card,
  Spinner
} from '@telegram-apps/telegram-ui';
import { 
  Dumbbell, 
  Plus, 
  History, 
  BarChart3, 
  User,
  Zap,
  Info
} from 'lucide-react';
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
  onViewHistory: () => void;
  onViewRecords: () => void;
  onViewStatistics: () => void;
}

interface BottomNavProps {
  onCreateClick: () => void;
  onHistoryClick: () => void;
  onStatisticsClick: () => void;
  onProfileClick: () => void;
  activeTab?: string;
}

const BottomNav: React.FC<BottomNavProps> = React.memo(({ 
  onCreateClick, 
  onHistoryClick, 
  onStatisticsClick,
  onProfileClick,
  activeTab = 'programs'
}) => {
  const navItems = useMemo(() => [
    { id: 'create', icon: Plus, onClick: onCreateClick, label: 'Create' },
    { id: 'history', icon: History, onClick: onHistoryClick, label: 'History' },
    { id: 'statistics', icon: BarChart3, onClick: onStatisticsClick, label: 'Statistics' },
    { id: 'profile', icon: User, onClick: onProfileClick, label: 'Profile' }
  ], [onCreateClick, onHistoryClick, onStatisticsClick, onProfileClick]);

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '72px',
      backgroundColor: 'rgba(255, 255, 255, 0.6)',
      borderTop: '0.5px solid rgba(0, 0, 0, 0.2)',
      backdropFilter: 'saturate(180%) blur(30px)',
      WebkitBackdropFilter: 'saturate(180%) blur(30px)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingTop: '12px',
      paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
      zIndex: 10
    }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <div
            key={item.id}
            onClick={item.onClick}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: '8px',
              flex: 1,
              transition: 'transform 0.15s ease-out',
              WebkitTapHighlightColor: 'transparent'
            }}
            onTouchStart={(e) => {
              telegramService.hapticFeedback('impact', 'light');
              (e.currentTarget as HTMLElement).style.transform = 'scale(0.9)';
            }}
            onTouchEnd={(e) => {
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            <Icon 
              size={24} 
              color={isActive ? 'var(--tg-theme-link-color)' : 'var(--tg-theme-hint-color)'}
              strokeWidth={2.5}
            />
          </div>
        );
      })}
    </div>
  );
});

BottomNav.displayName = 'BottomNav';

export const ProgramSelector: React.FC<Props> = React.memo(({
  programs,
  userName,
  userId,
  onCreateProgram,
  onSelectTemplate,
  onSelectProgram,
  onViewHistory,
  onViewStatistics
}) => {
  const [inProgressSessions, setInProgressSessions] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
          const sessionSet = new Set(data.map((s: { program_id: string }) => s.program_id));
          setInProgressSessions(sessionSet);
        }
      } catch (error) {
        telegramService.showAlert('Ошибка загрузки данных');
      } finally {
        setLoading(false);
      }
    };

    if (userId && programs.length > 0) {
      loadInProgressSessions();
    } else if (programs.length === 0) {
      setLoading(false);
    }
  }, [userId]);

  const { weeklySplit, otherPrograms } = useMemo(() => {
    const split = programs
      .filter(p => p.day_order && p.day_order > 0)
      .sort((a, b) => (a.day_order || 0) - (b.day_order || 0));
    
    const others = programs.filter(p => !p.day_order);
    
    return { weeklySplit: split, otherPrograms: others };
  }, [programs]);

  const hasInProgressSession = useCallback((programId: string) => {
    return inProgressSessions.has(programId);
  }, [inProgressSessions]);

  const handleCreateClick = useCallback(() => {
    telegramService.hapticFeedback('impact', 'medium');
    setShowCreateModal(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  const handleCreateOwn = useCallback(() => {
    telegramService.hapticFeedback('impact', 'light');
    setShowCreateModal(false);
    onCreateProgram();
  }, [onCreateProgram]);

  const handleSelectTemplate = useCallback(() => {
    telegramService.hapticFeedback('impact', 'light');
    setShowCreateModal(false);
    onSelectTemplate();
  }, [onSelectTemplate]);

  const handleHistoryClick = useCallback(() => {
    telegramService.hapticFeedback('impact', 'light');
    onViewHistory();
  }, [onViewHistory]);

  const handleStatisticsClick = useCallback(() => {
    telegramService.hapticFeedback('impact', 'light');
    onViewStatistics();
  }, [onViewStatistics]);

  const handleProfileClick = useCallback(() => {
    telegramService.hapticFeedback('impact', 'light');
    telegramService.showAlert('Раздел "Профиль" в разработке');
  }, []);

  const handleInfoClick = useCallback(() => {
    telegramService.hapticFeedback('impact', 'light');
    telegramService.showAlert('Это ваша основная программа тренировок. Программы в этом разделе имеют установленный порядок дней.');
  }, []);

  const handleProgramClick = useCallback((program: Program) => {
    telegramService.hapticFeedback('impact', 'light');
    onSelectProgram(program);
  }, [onSelectProgram]);

  const renderProgramCard = useCallback((program: Program, isInSplit: boolean, index?: number) => {
    const inProgress = hasInProgressSession(program.id);
    const hasDayOrder = program.day_order && program.day_order > 0;
    const showNumber = !isInSplit && index !== undefined;
    const displayNumber = showNumber ? index + 1 : program.day_order;
    
    return (
      <div 
        key={program.id}
        style={{ 
          position: 'relative',
          paddingTop: (hasDayOrder || showNumber) ? '12px' : '0'
        }}
      >
        {hasDayOrder && (
          <div style={{
            position: 'absolute',
            top: '0',
            left: '10px',
            display: 'flex',
            gap: '5px',
            alignItems: 'center',
            zIndex: 1
          }}>
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

            {inProgress && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#FF9500',
                color: '#FFFFFF',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '600',
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                <Zap size={12} fill="#FFFFFF" />
              </div>
            )}
          </div>
        )}

        {showNumber && (
          <div style={{
            position: 'absolute',
            top: '0',
            left: '10px',
            display: 'flex',
            gap: '5px',
            alignItems: 'center',
            zIndex: 1
          }}>
            <div style={{
              backgroundColor: inProgress ? '#FF9500' : '#CCCCCC',
              color: '#FFFFFF',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {displayNumber}
            </div>

            {inProgress && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: '#FF9500',
                color: '#FFFFFF',
                padding: '4px 8px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: '600',
                animation: 'pulse 2s ease-in-out infinite'
              }}>
                <Zap size={12} fill="#FFFFFF" />
              </div>
            )}
          </div>
        )}

        <Card 
          style={{ 
            width: '100%',
            border: inProgress 
              ? '2px solid #FF9500'
              : isInSplit 
              ? '2px solid #10B981'
              : undefined,
            transition: 'none'
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
              onClick={() => handleProgramClick(program)}
            >
              {inProgress ? 'Продолжить' : 'Начать'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }, [hasInProgressSession, handleProgramClick]);

  return (
    <>
      <div style={{ minHeight: '100vh', paddingBottom: '88px' }}>
        {loading && programs.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 'calc(100vh - 88px)',
            backgroundColor: 'var(--tg-theme-bg-color)'
          }}>
            <Spinner size="l" />
          </div>
        ) : (
          <div style={{ padding: '16px' }}>
            <div style={{ 
              marginBottom: '28px', 
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px'
            }}>
              <div style={{ 
                textAlign: 'center',
                flex: 1
              }}>
                <Title level="2" weight="2" style={{ marginBottom: '6px', fontSize: '24px' }}>
                  Привет, {userName}!
                </Title>
                <Text style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px' }}>
                  Готов к тренировке?
                </Text>
              </div>
              
              {programs.length > 0 && (
                <div 
                  onClick={handleCreateClick}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--tg-theme-button-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease-out',
                    flexShrink: 0
                  }}
                  onTouchStart={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(0.9)';
                  }}
                  onTouchEnd={(e) => {
                    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                  }}
                >
                  <Plus size={24} color="var(--tg-theme-button-text-color)" />
                </div>
              )}
            </div>

            {programs.length === 0 ? (
              <Section>
                <Card style={{ textAlign: 'center', padding: '32px 16px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    marginBottom: '16px',
                    animation: 'float 3s ease-in-out infinite'
                  }}>
                    <Dumbbell 
                      size={64} 
                      color="var(--tg-theme-hint-color)" 
                      strokeWidth={1.5}
                    />
                  </div>
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
                    onClick={handleSelectTemplate}
                    style={{ marginBottom: '12px', fontSize: '15px' }}
                  >
                    Выбрать готовую программу
                  </Button>
                  
                  <Button 
                    size="m" 
                    stretched 
                    mode="outline"
                    onClick={handleCreateOwn}
                    style={{ fontSize: '15px' }}
                  >
                    Создать свою программу
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
                        gap: '6px'
                      }}>
                        <Title level="3" weight="2" style={{ fontSize: '18px', margin: 0 }}>
                          Основной сплит
                        </Title>
                        <div
                          onClick={handleInfoClick}
                          style={{
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '2px'
                          }}
                        >
                          <Info size={16} color="var(--tg-theme-hint-color)" strokeWidth={2} />
                        </div>
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
                      {otherPrograms.map((program, index) => renderProgramCard(program, false, index))}
                    </div>
                  </Section>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <BottomNav
        onCreateClick={handleCreateClick}
        onHistoryClick={handleHistoryClick}
        onStatisticsClick={handleStatisticsClick}
        onProfileClick={handleProfileClick}
        activeTab="programs"
      />

      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'flex-end',
            zIndex: 1000
          }}
          onClick={handleModalClose}
        >
          <div
            style={{
              backgroundColor: 'var(--tg-theme-bg-color)',
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px',
              padding: '24px',
              paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
              width: '100%',
              animation: 'slideUp 0.3s ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Title level="2" weight="2" style={{ marginBottom: '16px', fontSize: '20px', textAlign: 'center' }}>
              Создать программу
            </Title>
            
            <Button 
              size="l" 
              stretched 
              onClick={handleCreateOwn}
              style={{ marginBottom: '12px', fontSize: '16px' }}
            >
              Создать свою программу
            </Button>
            
            <Button 
              size="l" 
              stretched 
              mode="outline"
              onClick={handleSelectTemplate}
              style={{ marginBottom: '12px', fontSize: '16px' }}
            >
              Выбрать из шаблонов
            </Button>

            <Button 
              size="l" 
              stretched 
              mode="plain"
              onClick={handleModalClose}
              style={{ fontSize: '16px' }}
            >
              Отмена
            </Button>
          </div>
        </div>
      )}
    </>
  );
});

ProgramSelector.displayName = 'ProgramSelector';

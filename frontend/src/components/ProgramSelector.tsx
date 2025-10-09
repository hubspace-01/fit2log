import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { 
  Section, 
  Button, 
  Title, 
  Text,
  Card
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

const SkeletonCard: React.FC = () => (
  <div style={{
    backgroundColor: 'var(--tg-theme-secondary-bg-color)',
    borderRadius: '12px',
    padding: '14px',
    height: '76px',
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
      animation: 'shimmer 1.5s infinite'
    }} />
  </div>
);

const BottomNav: React.FC<BottomNavProps> = React.memo(({ 
  onCreateClick, 
  onHistoryClick, 
  onStatisticsClick,
  onProfileClick,
  activeTab = 'programs'
}) => {
  const handleNavClick = useCallback((action: () => void, haptic: boolean = true) => {
    if (haptic) {
      telegramService.hapticFeedback('impact', 'light');
    }
    action();
  }, []);

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
      backgroundColor: 'var(--tg-theme-secondary-bg-color)',
      borderTop: '1px solid rgba(0,0,0,0.1)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
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
            onClick={() => handleNavClick(item.onClick)}
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
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    telegramService.hideBackButton();
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    const loadInProgressSessions = async () => {
      const startTime = Date.now();
      
      timer = setTimeout(() => {
        if (Date.now() - startTime > 300) {
          setShowSkeleton(true);
        }
      }, 300);

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
        clearTimeout(timer);
        setLoading(false);
        setShowSkeleton(false);
      }
    };

    if (userId) {
      loadInProgressSessions();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [userId, programs]);

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

  const handleProfileClick = useCallback(() => {
    telegramService.hapticFeedback('impact', 'light');
    telegramService.showAlert('Раздел "Профиль" в разработке');
  }, []);

  const handleInfoClick = useCallback(() => {
    telegramService.hapticFeedback('impact', 'light');
    telegramService.showAlert('Основной сплит — это программы с установленным порядком дней тренировок');
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
              onClick={() => handleProgramClick(program)}
            >
              {inProgress ? 'Продолжить' : 'Начать'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }, [hasInProgressSession, handleProgramClick]);

  if (loading && showSkeleton) {
    return (
      <div style={{ padding: '16px', paddingBottom: '88px' }}>
        <div style={{ marginBottom: '28px', textAlign: 'center', position: 'relative' }}>
          <Title level="2" weight="2" style={{ marginBottom: '6px', fontSize: '24px' }}>
            Привет, {userName}!
          </Title>
          <Text style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px' }}>
            Готов к тренировке?
          </Text>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <BottomNav
          onCreateClick={handleCreateClick}
          onHistoryClick={onViewHistory}
          onStatisticsClick={onViewStatistics}
          onProfileClick={handleProfileClick}
          activeTab="programs"
        />
      </div>
    );
  }

  return (
    <>
      <div className="app-container fade-in" style={{ padding: '16px', paddingBottom: '88px' }}>
        <div style={{ 
          marginBottom: '28px', 
          padding: '8px',
          position: 'relative'
        }}>
          <div style={{ 
            textAlign: 'center',
            paddingRight: programs.length > 0 ? '48px' : '0'
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
                transition: 'transform 0.15s ease-out'
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

        <BottomNav
          onCreateClick={handleCreateClick}
          onHistoryClick={onViewHistory}
          onStatisticsClick={onViewStatistics}
          onProfileClick={handleProfileClick}
          activeTab="programs"
        />
      </div>

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

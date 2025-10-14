import React, { useMemo, useState, useEffect } from 'react';
import { 
  Section, 
  Button, 
  Title, 
  Text,
  Card,
  Spinner,
  Caption,
  Cell,
  Modal
} from '@telegram-apps/telegram-ui';
import { Trophy, Zap, Dumbbell, Heart, Flame, Home, List, Clock, Route, Check, X } from 'lucide-react';
import type { ProgramTemplate } from '../types';
import { telegramService } from '../lib/telegram';

interface Props {
  templates: ProgramTemplate[];
  loading: boolean;
  onSelectTemplate: (template: ProgramTemplate) => void;
  onBack: () => void;
}

export const TemplateList: React.FC<Props> = ({
  templates,
  loading,
  onSelectTemplate,
  onBack
}) => {
  const [previewTemplate, setPreviewTemplate] = useState<ProgramTemplate | null>(null);

  useEffect(() => {
    telegramService.showBackButton(onBack);
    return () => {};
  }, [onBack]);

  const groupedTemplates = useMemo(() => {
    const groups: Record<string, ProgramTemplate[]> = {};
    templates.forEach(template => {
      const category = template.category || 'Другое';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(template);
    });
    return groups;
  }, [templates]);

  const categoryConfig: Record<string, { icon: React.ReactNode; name: string; color: string }> = {
    'Beginner': { icon: <Trophy size={18} strokeWidth={2} />, name: 'Для новичков', color: '#4ade80' },
    'Strength': { icon: <Zap size={18} strokeWidth={2} />, name: 'Сила', color: '#f97316' },
    'Hypertrophy': { icon: <Dumbbell size={18} strokeWidth={2} />, name: 'Масса', color: '#8b5cf6' },
    'Cardio': { icon: <Heart size={18} strokeWidth={2} />, name: 'Кардио', color: '#06b6d4' },
    'CrossFit': { icon: <Flame size={18} strokeWidth={2} />, name: 'CrossFit', color: '#ef4444' },
    'Home Workout': { icon: <Home size={18} strokeWidth={2} />, name: 'Дома', color: '#3b82f6' },
    'Другое': { icon: <List size={18} strokeWidth={2} />, name: 'Другое', color: '#64748b' }
  };

  const getExerciseTypeCounts = (template: ProgramTemplate) => {
    const exercises = template.template_exercises || [];
    const counts = {
      reps: exercises.filter(e => e.exercise_type === 'reps').length,
      time: exercises.filter(e => e.exercise_type === 'time').length,
      distance: exercises.filter(e => e.exercise_type === 'distance').length
    };
    return counts;
  };

  const getTypeIcon = (type: string) => {
    if (type === 'time') return <Clock size={14} strokeWidth={2} />;
    if (type === 'distance') return <Route size={14} strokeWidth={2} />;
    return <Dumbbell size={14} strokeWidth={2} />;
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'var(--tg-theme-bg-color)'
      }}>
        <Spinner size="l" />
      </div>
    );
  }

  return (
    <>
      <div className="app-container fade-in" style={{ 
        padding: '0 16px 24px',
        minHeight: '100vh',
        backgroundColor: 'var(--tg-theme-bg-color)'
      }}>
        <div style={{ 
          padding: '20px 0 24px',
          textAlign: 'center' 
        }}>
          <Title level="2" weight="2" style={{ marginBottom: '6px', fontSize: '24px' }}>
            Готовые программы
          </Title>
          <Text style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px' }}>
            Выбери из готовых шаблонов
          </Text>
        </div>

        {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => {
          const config = categoryConfig[category] || categoryConfig['Другое'];
          
          return (
            <Section 
              key={category}
              header={
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '8px 0'
                }}>
                  <div style={{ color: config.color, display: 'flex', alignItems: 'center' }}>
                    {config.icon}
                  </div>
                  <Text weight="2" style={{ fontSize: '15px' }}>
                    {config.name}
                  </Text>
                </div>
              }
              style={{ marginBottom: '16px' }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {categoryTemplates.map((template) => {
                  const typeCounts = getExerciseTypeCounts(template);
                  const totalExercises = template.template_exercises?.length || 0;

                  return (
                    <Card 
                      key={template.id} 
                      style={{ 
                        width: '100%',
                        borderLeft: `3px solid ${config.color}`,
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        telegramService.hapticFeedback('impact', 'light');
                        setPreviewTemplate(template);
                      }}
                    >
                      <div style={{ padding: '14px' }}>
                        <div style={{ marginBottom: '8px' }}>
                          <Text weight="2" style={{ fontSize: '16px', display: 'block' }}>
                            {template.template_name}
                          </Text>
                        </div>
                        
                        {template.description && (
                          <Text style={{ 
                            fontSize: '13px', 
                            color: 'var(--tg-theme-hint-color)',
                            marginBottom: '10px',
                            display: 'block',
                            lineHeight: '1.4'
                          }}>
                            {template.description}
                          </Text>
                        )}
                        
                        <div style={{ 
                          display: 'flex', 
                          gap: '6px',
                          marginBottom: '12px',
                          flexWrap: 'wrap'
                        }}>
                          {typeCounts.reps > 0 && (
                            <span style={{
                              fontSize: '11px',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(139, 92, 246, 0.1)',
                              color: '#8b5cf6',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Dumbbell size={12} strokeWidth={2} />
                              {typeCounts.reps} повт
                            </span>
                          )}
                          {typeCounts.time > 0 && (
                            <span style={{
                              fontSize: '11px',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(240, 147, 251, 0.1)',
                              color: '#f093fb',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Clock size={12} strokeWidth={2} />
                              {typeCounts.time} время
                            </span>
                          )}
                          {typeCounts.distance > 0 && (
                            <span style={{
                              fontSize: '11px',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              backgroundColor: 'rgba(79, 172, 254, 0.1)',
                              color: '#4facfe',
                              fontWeight: '500',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <Route size={12} strokeWidth={2} />
                              {typeCounts.distance} расст
                            </span>
                          )}
                        </div>
                        
                        <div style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center'
                        }}>
                          <Caption level="1" style={{ 
                            fontSize: '12px', 
                            color: 'var(--tg-theme-hint-color)' 
                          }}>
                            {totalExercises} {totalExercises === 1 ? 'упражнение' : totalExercises < 5 ? 'упражнения' : 'упражнений'}
                          </Caption>
                          <Text style={{ 
                            fontSize: '12px', 
                            color: 'var(--tg-theme-link-color)',
                            fontWeight: '500'
                          }}>
                            Просмотр
                          </Text>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Section>
          );
        })}
      </div>

      {previewTemplate && (
        <Modal
          open={!!previewTemplate}
          onOpenChange={(open) => {
            if (!open) {
              telegramService.hapticFeedback('impact', 'light');
              setPreviewTemplate(null);
            }
          }}
          header={
            <div style={{ textAlign: 'center', width: '100%' }}>
              <Title level="2" weight="2" style={{ fontSize: '20px' }}>
                {previewTemplate.template_name}
              </Title>
            </div>
          }
        >
          <div style={{ padding: '16px' }}>
            {previewTemplate.description && (
              <Text style={{ 
                fontSize: '14px', 
                color: 'var(--tg-theme-hint-color)',
                marginBottom: '16px',
                display: 'block',
                textAlign: 'center'
              }}>
                {previewTemplate.description}
              </Text>
            )}

            <Section header={
              <div style={{ textAlign: 'center', width: '100%' }}>
                УПРАЖНЕНИЯ
              </div>
            }>
              {(previewTemplate.template_exercises || [])
                .sort((a, b) => a.order_index - b.order_index)
                .map((exercise) => {
                  let subtitle = '';
                  const type = exercise.exercise_type || 'reps';
                  
                  if (type === 'reps') {
                    subtitle = `${exercise.target_sets} × ${exercise.target_reps} повт`;
                    if (exercise.target_weight > 0) {
                      subtitle += ` • ${exercise.target_weight} кг`;
                    }
                  } else if (type === 'time') {
                    subtitle = `${exercise.target_sets} × ${exercise.duration}с`;
                  } else if (type === 'distance') {
                    subtitle = `${exercise.distance} м`;
                  }

                  return (
                    <Cell
                      key={exercise.id}
                      before={
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: type === 'reps' 
                            ? '#8b5cf6'
                            : type === 'time'
                            ? '#f093fb'
                            : '#4facfe',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {getTypeIcon(type)}
                        </div>
                      }
                      subtitle={subtitle}
                    >
                      {exercise.exercise_name}
                    </Cell>
                  );
                })}
            </Section>

            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '8px',
              marginTop: '16px'
            }}>
              <Button
                size="l"
                stretched
                mode="filled"
                onClick={() => {
                  telegramService.hapticFeedback('impact', 'medium');
                  onSelectTemplate(previewTemplate);
                  setPreviewTemplate(null);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <Check size={20} strokeWidth={2} />
                  <span>Добавить программу</span>
                </div>
              </Button>
              <Button
                size="m"
                stretched
                mode="outline"
                onClick={() => {
                  telegramService.hapticFeedback('impact', 'light');
                  setPreviewTemplate(null);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                  <X size={18} strokeWidth={2} />
                  <span>Отмена</span>
                </div>
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};

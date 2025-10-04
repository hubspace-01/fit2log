import React from 'react';
import { 
  Section, 
  Button, 
  Title, 
  Text,
  Card,
  Spinner
} from '@telegram-apps/telegram-ui';
import type { ProgramTemplate } from '../types';

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
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spinner size="l" />
      </div>
    );
  }

  return (
    <div className="app-container fade-in" style={{ padding: '16px', paddingBottom: '24px' }}>
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <Title level="2" weight="2" style={{ marginBottom: '6px', fontSize: '24px' }}>
          Готовые программы
        </Title>
        <Text style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px' }}>
          Выбери из готовых шаблонов
        </Text>
      </div>

      <Section>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {templates.map((template) => (
            <Card 
              key={template.id} 
              style={{ 
                width: '100%',
                cursor: 'pointer'
              }}
              onClick={() => onSelectTemplate(template)}
            >
              <div style={{ padding: '14px' }}>
                <div style={{ marginBottom: '8px' }}>
                  <Text weight="2" style={{ fontSize: '16px', display: 'block' }}>
                    {template.template_name}
                  </Text>
                </div>
                
                <Text style={{ 
                  fontSize: '13px', 
                  color: 'var(--tg-theme-hint-color)',
                  marginBottom: '10px',
                  display: 'block',
                  lineHeight: '1.4'
                }}>
                  {template.description}
                </Text>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginTop: '12px'
                }}>
                  <Text style={{ 
                    fontSize: '12px', 
                    color: 'var(--tg-theme-hint-color)' 
                  }}>
                    {template.template_exercises?.length || 0} упражнений • {template.category}
                  </Text>
                  <Button 
                    size="s" 
                    mode="filled" 
                    style={{ fontSize: '13px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTemplate(template);
                    }}
                  >
                    Добавить
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section style={{ marginTop: '24px' }}>
        <Button 
          size="m" 
          stretched 
          mode="outline"
          onClick={onBack}
          style={{ fontSize: '15px' }}
        >
          ← Назад
        </Button>
      </Section>
    </div>
  );
};

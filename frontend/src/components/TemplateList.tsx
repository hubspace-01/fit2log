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
    <div className="app-container fade-in" style={{ padding: '12px', paddingBottom: '24px' }}>
      <div style={{ marginBottom: '20px', padding: '4px' }}>
        <Title level="2" weight="2" style={{ marginBottom: '4px', fontSize: '24px' }}>
          Готовые программы
        </Title>
        <Text style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px' }}>
          Выбери из готовых шаблонов
        </Text>
      </div>

      <Section>
        {templates.map((template) => (
          <Card key={template.id} style={{ marginBottom: '10px', overflow: 'hidden' }}>
            <div onClick={() => onSelectTemplate(template)} style={{ padding: '12px' }}>
              <div style={{ marginBottom: '6px' }}>
                <Text weight="2" style={{ fontSize: '16px' }}>
                  {template.template_name}
                </Text>
              </div>
              <Text style={{ 
                fontSize: '13px', 
                color: 'var(--tg-theme-hint-color)',
                marginBottom: '6px',
                display: 'block'
              }}>
                {template.description}
              </Text>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginTop: '10px'
              }}>
                <Text style={{ fontSize: '12px', color: 'var(--tg-theme-hint-color)' }}>
                  {template.template_exercises?.length || 0} упр. • {template.category}
                </Text>
                <Button size="s" mode="filled" style={{ fontSize: '13px' }}>
                  Добавить
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </Section>

      <Section style={{ marginTop: '20px' }}>
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

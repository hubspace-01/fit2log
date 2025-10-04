import React from 'react';
import { 
  Section, 
  Cell, 
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
    <div className="app-container fade-in" style={{ padding: '16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level="1" weight="1" style={{ marginBottom: '8px' }}>
          Готовые программы
        </Title>
        <Text style={{ color: 'var(--tg-theme-hint-color)' }}>
          Выбери программу из готовых шаблонов
        </Text>
      </div>

      <Section>
        {templates.map((template) => (
          <Card key={template.id} style={{ marginBottom: '12px' }}>
            <Cell
              onClick={() => onSelectTemplate(template)}
              description={template.description}
              subtitle={`${template.template_exercises?.length || 0} упражнений • ${template.category}`}
              after={
                <Button size="s" mode="filled">
                  Добавить
                </Button>
              }
            >
              {template.template_name}
            </Cell>
          </Card>
        ))}
      </Section>

      <Section style={{ marginTop: '24px' }}>
        <Button 
          size="l" 
          stretched 
          mode="outline"
          onClick={onBack}
        >
          ← Назад
        </Button>
      </Section>
    </div>
  );
};

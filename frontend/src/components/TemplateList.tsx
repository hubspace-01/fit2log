import React from 'react';
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
    return <div style={{ padding: '16px' }}>Загрузка...</div>;
  }

  return (
    <div style={{ padding: '16px' }}>
      <h1>Готовые программы</h1>
      <p>Выберите программу из готовых шаблонов</p>

      {templates.map((template) => (
        <div 
          key={template.id}
          onClick={() => onSelectTemplate(template)}
          style={{ 
            padding: '12px', 
            marginBottom: '8px', 
            border: '1px solid #ccc',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          <strong>{template.template_name}</strong>
          <div style={{ fontSize: '14px', color: '#666' }}>
            {template.description}
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
            {template.template_exercises?.length || 0} упражнений • {template.category}
          </div>
        </div>
      ))}

      <button onClick={onBack} style={{ width: '100%', marginTop: '16px' }}>
        Назад
      </button>
    </div>
  );
};

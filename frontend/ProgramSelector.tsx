import React from 'react';
import { 
  Section, 
  Button, 
  Title, 
  Text,
  Card
} from '@telegram-apps/telegram-ui';
import type { Program } from '../types';

interface Props {
  programs: Program[];
  userName: string;
  onCreateProgram: () => void;
  onSelectTemplate: () => void;
  onSelectProgram: (program: Program) => void;
}

export const ProgramSelector: React.FC<Props> = ({
  programs,
  userName,
  onCreateProgram,
  onSelectTemplate,
  onSelectProgram
}) => {
  return (
    <div className="app-container fade-in" style={{ padding: '16px', paddingBottom: '24px' }}>
      {/* Приветствие по центру */}
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
          {/* Список программ - клик только на кнопке */}
          <Section 
            header={
              <Title level="3" weight="2" style={{ fontSize: '18px', marginBottom: '12px' }}>
                Мои программы
              </Title>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {programs.map((program) => (
                <Card 
                  key={program.id} 
                  style={{ width: '100%' }}
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
                      Начать 🏋️
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </Section>

          {/* Кнопки действий */}
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

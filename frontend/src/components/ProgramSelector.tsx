import React from 'react';
import { 
  Section, 
  Cell, 
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
    <div className="app-container fade-in" style={{ padding: '16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Title level="1" weight="1" style={{ marginBottom: '8px' }}>
          Привет, {userName}! 👋
        </Title>
        <Text style={{ color: 'var(--tg-theme-hint-color)' }}>
          Готов к тренировке?
        </Text>
      </div>

      {programs.length === 0 ? (
        <Section>
          <Card style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>💪</div>
            <Title level="3" weight="2" style={{ marginBottom: '8px' }}>
              Начни свой путь
            </Title>
            <Text style={{ color: 'var(--tg-theme-hint-color)', marginBottom: '24px' }}>
              У тебя пока нет программ тренировок
            </Text>
            
            <Button 
              size="l" 
              stretched 
              onClick={onSelectTemplate}
              style={{ marginBottom: '12px' }}
            >
              📋 Выбрать готовую программу
            </Button>
            
            <Button 
              size="l" 
              stretched 
              mode="outline"
              onClick={onCreateProgram}
            >
              ✏️ Создать свою программу
            </Button>
          </Card>
        </Section>
      ) : (
        <>
          <Section 
            header={<Title level="2" weight="2">Мои программы ({programs.length})</Title>}
          >
            {programs.map((program) => (
              <Card key={program.id} style={{ marginBottom: '12px' }}>
                <Cell
                  onClick={() => onSelectProgram(program)}
                  subtitle={`${program.exercises?.length || 0} упражнений`}
                  after={
                    <Button size="s" mode="filled">
                      Начать 🏋️
                    </Button>
                  }
                >
                  {program.program_name}
                </Cell>
              </Card>
            ))}
          </Section>

          <Section style={{ marginTop: '24px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button 
                size="l" 
                stretched 
                mode="outline"
                onClick={onSelectTemplate}
              >
                📋 Шаблоны
              </Button>
              <Button 
                size="l" 
                stretched 
                mode="outline"
                onClick={onCreateProgram}
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

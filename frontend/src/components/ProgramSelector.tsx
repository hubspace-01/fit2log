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
    <div className="app-container fade-in" style={{ padding: '12px', paddingBottom: '24px' }}>
      <div style={{ marginBottom: '20px', padding: '4px' }}>
        <Title level="2" weight="2" style={{ marginBottom: '4px', fontSize: '24px' }}>
          Привет, {userName}! 👋
        </Title>
        <Text style={{ color: 'var(--tg-theme-hint-color)', fontSize: '14px' }}>
          Готов к тренировке?
        </Text>
      </div>

      {programs.length === 0 ? (
        <Section>
          <Card style={{ textAlign: 'center', padding: '24px 12px' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>💪</div>
            <Title level="3" weight="2" style={{ marginBottom: '6px', fontSize: '18px' }}>
              Начни свой путь
            </Title>
            <Text style={{ color: 'var(--tg-theme-hint-color)', marginBottom: '20px', fontSize: '14px' }}>
              У тебя пока нет программ тренировок
            </Text>
            
            <Button 
              size="m" 
              stretched 
              onClick={onSelectTemplate}
              style={{ marginBottom: '10px', fontSize: '15px' }}
            >
              📋 Выбрать готовую
            </Button>
            
            <Button 
              size="m" 
              stretched 
              mode="outline"
              onClick={onCreateProgram}
              style={{ fontSize: '15px' }}
            >
              ✏️ Создать свою
            </Button>
          </Card>
        </Section>
      ) : (
        <>
          <Section 
            header={
              <Title level="3" weight="2" style={{ fontSize: '18px', padding: '0 4px' }}>
                Мои программы ({programs.length})
              </Title>
            }
          >
            {programs.map((program) => (
              <Card key={program.id} style={{ marginBottom: '8px', overflow: 'hidden' }}>
                <Cell
                  onClick={() => onSelectProgram(program)}
                  subtitle={`${program.exercises?.length || 0} упражнений`}
                  after={
                    <Button size="s" mode="filled" style={{ fontSize: '13px', padding: '6px 12px' }}>
                      Начать
                    </Button>
                  }
                  style={{ fontSize: '15px' }}
                >
                  <div style={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    maxWidth: '180px'
                  }}>
                    {program.program_name}
                  </div>
                </Cell>
              </Card>
            ))}
          </Section>

          <Section style={{ marginTop: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
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

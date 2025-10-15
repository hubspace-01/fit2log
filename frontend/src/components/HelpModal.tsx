import React from 'react';
import { Card, Title, Text, Button } from '@telegram-apps/telegram-ui';
import { Dumbbell, Clock, Route, Weight, FileText, X } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 999,
          animation: 'fadeIn 0.2s ease-out'
        }}
        onClick={onClose}
      />
      
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--tg-theme-bg-color)',
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        <div style={{
          padding: '20px 16px 16px',
          borderBottom: '1px solid var(--tg-theme-hint-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Title level="2" weight="2" style={{ fontSize: '20px' }}>
            Как заполнять программу
          </Title>
          <div
            onClick={onClose}
            style={{
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              backgroundColor: 'var(--tg-theme-secondary-bg-color)'
            }}
          >
            <X size={20} color="var(--tg-theme-text-color)" strokeWidth={2} />
          </div>
        </div>

        <div style={{
          padding: '16px',
          overflowY: 'auto',
          flex: 1
        }}>
          <Card style={{ width: '100%', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
              <Dumbbell size={20} color="var(--tg-theme-link-color)" strokeWidth={2} />
              <Text weight="2" style={{ fontSize: '15px' }}>
                Типы упражнений
              </Text>
            </div>
            <div style={{ paddingLeft: '32px' }}>
              <Text style={{ fontSize: '14px', display: 'block', marginBottom: '6px' }}>
                • Повт — для жима, приседа, тяги
              </Text>
              <Text style={{ fontSize: '14px', display: 'block', marginBottom: '6px' }}>
                • Время — для планки, удержания
              </Text>
              <Text style={{ fontSize: '14px', display: 'block' }}>
                • Расст — для бега, велосипеда
              </Text>
            </div>
          </Card>

          <Card style={{ width: '100%', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
              <Weight size={20} color="var(--tg-theme-link-color)" strokeWidth={2} />
              <Text weight="2" style={{ fontSize: '15px' }}>
                Вес (кг)
              </Text>
            </div>
            <div style={{ paddingLeft: '32px' }}>
              <Text style={{ fontSize: '14px', display: 'block', lineHeight: '1.5' }}>
                Для упражнений с собственным весом (подтягивания, отжимания) оставьте поле пустым или 0.
              </Text>
            </div>
          </Card>

          <Card style={{ width: '100%', padding: '16px', marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
              <FileText size={20} color="var(--tg-theme-link-color)" strokeWidth={2} />
              <Text weight="2" style={{ fontSize: '15px' }}>
                Заметки
              </Text>
            </div>
            <div style={{ paddingLeft: '32px' }}>
              <Text style={{ fontSize: '14px', display: 'block', lineHeight: '1.5' }}>
                Используйте для описания техники, особенностей выполнения или напоминаний.
              </Text>
            </div>
          </Card>
        </div>

        <div style={{
          padding: '16px',
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          borderTop: '1px solid var(--tg-theme-hint-color)'
        }}>
          <Button
            size="l"
            stretched
            mode="filled"
            onClick={onClose}
            style={{ fontSize: '16px' }}
          >
            Понятно
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </>
  );
};

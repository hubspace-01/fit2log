import React from 'react';
import { Title, Text, Button } from '@telegram-apps/telegram-ui';
import { Dumbbell, Weight, FileText, X } from 'lucide-react';

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
        <div
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: 'var(--tg-theme-secondary-bg-color)',
            zIndex: 10
          }}
        >
          <X size={20} color="var(--tg-theme-hint-color)" strokeWidth={2} />
        </div>

        <div style={{
          padding: '40px 24px 20px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'rgba(76, 175, 80, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <FileText size={40} color="rgb(76, 175, 80)" strokeWidth={2} />
          </div>

          <Title level="1" weight="2" style={{ fontSize: '24px', marginBottom: '8px' }}>
            Как заполнять программу
          </Title>
          
          <Text style={{ 
            fontSize: '14px', 
            color: 'var(--tg-theme-hint-color)',
            display: 'block'
          }}>
            Следуйте этим простым правилам при создании программы
          </Text>
        </div>

        <div style={{
          padding: '0 24px 24px',
          overflowY: 'auto',
          flex: 1
        }}>
          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            alignItems: 'flex-start'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Dumbbell size={24} color="rgb(33, 150, 243)" strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
              <Text weight="2" style={{ fontSize: '16px', display: 'block', marginBottom: '6px' }}>
                Типы упражнений
              </Text>
              <Text style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)', lineHeight: '1.5' }}>
                Повт — для жима, приседа, тяги. Время — для планки, удержания. Расст — для бега, велосипеда.
              </Text>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '24px',
            alignItems: 'flex-start'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 152, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Weight size={24} color="rgb(255, 152, 0)" strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
              <Text weight="2" style={{ fontSize: '16px', display: 'block', marginBottom: '6px' }}>
                Вес (кг)
              </Text>
              <Text style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)', lineHeight: '1.5' }}>
                Для упражнений с собственным весом (подтягивания, отжимания) оставьте поле пустым или 0.
              </Text>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '16px',
            alignItems: 'flex-start'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: 'rgba(156, 39, 176, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FileText size={24} color="rgb(156, 39, 176)" strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
              <Text weight="2" style={{ fontSize: '16px', display: 'block', marginBottom: '6px' }}>
                Заметки
              </Text>
              <Text style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)', lineHeight: '1.5' }}>
                Используйте для описания техники, особенностей выполнения или напоминаний.
              </Text>
            </div>
          </div>
        </div>

        <div style={{
          padding: '16px 24px',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))'
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

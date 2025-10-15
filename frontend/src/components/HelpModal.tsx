import React from 'react';
import { Title, Text, Button } from '@telegram-apps/telegram-ui';
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
          maxHeight: '85vh',
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
          padding: '40px 24px 16px',
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

          <Title level="1" weight="2" style={{ fontSize: '22px', marginBottom: '8px' }}>
            Как заполнять программу
          </Title>
          
          <Text style={{ 
            fontSize: '13px', 
            color: 'var(--tg-theme-hint-color)',
            display: 'block',
            lineHeight: '1.4'
          }}>
            Выберите тип упражнения и заполните параметры
          </Text>
        </div>

        <div style={{
          padding: '0 20px 20px',
          overflowY: 'auto',
          flex: 1
        }}>
          <div style={{
            display: 'flex',
            gap: '14px',
            marginBottom: '20px',
            alignItems: 'flex-start'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'rgba(33, 150, 243, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Dumbbell size={22} color="rgb(33, 150, 243)" strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
              <Text weight="2" style={{ fontSize: '15px', display: 'block', marginBottom: '6px' }}>
                Повторения
              </Text>
              <Text style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color)', lineHeight: '1.5' }}>
                Силовые упражнения со штангой, гантелями или на тренажёрах: жим лежа, приседания, становая тяга, подтягивания, отжимания, тяга блока.
              </Text>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '14px',
            marginBottom: '20px',
            alignItems: 'flex-start'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'rgba(156, 39, 176, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Clock size={22} color="rgb(156, 39, 176)" strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
              <Text weight="2" style={{ fontSize: '15px', display: 'block', marginBottom: '6px' }}>
                Время
              </Text>
              <Text style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color)', lineHeight: '1.5' }}>
                Статические упражнения (планка, удержание) или кардио на время (бег/ходьба на беговой дорожке, эллипсоид, велотренажёр).
              </Text>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '14px',
            marginBottom: '20px',
            alignItems: 'flex-start'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 87, 34, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Route size={22} color="rgb(255, 87, 34)" strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
              <Text weight="2" style={{ fontSize: '15px', display: 'block', marginBottom: '6px' }}>
                Расстояние
              </Text>
              <Text style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color)', lineHeight: '1.5' }}>
                Кардио с измерением дистанции: бег на беговой дорожке, велосипед, эллипсоид, гребной тренажёр (в метрах или километрах).
              </Text>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '14px',
            marginBottom: '20px',
            alignItems: 'flex-start'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 152, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Weight size={22} color="rgb(255, 152, 0)" strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
              <Text weight="2" style={{ fontSize: '15px', display: 'block', marginBottom: '6px' }}>
                Вес (кг)
              </Text>
              <Text style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color)', lineHeight: '1.5' }}>
                Указывайте вес отягощений (штанга, гантели, блины). Для упражнений с собственным весом (подтягивания, отжимания) оставьте 0 или пусто.
              </Text>
            </div>
          </div>

          <div style={{
            display: 'flex',
            gap: '14px',
            alignItems: 'flex-start'
          }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FileText size={22} color="rgb(76, 175, 80)" strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
              <Text weight="2" style={{ fontSize: '15px', display: 'block', marginBottom: '6px' }}>
                Заметки
              </Text>
              <Text style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color)', lineHeight: '1.5' }}>
                Записывайте технику выполнения, особенности хвата, темп, углы наклона или напоминания о безопасности.
              </Text>
            </div>
          </div>
        </div>

        <div style={{
          padding: '12px 20px',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))'
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

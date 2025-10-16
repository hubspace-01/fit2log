import React, { useEffect } from 'react';
import { Button, Title, Text } from '@telegram-apps/telegram-ui';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { telegramService } from '../lib/telegram';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Да',
  cancelText = 'Отмена',
  onConfirm,
  onCancel,
  danger = false
}) => {
  useEffect(() => {
    if (isOpen) {
      telegramService.hapticFeedback('impact', 'light');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    telegramService.hapticFeedback('impact', 'medium');
    onConfirm();
  };

  const handleCancel = () => {
    telegramService.hapticFeedback('impact', 'light');
    onCancel();
  };

  const getIcon = () => {
    if (danger) {
      return <AlertCircle size={40} color="rgb(244, 67, 54)" strokeWidth={2} />;
    }
    return <Info size={40} color="rgb(33, 150, 243)" strokeWidth={2} />;
  };

  const getIconBg = () => {
    if (danger) {
      return 'rgba(244, 67, 54, 0.15)';
    }
    return 'rgba(33, 150, 243, 0.15)';
  };

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
        onClick={handleCancel}
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
          maxHeight: '70vh',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 1000,
          animation: 'slideUp 0.3s ease-out'
        }}
      >
        <div style={{
          padding: '40px 24px 24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: getIconBg(),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            {getIcon()}
          </div>

          <Title level="1" weight="2" style={{ fontSize: '20px', marginBottom: '12px' }}>
            {title}
          </Title>
          
          <Text style={{ 
            fontSize: '14px', 
            color: 'var(--tg-theme-hint-color)',
            display: 'block',
            lineHeight: '1.5'
          }}>
            {message}
          </Text>
        </div>

        <div style={{
          padding: '0 24px 24px',
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <Button
            size="l"
            stretched
            mode="filled"
            onClick={handleConfirm}
            style={{ 
              fontSize: '16px',
              ...(danger && {
                backgroundColor: 'rgb(244, 67, 54)',
                color: 'white'
              })
            }}
          >
            {confirmText}
          </Button>

          <Button
            size="l"
            stretched
            mode="outline"
            onClick={handleCancel}
            style={{ fontSize: '16px' }}
          >
            {cancelText}
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

import React, { useEffect } from 'react';
import { Button, Title, Text } from '@telegram-apps/telegram-ui';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { telegramService } from '../lib/telegram';

interface AlertModalProps {
  isOpen: boolean;
  title?: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
  type?: 'info' | 'error' | 'success';
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  title,
  message,
  buttonText = 'ОК',
  onClose,
  type = 'info'
}) => {
  useEffect(() => {
    if (isOpen) {
      telegramService.hapticFeedback('impact', 'light');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClose = () => {
    telegramService.hapticFeedback('impact', 'light');
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle size={40} color="rgb(244, 67, 54)" strokeWidth={2} />;
      case 'success':
        return <CheckCircle size={40} color="rgb(76, 175, 80)" strokeWidth={2} />;
      default:
        return <Info size={40} color="rgb(33, 150, 243)" strokeWidth={2} />;
    }
  };

  const getIconBg = () => {
    switch (type) {
      case 'error':
        return 'rgba(244, 67, 54, 0.15)';
      case 'success':
        return 'rgba(76, 175, 80, 0.15)';
      default:
        return 'rgba(33, 150, 243, 0.15)';
    }
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
        onClick={handleClose}
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
          maxHeight: '60vh',
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

          {title && (
            <Title level="1" weight="2" style={{ fontSize: '20px', marginBottom: '12px' }}>
              {title}
            </Title>
          )}
          
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
          paddingBottom: 'max(24px, env(safe-area-inset-bottom))'
        }}>
          <Button
            size="l"
            stretched
            mode="filled"
            onClick={handleClose}
            style={{ fontSize: '16px' }}
          >
            {buttonText}
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

import React, { useCallback, useState } from 'react';
import { Section, Cell, Title, Switch } from '@telegram-apps/telegram-ui';
import { Settings, Palette, Globe, Weight, Trash2, MessageCircle, Info, Shield, Copy } from 'lucide-react';
import { telegramService } from '../lib/telegram';
import type { User, Settings as SettingsType } from '../types';

interface Props {
  user: User;
  settings: SettingsType;
  onBack: () => void;
  onSettingsChange: (settings: SettingsType) => void;
}

export const Profile: React.FC<Props> = ({ user, settings, onBack, onSettingsChange }) => {
  const [isCopying, setIsCopying] = useState(false);

  React.useEffect(() => {
    telegramService.showBackButton(onBack);
    return () => {
      telegramService.hideBackButton();
    };
  }, [onBack]);

  const handleHapticToggle = useCallback(() => {
    const newSettings = { ...settings, hapticEnabled: !settings.hapticEnabled };
    onSettingsChange(newSettings);
    if (newSettings.hapticEnabled) {
      telegramService.hapticFeedback('impact', 'medium');
    }
  }, [settings, onSettingsChange]);

  const handleCopyId = useCallback(() => {
    telegramService.hapticFeedback('impact', 'heavy');
    setIsCopying(true);
    
    setTimeout(() => setIsCopying(false), 600);
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(user.id).then(() => {
        telegramService.showAlert('ID скопирован в буфер обмена');
      }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = user.id;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          telegramService.showAlert('ID скопирован в буфер обмена');
        } catch (err) {
          telegramService.showAlert('Не удалось скопировать ID');
        }
        document.body.removeChild(textArea);
      });
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = user.id;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        telegramService.showAlert('ID скопирован в буфер обмена');
      } catch (err) {
        telegramService.showAlert('Не удалось скопировать ID');
      }
      document.body.removeChild(textArea);
    }
  }, [user.id]);

  const handleLockedClick = useCallback((e: React.MouseEvent) => {
    telegramService.hapticFeedback('impact', 'medium');
    const target = e.currentTarget as HTMLElement;
    target.style.animation = 'shake 0.3s';
    setTimeout(() => {
      target.style.animation = '';
    }, 300);
  }, []);

  const handleAboutClick = useCallback(() => {
    telegramService.hapticFeedback('impact', 'medium');
    telegramService.showAlert('Fit2Log v1.9.0\n\nТвой персональный дневник тренировок с прогрессивной системой логирования и анализом рекордов.');
  }, []);

  const avatarLetter = user.first_name.charAt(0).toUpperCase();

  return (
    <>
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes shake {
          0%, 100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 0.6;
          }
          100% {
            transform: scale(2);
            opacity: 0;
          }
        }

        .avatar-container {
          animation: fadeIn 0.5s ease-out;
        }

        .id-block {
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .id-block:hover {
          transform: scale(1.05);
          opacity: 0.9;
        }

        .id-block:active {
          transform: scale(0.98);
        }

        .id-block::after {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(0);
          opacity: 0;
        }

        .id-block.copying::after {
          animation: ripple 0.6s ease-out;
        }

        .copy-icon {
          transition: transform 0.3s ease;
        }

        .copy-icon.rotating {
          animation: rotate 0.6s ease-out;
        }

        .cell-interactive {
          transition: all 0.2s ease;
        }

        .cell-interactive:active {
          transform: scale(0.98);
          opacity: 0.8;
        }

        .locked-item {
          transition: opacity 0.2s ease;
        }

        .section-divider {
          height: 8px;
          background: transparent;
        }
      `}</style>

      <div style={{ minHeight: '100vh', paddingBottom: '24px', backgroundColor: 'var(--tg-theme-bg-color)' }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          padding: '32px 16px 20px',
          background: 'linear-gradient(180deg, var(--tg-theme-secondary-bg-color) 0%, var(--tg-theme-bg-color) 100%)',
          position: 'relative'
        }}>
          <div
            className="avatar-container"
            style={{
              width: '88px',
              height: '88px',
              borderRadius: '50%',
              backgroundColor: 'var(--tg-theme-link-color)',
              color: '#FFFFFF',
              fontSize: '40px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              border: '3px solid var(--tg-theme-bg-color)'
            }}
          >
            {avatarLetter}
          </div>
          
          <Title level="1" weight="2" style={{ fontSize: '24px', marginBottom: '2px', textAlign: 'center' }}>
            {user.first_name}
          </Title>
          
          {user.username && (
            <div style={{ 
              fontSize: '15px', 
              color: 'var(--tg-theme-hint-color)',
              marginBottom: '10px'
            }}>
              @{user.username}
            </div>
          )}

          <div 
            className={`id-block ${isCopying ? 'copying' : ''}`}
            onClick={handleCopyId}
            style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '12px',
              backgroundColor: 'var(--tg-theme-secondary-bg-color)',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.05)'
            }}
          >
            <span style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color)', fontFamily: 'monospace' }}>
              ID: {user.id}
            </span>
            <Copy 
              size={14} 
              color="var(--tg-theme-hint-color)" 
              className={`copy-icon ${isCopying ? 'rotating' : ''}`}
            />
          </div>
        </div>

        <Section header="НАСТРОЙКИ">
          <Cell
            before={<Settings size={22} color="var(--tg-theme-text-color)" />}
            after={<Switch checked={settings.hapticEnabled} onChange={handleHapticToggle} />}
            className="cell-interactive"
          >
            Вибрация
          </Cell>
        </Section>

        <div className="section-divider" />

        <Section header="ВНЕШНИЙ ВИД (В РАЗРАБОТКЕ)">
          <Cell
            before={<Palette size={22} color="var(--tg-theme-hint-color)" />}
            after={
              <span style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color)' }}>
                Светлая
              </span>
            }
            onClick={handleLockedClick}
            className="locked-item"
            style={{ opacity: 0.5 }}
          >
            Тема
          </Cell>
        </Section>

        <div className="section-divider" />

        <Section header="ЯЗЫК (В РАЗРАБОТКЕ)">
          <Cell
            before={<Globe size={22} color="var(--tg-theme-hint-color)" />}
            after={
              <span style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color)' }}>
                Русский
              </span>
            }
            onClick={handleLockedClick}
            className="locked-item"
            style={{ opacity: 0.5 }}
          >
            Язык
          </Cell>
        </Section>

        <div className="section-divider" />

        <Section header="ЕДИНИЦЫ (В РАЗРАБОТКЕ)">
          <Cell
            before={<Weight size={22} color="var(--tg-theme-hint-color)" />}
            after={
              <span style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color)' }}>
                Килограммы
              </span>
            }
            onClick={handleLockedClick}
            className="locked-item"
            style={{ opacity: 0.5 }}
          >
            Вес
          </Cell>
        </Section>

        <div className="section-divider" />

        <Section header="ДАННЫЕ">
          <Cell
            before={<Trash2 size={22} color="var(--tg-theme-destructive-text-color)" />}
            onClick={handleLockedClick}
            className="locked-item"
            style={{ opacity: 0.5 }}
          >
            <span style={{ color: 'var(--tg-theme-destructive-text-color)' }}>Очистить историю тренировок</span>
          </Cell>
        </Section>

        <div className="section-divider" />

        <Section header="ПОДДЕРЖКА">
          <Cell
            before={<MessageCircle size={22} color="var(--tg-theme-text-color)" />}
            onClick={handleLockedClick}
            className="locked-item"
            style={{ opacity: 0.5 }}
          >
            Обратная связь
          </Cell>

          <Cell
            before={<Info size={22} color="var(--tg-theme-text-color)" />}
            after={
              <span style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color)' }}>
                v1.9.0
              </span>
            }
            onClick={handleAboutClick}
            className="cell-interactive"
          >
            О приложении
          </Cell>
        </Section>

        <div className="section-divider" />

        <Section header="КОНФИДЕНЦИАЛЬНОСТЬ (В РАЗРАБОТКЕ)">
          <Cell
            before={<Shield size={22} color="var(--tg-theme-hint-color)" />}
            after={
              <span style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color)' }}>
                Скоро
              </span>
            }
            onClick={handleLockedClick}
            className="locked-item"
            style={{ opacity: 0.5 }}
          >
            Политика конфиденциальности
          </Cell>
        </Section>
      </div>
    </>
  );
};

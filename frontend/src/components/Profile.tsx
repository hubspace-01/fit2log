import React, { useCallback } from 'react';
import { Section, Cell, Avatar, Title, Switch } from '@telegram-apps/telegram-ui';
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
    telegramService.hapticFeedback('impact', 'light');
    
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

  const handleLockedClick = useCallback(() => {
    telegramService.hapticFeedback('impact', 'light');
  }, []);

  const handleAboutClick = useCallback(() => {
    telegramService.hapticFeedback('impact', 'light');
    telegramService.showAlert('Fit2Log v1.9.0\n\nТвой персональный дневник тренировок с прогрессивной системой логирования и анализом рекордов.');
  }, []);

  const avatarLetter = user.first_name.charAt(0).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '24px', backgroundColor: 'var(--tg-theme-bg-color)' }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '40px 16px 24px',
        backgroundColor: 'var(--tg-theme-bg-color)'
      }}>
        <div
          style={{
            width: '96px',
            height: '96px',
            borderRadius: '50%',
            backgroundColor: 'var(--tg-theme-link-color)',
            color: '#FFFFFF',
            fontSize: '48px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px'
          }}
        >
          {avatarLetter}
        </div>
        
        <Title level="1" weight="2" style={{ fontSize: '28px', marginBottom: '4px', textAlign: 'center' }}>
          {user.first_name}
        </Title>
        
        {user.username && (
          <div style={{ 
            fontSize: '17px', 
            color: 'var(--tg-theme-hint-color)',
            marginBottom: '8px'
          }}>
            @{user.username}
          </div>
        )}

        <div 
          onClick={handleCopyId}
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '8px',
            backgroundColor: 'var(--tg-theme-secondary-bg-color)',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
        >
          <span style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)', fontFamily: 'monospace' }}>
            ID: {user.id}
          </span>
          <Copy size={16} color="var(--tg-theme-hint-color)" />
        </div>
      </div>

      <Section header="НАСТРОЙКИ">
        <Cell
          before={<Settings size={24} color="var(--tg-theme-text-color)" />}
          after={<Switch checked={settings.hapticEnabled} onChange={handleHapticToggle} />}
        >
          Вибрация
        </Cell>
      </Section>

      <Section header="ВНЕШНИЙ ВИД (В РАЗРАБОТКЕ)">
        <Cell
          before={<Palette size={24} color="var(--tg-theme-hint-color)" />}
          after={
            <span style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>
              Светлая
            </span>
          }
          onClick={handleLockedClick}
          style={{ opacity: 0.5 }}
        >
          Тема
        </Cell>
      </Section>

      <Section header="ЯЗЫК (В РАЗРАБОТКЕ)">
        <Cell
          before={<Globe size={24} color="var(--tg-theme-hint-color)" />}
          after={
            <span style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>
              Русский
            </span>
          }
          onClick={handleLockedClick}
          style={{ opacity: 0.5 }}
        >
          Язык
        </Cell>
      </Section>

      <Section header="ЕДИНИЦЫ (В РАЗРАБОТКЕ)">
        <Cell
          before={<Weight size={24} color="var(--tg-theme-hint-color)" />}
          after={
            <span style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>
              Килограммы
            </span>
          }
          onClick={handleLockedClick}
          style={{ opacity: 0.5 }}
        >
          Вес
        </Cell>
      </Section>

      <Section header="ДАННЫЕ">
        <Cell
          before={<Trash2 size={24} color="var(--tg-theme-destructive-text-color)" />}
          onClick={handleLockedClick}
          style={{ opacity: 0.5 }}
        >
          <span style={{ color: 'var(--tg-theme-destructive-text-color)' }}>Очистить историю тренировок</span>
        </Cell>
      </Section>

      <Section header="ПОДДЕРЖКА">
        <Cell
          before={<MessageCircle size={24} color="var(--tg-theme-text-color)" />}
          onClick={handleLockedClick}
          style={{ opacity: 0.5 }}
        >
          Обратная связь
        </Cell>

        <Cell
          before={<Info size={24} color="var(--tg-theme-text-color)" />}
          after={
            <span style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>
              v1.9.0
            </span>
          }
          onClick={handleAboutClick}
        >
          О приложении
        </Cell>
      </Section>

      <Section header="КОНФИДЕНЦИАЛЬНОСТЬ (В РАЗРАБОТКЕ)">
        <Cell
          before={<Shield size={24} color="var(--tg-theme-hint-color)" />}
          after={
            <span style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>
              Скоро
            </span>
          }
          onClick={handleLockedClick}
          style={{ opacity: 0.5 }}
        >
          Политика конфиденциальности
        </Cell>
      </Section>
    </div>
  );
};

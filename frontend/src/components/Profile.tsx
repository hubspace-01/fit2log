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
    navigator.clipboard.writeText(user.id).then(() => {
      telegramService.showAlert('ID скопирован в буфер обмена');
    });
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
    <div style={{ minHeight: '100vh', paddingBottom: '24px', backgroundColor: 'var(--tgui--bg_color)' }}>
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '40px 16px 24px',
        backgroundColor: 'var(--tgui--bg_color)'
      }}>
        <Avatar
          size={96}
          style={{
            backgroundColor: 'var(--tgui--link_color)',
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
        </Avatar>
        
        <Title level="1" weight="2" style={{ fontSize: '28px', marginBottom: '4px', textAlign: 'center' }}>
          {user.first_name}
        </Title>
        
        {user.username && (
          <div style={{ 
            fontSize: '17px', 
            color: 'var(--tgui--hint_color)',
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
            backgroundColor: 'var(--tgui--secondary_bg_color)',
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
        >
          <span style={{ fontSize: '14px', color: 'var(--tgui--hint_color)', fontFamily: 'monospace' }}>
            ID: {user.id}
          </span>
          <Copy size={16} color="var(--tgui--hint_color)" />
        </div>
      </div>

      <Section header="НАСТРОЙКИ">
        <Cell
          before={<Settings size={24} color="var(--tgui--plain_foreground)" />}
          after={<Switch checked={settings.hapticEnabled} onChange={handleHapticToggle} />}
        >
          Вибрация
        </Cell>
      </Section>

      <Section header="ВНЕШНИЙ ВИД (В РАЗРАБОТКЕ)">
        <Cell
          before={<Palette size={24} color="var(--tgui--hint_color)" />}
          after={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--tgui--hint_color)' }}>
                Светлая
              </span>
            </div>
          }
          onClick={handleLockedClick}
          style={{ opacity: 0.5 }}
        >
          Тема
        </Cell>
      </Section>

      <Section header="ЯЗЫК (В РАЗРАБОТКЕ)">
        <Cell
          before={<Globe size={24} color="var(--tgui--hint_color)" />}
          after={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--tgui--hint_color)' }}>
                Русский
              </span>
            </div>
          }
          onClick={handleLockedClick}
          style={{ opacity: 0.5 }}
        >
          Язык
        </Cell>
      </Section>

      <Section header="ЕДИНИЦЫ (В РАЗРАБОТКЕ)">
        <Cell
          before={<Weight size={24} color="var(--tgui--hint_color)" />}
          after={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--tgui--hint_color)' }}>
                Килограммы
              </span>
            </div>
          }
          onClick={handleLockedClick}
          style={{ opacity: 0.5 }}
        >
          Вес
        </Cell>
      </Section>

      <Section header="ДАННЫЕ">
        <Cell
          before={<Trash2 size={24} color="var(--tgui--destructive_text_color)" />}
          onClick={handleLockedClick}
          style={{ opacity: 0.5 }}
        >
          <span style={{ color: 'var(--tgui--destructive_text_color)' }}>Очистить историю тренировок</span>
        </Cell>
      </Section>

      <Section header="ПОДДЕРЖКА">
        <Cell
          before={<MessageCircle size={24} color="var(--tgui--plain_foreground)" />}
          onClick={handleLockedClick}
          style={{ opacity: 0.5 }}
        >
          Обратная связь
        </Cell>

        <Cell
          before={<Info size={24} color="var(--tgui--plain_foreground)" />}
          onClick={handleAboutClick}
        >
          О приложении
          <div style={{ fontSize: '14px', color: 'var(--tgui--hint_color)', marginTop: '2px' }}>
            v1.9.0
          </div>
        </Cell>
      </Section>

      <Section header="КОНФИДЕНЦИАЛЬНОСТЬ (В РАЗРАБОТКЕ)">
        <Cell
          before={<Shield size={24} color="var(--tgui--hint_color)" />}
          after={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '14px', color: 'var(--tgui--hint_color)' }}>
                Скоро
              </span>
            </div>
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

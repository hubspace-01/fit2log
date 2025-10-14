import React, { useCallback } from 'react';
import { Section, Cell, Avatar, Title, Switch } from '@telegram-apps/telegram-ui';
import { Settings, Globe, Weight, Trash2, MessageCircle, Info, Shield, ChevronRight } from 'lucide-react';
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

  const handleLockedClick = useCallback(() => {
    telegramService.hapticFeedback('impact', 'light');
  }, []);

  const handleAboutClick = useCallback(() => {
    telegramService.hapticFeedback('impact', 'light');
    telegramService.showAlert('Fit2Log v1.9.0\n\nТвой персональный дневник тренировок с прогрессивной системой логирования и анализом рекордов.');
  }, []);

  const avatarLetter = user.first_name.charAt(0).toUpperCase();

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '24px' }}>
      <div style={{ padding: '24px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Avatar
            size={48}
            style={{
              backgroundColor: 'var(--tgui--link_color)',
              color: '#FFFFFF',
              fontSize: '24px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {avatarLetter}
          </Avatar>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Title level="2" weight="2" style={{ fontSize: '22px', marginBottom: '4px' }}>
              {user.first_name} {user.last_name || ''}
            </Title>
            {user.username && (
              <div style={{ 
                fontSize: '14px', 
                color: 'var(--tgui--hint_color)' 
              }}>
                @{user.username}
              </div>
            )}
          </div>
        </div>
      </div>

      <Section header="Настройки">
        <Cell
          before={<Settings size={24} color="var(--tgui--plain_foreground)" />}
          after={<Switch checked={settings.hapticEnabled} onChange={handleHapticToggle} />}
        >
          Вибрация
        </Cell>

        <Cell
          before={<Globe size={24} color="var(--tgui--hint_color)" />}
          after={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--tgui--hint_color)' }}>
                (В РАЗРАБОТКЕ)
              </span>
              <ChevronRight size={20} color="var(--tgui--hint_color)" />
            </div>
          }
          onClick={handleLockedClick}
          style={{ opacity: 0.5 }}
        >
          Тема
        </Cell>

        <Cell
          before={<Globe size={24} color="var(--tgui--hint_color)" />}
          after={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--tgui--hint_color)' }}>
                (В РАЗРАБОТКЕ)
              </span>
              <ChevronRight size={20} color="var(--tgui--hint_color)" />
            </div>
          }
          onClick={handleLockedClick}
          style={{ opacity: 0.5 }}
        >
          Язык
        </Cell>

        <Cell
          before={<Weight size={24} color="var(--tgui--hint_color)" />}
          after={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--tgui--hint_color)' }}>
                (В РАЗРАБОТКЕ)
              </span>
              <ChevronRight size={20} color="var(--tgui--hint_color)" />
            </div>
          }
          onClick={handleLockedClick}
          style={{ opacity: 0.5 }}
        >
          Единицы измерения
        </Cell>
      </Section>

      <Section header="Данные">
        <Cell
          before={<Trash2 size={24} color="var(--tgui--hint_color)" />}
          after={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--tgui--hint_color)' }}>
                (В РАЗРАБОТКЕ)
              </span>
              <ChevronRight size={20} color="var(--tgui--hint_color)" />
            </div>
          }
          onClick={handleLockedClick}
          style={{ opacity: 0.5 }}
        >
          <span style={{ color: 'var(--tgui--hint_color)' }}>Очистить историю</span>
        </Cell>
      </Section>

      <Section header="Поддержка">
        <Cell
          before={<MessageCircle size={24} color="var(--tgui--hint_color)" />}
          after={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--tgui--hint_color)' }}>
                (В РАЗРАБОТКЕ)
              </span>
              <ChevronRight size={20} color="var(--tgui--hint_color)" />
            </div>
          }
          onClick={handleLockedClick}
          style={{ opacity: 0.5 }}
        >
          Обратная связь
        </Cell>

        <Cell
          before={<Info size={24} color="var(--tgui--plain_foreground)" />}
          after={<ChevronRight size={20} color="var(--tgui--hint_color)" />}
          onClick={handleAboutClick}
        >
          О приложении
        </Cell>
      </Section>

      <Section header="Конфиденциальность">
        <Cell
          before={<Shield size={24} color="var(--tgui--hint_color)" />}
          after={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'var(--tgui--hint_color)' }}>
                (В РАЗРАБОТКЕ)
              </span>
              <ChevronRight size={20} color="var(--tgui--hint_color)" />
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

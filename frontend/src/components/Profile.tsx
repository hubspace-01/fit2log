import React, { useEffect, useState, useCallback } from 'react';
import { Section, Cell, Title, Text, Switch } from '@telegram-apps/telegram-ui';
import { 
  Bell,
  Palette,
  Globe,
  Scale,
  Trash2,
  MessageCircle,
  Info as InfoIcon,
  Lock,
  Shield
} from 'lucide-react';
import { telegramService } from '../lib/telegram';
import { supabaseService } from '../lib/supabase';

interface ProfileProps {
  userId: string;
  userName: string;
  onBack: () => void;
}

const APP_VERSION = 'v1.9.0';
const SETTINGS_KEY = 'fit2log_settings';

interface AppSettings {
  hapticEnabled: boolean;
}

const getSettings = (): AppSettings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return { hapticEnabled: true };
    }
  }
  return { hapticEnabled: true };
};

const saveSettings = (settings: AppSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const Profile: React.FC<ProfileProps> = ({ userId, userName, onBack }) => {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    telegramService.showBackButton(onBack);
    return () => telegramService.hideBackButton();
  }, [onBack]);

  const handleHapticToggle = useCallback(() => {
    const newSettings = { ...settings, hapticEnabled: !settings.hapticEnabled };
    setSettings(newSettings);
    saveSettings(newSettings);
    
    if (newSettings.hapticEnabled) {
      telegramService.hapticFeedback('impact', 'light');
    }
  }, [settings]);

  const handleClearHistory = useCallback(async () => {
    if (settings.hapticEnabled) {
      telegramService.hapticFeedback('impact', 'medium');
    }

    const confirmed = await telegramService.showConfirm(
      'Вы уверены, что хотите удалить всю историю тренировок? Это действие нельзя отменить.'
    );

    if (confirmed) {
      try {
        setClearing(true);
        await supabaseService.clearWorkoutHistory(userId);
        
        if (settings.hapticEnabled) {
          telegramService.hapticFeedback('notification', 'success');
        }
        
        telegramService.showAlert('История тренировок успешно очищена');
      } catch (error) {
        if (settings.hapticEnabled) {
          telegramService.hapticFeedback('notification', 'error');
        }
        telegramService.showAlert('Ошибка при очистке истории');
      } finally {
        setClearing(false);
      }
    }
  }, [userId, settings.hapticEnabled]);

  const handleFeedback = useCallback(() => {
    if (settings.hapticEnabled) {
      telegramService.hapticFeedback('impact', 'light');
    }
    
    const mailtoLink = 'mailto:support@fit2log.app?subject=Обратная связь Fit2Log';
    telegramService.openTelegramLink(mailtoLink);
  }, [settings.hapticEnabled]);

  const handleAbout = useCallback(() => {
    if (settings.hapticEnabled) {
      telegramService.hapticFeedback('impact', 'light');
    }
    
    telegramService.showAlert(
      `Fit2Log ${APP_VERSION}\n\n` +
      'Приложение для отслеживания тренировок\n\n' +
      '© 2025 Fit2Log Team'
    );
  }, [settings.hapticEnabled]);

  const LockedCell: React.FC<{
    icon: React.ReactNode;
    title: string;
    subtitle: string;
  }> = ({ icon, title, subtitle }) => (
    <Cell
      before={icon}
      after={<Lock size={20} color="var(--tg-theme-hint-color)" />}
      subtitle={
        <Text style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color)' }}>
          {subtitle}
        </Text>
      }
    >
      <Text style={{ fontSize: '15px', color: 'var(--tg-theme-hint-color)' }}>
        {title}
      </Text>
    </Cell>
  );

  return (
    <div className="fade-in" style={{
      minHeight: '100vh',
      paddingBottom: '88px',
      backgroundColor: 'var(--tg-theme-bg-color)'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 16px',
        backgroundColor: 'var(--tg-theme-secondary-bg-color)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--tg-theme-link-color) 0%, var(--tg-theme-button-color) 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px',
          color: 'white',
          fontSize: '32px',
          fontWeight: '700'
        }}>
          {userName.charAt(0).toUpperCase()}
        </div>
        
        <Title level="1" weight="2" style={{ fontSize: '24px', marginBottom: '4px' }}>
          {userName}
        </Title>
        
        <Text style={{ fontSize: '14px', color: 'var(--tg-theme-hint-color)' }}>
          @{userName.toLowerCase().replace(/\s+/g, '_')}
        </Text>
      </div>

      {/* Настройки */}
      <Section header="Настройки" style={{ marginTop: '8px' }}>
        <Cell
          before={<Bell size={20} color="var(--tg-theme-link-color)" />}
          after={
            <Switch
              checked={settings.hapticEnabled}
              onChange={handleHapticToggle}
            />
          }
        >
          <Text style={{ fontSize: '15px' }}>Вибрация</Text>
        </Cell>
      </Section>

      {/* Внешний вид (в разработке) */}
      <Section header="Внешний вид (в разработке)" style={{ marginTop: '16px' }}>
        <LockedCell
          icon={<Palette size={20} color="var(--tg-theme-hint-color)" />}
          title="Тема"
          subtitle="Светлая"
        />
      </Section>

      {/* Язык (в разработке) */}
      <Section header="Язык (в разработке)" style={{ marginTop: '16px' }}>
        <LockedCell
          icon={<Globe size={20} color="var(--tg-theme-hint-color)" />}
          title="Язык"
          subtitle="Русский"
        />
      </Section>

      {/* Единицы (в разработке) */}
      <Section header="Единицы (в разработке)" style={{ marginTop: '16px' }}>
        <LockedCell
          icon={<Scale size={20} color="var(--tg-theme-hint-color)" />}
          title="Вес"
          subtitle="Килограммы"
        />
      </Section>

      {/* Данные */}
      <Section header="Данные" style={{ marginTop: '16px' }}>
        <Cell
          before={<Trash2 size={20} color="var(--tg-theme-destructive-text-color)" />}
          onClick={handleClearHistory}
          disabled={clearing}
        >
          <Text style={{ 
            fontSize: '15px',
            color: 'var(--tg-theme-destructive-text-color)'
          }}>
            {clearing ? 'Очистка...' : 'Очистить историю тренировок'}
          </Text>
        </Cell>
      </Section>

      {/* Поддержка */}
      <Section header="Поддержка" style={{ marginTop: '16px' }}>
        <Cell
          before={<MessageCircle size={20} color="var(--tg-theme-link-color)" />}
          onClick={handleFeedback}
        >
          <Text style={{ fontSize: '15px' }}>Обратная связь</Text>
        </Cell>
        
        <Cell
          before={<InfoIcon size={20} color="var(--tg-theme-link-color)" />}
          onClick={handleAbout}
          subtitle={
            <Text style={{ fontSize: '13px', color: 'var(--tg-theme-hint-color)' }}>
              {APP_VERSION}
            </Text>
          }
        >
          <Text style={{ fontSize: '15px' }}>О приложении</Text>
        </Cell>
      </Section>

      {/* Конфиденциальность (в разработке) */}
      <Section header="Конфиденциальность (в разработке)" style={{ marginTop: '16px' }}>
        <LockedCell
          icon={<Shield size={20} color="var(--tg-theme-hint-color)" />}
          title="Политика конфиденциальности"
          subtitle="Скоро"
        />
      </Section>
    </div>
  );
};

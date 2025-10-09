import type { HapticFeedbackType, HapticImpactStyle, HapticNotificationStyle } from '../types';

class TelegramService {
  private webApp: any;

  constructor() {
    this.webApp = (window as any).Telegram?.WebApp;
    if (this.webApp) {
      this.webApp.ready();
      this.webApp.expand();
      this.webApp.disableVerticalSwipes();
    }
  }

  getInitData(): string {
    return this.webApp?.initData || '';
  }

  getUserData() {
    return this.webApp?.initDataUnsafe?.user || null;
  }

  getColorScheme() {
    return this.webApp?.colorScheme || 'light';
  }

  showBackButton(onClick: () => void) {
    if (this.webApp?.BackButton) {
      this.webApp.BackButton.show();
      this.webApp.BackButton.onClick(onClick);
    }
  }

  hideBackButton() {
    if (this.webApp?.BackButton) {
      this.webApp.BackButton.hide();
    }
  }

  showAlert(message: string) {
    if (this.webApp) {
      this.webApp.showAlert(message);
    } else {
      alert(message);
    }
  }

  showConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      if (this.webApp) {
        this.webApp.showConfirm(message, (confirmed: boolean) => {
          resolve(confirmed);
        });
      } else {
        resolve(confirm(message));
      }
    });
  }

  openTelegramLink(url: string) {
    if (this.webApp) {
      this.webApp.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  }

  openLink(url: string) {
    if (this.webApp) {
      this.webApp.openLink(url);
    } else {
      window.open(url, '_blank');
    }
  }

  hapticFeedback(type: HapticFeedbackType, style?: HapticImpactStyle | HapticNotificationStyle) {
    if (!this.webApp?.HapticFeedback) return;

    try {
      if (type === 'impact' && style) {
        this.webApp.HapticFeedback.impactOccurred(style as HapticImpactStyle);
      } else if (type === 'notification' && style) {
        this.webApp.HapticFeedback.notificationOccurred(style as HapticNotificationStyle);
      } else if (type === 'selection') {
        this.webApp.HapticFeedback.selectionChanged();
      }
    } catch (error) {
      console.warn('Haptic feedback not supported:', error);
    }
  }

  close() {
    if (this.webApp) {
      this.webApp.close();
    }
  }

  isAvailable(): boolean {
    return !!this.webApp;
  }
}

export const telegramService = new TelegramService();

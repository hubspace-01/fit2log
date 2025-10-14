class TelegramService {
  private initialized = false;
  private currentBackHandler: (() => void) | null = null;
  private hapticEnabled = true;

  async init(): Promise<void> {
    if (this.initialized) return;
    
    try {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
        window.Telegram.WebApp.enableClosingConfirmation();
        window.Telegram.WebApp.disableVerticalSwipes();
        
        this.initialized = true;
      }
    } catch (error) {
      
    }
  }

  setHapticEnabled(enabled: boolean): void {
    this.hapticEnabled = enabled;
  }

  getInitData(): string {
    try {
      return window.Telegram?.WebApp?.initData || '';
    } catch (error) {
      return '';
    }
  }

  getUser(): any {
    try {
      const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
      return user;
    } catch (error) {
      return null;
    }
  }

  isInTelegram(): boolean {
    return !!(window.Telegram?.WebApp);
  }

  ready(): void {
    try {
      window.Telegram?.WebApp?.ready();
    } catch (error) {
      
    }
  }

  expand(): void {
    try {
      window.Telegram?.WebApp?.expand();
    } catch (error) {
      
    }
  }

  showMainButton(text: string, onClick: () => void): void {
    try {
      const mainButton = window.Telegram?.WebApp?.MainButton;
      if (mainButton) {
        mainButton.text = text;
        mainButton.onClick(onClick);
        mainButton.show();
      }
    } catch (error) {
      
    }
  }

  hideMainButton(): void {
    try {
      window.Telegram?.WebApp?.MainButton?.hide();
    } catch (error) {
      
    }
  }

  setMainButtonText(text: string): void {
    try {
      const mainButton = window.Telegram?.WebApp?.MainButton;
      if (mainButton) {
        mainButton.text = text;
      }
    } catch (error) {
      
    }
  }

  enableMainButton(): void {
    try {
      window.Telegram?.WebApp?.MainButton?.enable();
    } catch (error) {
      
    }
  }

  disableMainButton(): void {
    try {
      window.Telegram?.WebApp?.MainButton?.disable();
    } catch (error) {
      
    }
  }

  showBackButton(onClick: () => void): void {
    try {
      const backButton = window.Telegram?.WebApp?.BackButton;
      if (backButton) {
        if (this.currentBackHandler) {
          backButton.offClick(this.currentBackHandler);
        }
        
        this.currentBackHandler = onClick;
        backButton.onClick(onClick);
        backButton.show();
      }
    } catch (error) {
      
    }
  }

  hideBackButton(): void {
    try {
      const backButton = window.Telegram?.WebApp?.BackButton;
      if (backButton) {
        if (this.currentBackHandler) {
          backButton.offClick(this.currentBackHandler);
          this.currentBackHandler = null;
        }
        
        backButton.hide();
      }
    } catch (error) {
      
    }
  }

  showConfirm(message: string, callback: (confirmed: boolean) => void): void {
    try {
      if (window.Telegram?.WebApp?.showConfirm) {
        window.Telegram.WebApp.showConfirm(message, callback);
      } else {
        const confirmed = window.confirm(message);
        callback(confirmed);
      }
    } catch (error) {
      const confirmed = window.confirm(message);
      callback(confirmed);
    }
  }

  showAlert(message: string, callback?: () => void): void {
    try {
      if (window.Telegram?.WebApp?.showAlert) {
        window.Telegram.WebApp.showAlert(message, callback);
      } else {
        window.alert(message);
        if (callback) callback();
      }
    } catch (error) {
      window.alert(message);
      if (callback) callback();
    }
  }

  hapticFeedback(type: 'impact' | 'notification' | 'selection' = 'impact', style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'light'): void {
    if (!this.hapticEnabled) return;
    
    try {
      const haptic = window.Telegram?.WebApp?.HapticFeedback;
      if (haptic) {
        if (type === 'impact') {
          haptic.impactOccurred(style);
        } else if (type === 'notification') {
          haptic.notificationOccurred(style as 'error' | 'success' | 'warning');
        } else if (type === 'selection') {
          haptic.selectionChanged();
        }
      }
    } catch (error) {
      
    }
  }
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: any;
        ready(): void;
        expand(): void;
        close(): void;
        enableClosingConfirmation(): void;
        disableVerticalSwipes(): void;
        showConfirm(message: string, callback: (confirmed: boolean) => void): void;
        showAlert(message: string, callback?: () => void): void;
        MainButton?: {
          text: string;
          show(): void;
          hide(): void;
          enable(): void;
          disable(): void;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
        };
        BackButton?: {
          show(): void;
          hide(): void;
          onClick(callback: () => void): void;
          offClick(callback: () => void): void;
        };
        HapticFeedback?: {
          impactOccurred(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void;
          notificationOccurred(type: 'error' | 'success' | 'warning'): void;
          selectionChanged(): void;
        };
      };
    };
  }
}

export const telegramService = new TelegramService();

class TelegramService {
  private initialized = false;

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
      console.error('Telegram SDK init failed:', error);
    }
  }

  getInitData(): string {
    try {
      return window.Telegram?.WebApp?.initData || '';
    } catch (error) {
      console.error('Failed to get initData:', error);
      return '';
    }
  }

  getUser(): any {
    try {
      const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
      return user;
    } catch (error) {
      console.error('Failed to get user:', error);
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
      console.error('Ready failed:', error);
    }
  }

  expand(): void {
    try {
      window.Telegram?.WebApp?.expand();
    } catch (error) {
      console.error('Expand failed:', error);
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
      console.error('Show MainButton failed:', error);
    }
  }

  hideMainButton(): void {
    try {
      window.Telegram?.WebApp?.MainButton?.hide();
    } catch (error) {
      console.error('Hide MainButton failed:', error);
    }
  }

  setMainButtonText(text: string): void {
    try {
      const mainButton = window.Telegram?.WebApp?.MainButton;
      if (mainButton) {
        mainButton.text = text;
      }
    } catch (error) {
      console.error('Set MainButton text failed:', error);
    }
  }

  enableMainButton(): void {
    try {
      window.Telegram?.WebApp?.MainButton?.enable();
    } catch (error) {
      console.error('Enable MainButton failed:', error);
    }
  }

  disableMainButton(): void {
    try {
      window.Telegram?.WebApp?.MainButton?.disable();
    } catch (error) {
      console.error('Disable MainButton failed:', error);
    }
  }

  showBackButton(onClick: () => void): void {
    try {
      const backButton = window.Telegram?.WebApp?.BackButton;
      if (backButton) {
        backButton.onClick(onClick);
        backButton.show();
      }
    } catch (error) {
      console.error('Show BackButton failed:', error);
    }
  }

  hideBackButton(): void {
    try {
      window.Telegram?.WebApp?.BackButton?.hide();
    } catch (error) {
      console.error('Hide BackButton failed:', error);
    }
  }

  // ✅ НОВОЕ: Показать нативное подтверждение Telegram
  showConfirm(message: string, callback: (confirmed: boolean) => void): void {
    try {
      if (window.Telegram?.WebApp?.showConfirm) {
        window.Telegram.WebApp.showConfirm(message, callback);
      } else {
        // Fallback на window.confirm если Telegram API недоступен
        const confirmed = window.confirm(message);
        callback(confirmed);
      }
    } catch (error) {
      console.error('Show confirm failed:', error);
      // Fallback
      const confirmed = window.confirm(message);
      callback(confirmed);
    }
  }

  // ✅ НОВОЕ: Показать нативный alert Telegram
  showAlert(message: string, callback?: () => void): void {
    try {
      if (window.Telegram?.WebApp?.showAlert) {
        window.Telegram.WebApp.showAlert(message, callback);
      } else {
        // Fallback на window.alert
        window.alert(message);
        if (callback) callback();
      }
    } catch (error) {
      console.error('Show alert failed:', error);
      window.alert(message);
      if (callback) callback();
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
      };
    };
  }
}

export const telegramService = new TelegramService();

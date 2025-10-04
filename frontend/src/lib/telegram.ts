class TelegramService {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;
    
    try {
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
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
      console.log('Telegram user:', user);
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
      };
    };
  }
}

export const telegramService = new TelegramService();

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
    return window.Telegram?.WebApp?.initData || '';
  }

  getUser(): any {
    return window.Telegram?.WebApp?.initDataUnsafe?.user;
  }

  isInTelegram(): boolean {
    return !!(window.Telegram?.WebApp);
  }

  ready(): void {
    window.Telegram?.WebApp?.ready();
  }

  expand(): void {
    window.Telegram?.WebApp?.expand();
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

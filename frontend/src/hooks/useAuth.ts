import { useState, useEffect } from 'react';
import { telegramService } from '../lib/telegram';
import { supabaseService } from '../lib/supabase';
import type { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authenticate = async () => {
      try {
        await telegramService.init();
        const initData = telegramService.getInitData();
        
        if (!initData && !import.meta.env.DEV) {
          throw new Error('No Telegram data');
        }

        // В dev режиме используем mock данные
        if (!initData && import.meta.env.DEV) {
          setUser({
            id: '12345',
            first_name: 'Dev User',
            username: 'devuser'
          });
          setLoading(false);
          return;
        }

        const authData = await supabaseService.validateTelegramInitData(initData);
        
        if (authData.user) {
          setUser(authData.user);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Auth failed');
      } finally {
        setLoading(false);
      }
    };

    authenticate();
  }, []);

  return { user, loading, error };
};

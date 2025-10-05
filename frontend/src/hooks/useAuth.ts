import { useState, useEffect } from 'react';
import { telegramService } from '../lib/telegram';
import type { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const authenticate = async () => {
      try {
        setLoading(true);
        setError(null);

        await telegramService.init();
        
        const telegramUser = telegramService.getUser();
        
        if (telegramUser) {
          const userId = telegramUser.id.toString();
          
          // ✅ Сохраняем userId в localStorage
          localStorage.setItem('userId', userId);
          console.log('✅ UserId saved to localStorage:', userId);
          
          setUser({
            id: userId,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            username: telegramUser.username,
            language_code: telegramUser.language_code
          });
        } else {
          const testUserId = '12345';
          localStorage.setItem('userId', testUserId);
          
          setUser({
            id: testUserId,
            first_name: 'Test User',
            username: 'testuser'
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Auth error:', err);
        
        const testUserId = '12345';
        localStorage.setItem('userId', testUserId);
        
        setUser({
          id: testUserId,
          first_name: 'Test User',
          username: 'testuser'
        });
        
        setLoading(false);
      }
    };

    authenticate();
  }, []);

  return { user, loading, error };
};

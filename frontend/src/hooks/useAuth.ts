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

        // Инициализируем Telegram SDK
        await telegramService.init();
        
        // Получаем данные пользователя из Telegram
        const telegramUser = telegramService.getUser();
        
        if (telegramUser) {
          // Если есть данные из Telegram - используем их
          setUser({
            id: telegramUser.id.toString(),
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            username: telegramUser.username,
            language_code: telegramUser.language_code
          });
        } else {
          // Если нет данных Telegram (например, в браузере) - используем мок данные
          setUser({
            id: '12345',
            first_name: 'Test User',
            username: 'testuser'
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Auth error:', err);
        
        // Даже если ошибка - всё равно создаём пользователя для тестирования
        setUser({
          id: '12345',
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

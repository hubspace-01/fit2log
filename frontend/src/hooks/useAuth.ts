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
        setLoading(true);
        setError(null);

        const telegramUser = telegramService.getUserData();
        const initData = telegramService.getInitData();
        
        if (telegramUser && initData) {
          console.log('🔍 Telegram user detected, validating initData...');
          
          try {
            const validationResult = await supabaseService.validateTelegramInitData(initData);
            
            if (validationResult.ok) {
              console.log('✅ Telegram initData validated');
              
              const userId = telegramUser.id.toString();
              localStorage.setItem('userId', userId);
              
              setUser({
                id: userId,
                first_name: telegramUser.first_name,
                last_name: telegramUser.last_name,
                username: telegramUser.username,
                language_code: telegramUser.language_code
              });
            } else {
              throw new Error('Validation failed: ' + (validationResult.error || 'Unknown error'));
            }
          } catch (validationError) {
            console.error('❌ Validation error:', validationError);
            
            console.warn('⚠️ Using unvalidated Telegram user (DEV mode)');
            const userId = telegramUser.id.toString();
            localStorage.setItem('userId', userId);
            
            setUser({
              id: userId,
              first_name: telegramUser.first_name,
              last_name: telegramUser.last_name,
              username: telegramUser.username,
              language_code: telegramUser.language_code
            });
          }
        } else {
          console.warn('⚠️ No Telegram user, using test user');
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
        setError('Ошибка авторизации');
        
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

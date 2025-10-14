import React from 'react';
import { Card, Title, Caption } from '@telegram-apps/telegram-ui';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ icon, label, value, subtitle }) => {
  return (
    <Card style={{ 
      width: '100%',
      padding: '16px',
      textAlign: 'center'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'var(--tg-theme-link-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--tg-theme-button-text-color)'
        }}>
          {icon}
        </div>
        
        <Caption level="1" style={{ 
          fontSize: '13px',
          color: 'var(--tg-theme-hint-color)',
          fontWeight: '600'
        }}>
          {label}
        </Caption>
        
        <Title level="2" weight="2" style={{ 
          fontSize: '28px',
          margin: '0',
          color: 'var(--tg-theme-text-color)'
        }}>
          {value}
        </Title>
        
        {subtitle && (
          <Caption level="1" style={{ 
            fontSize: '12px',
            color: 'var(--tg-theme-hint-color)'
          }}>
            {subtitle}
          </Caption>
        )}
      </div>
    </Card>
  );
};

/**
 * CoolBarCard Component (Legacy)
 * נשמר לתאימות לאחור
 */

import React from 'react';
import { View, Text } from '@ray-js/ray';

interface CoolBarCardProps {
  title?: string;
  icon?: string;
  active?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export const CoolBarCard: React.FC<CoolBarCardProps> = ({ 
  title,
  icon,
  active,
  onClick,
  style,
  className,
  children,
  ...props 
}) => {
  return (
    <View 
      style={{
        padding: '16rpx',
        borderRadius: '16rpx',
        background: active ? 'rgba(255,107,0,0.2)' : 'rgba(255,255,255,0.1)',
        ...style
      }}
      className={className}
      onClick={onClick}
      {...props}
    >
      {icon && <Text>{icon}</Text>}
      {title && <Text>{title}</Text>}
      {children}
    </View>
  );
};

export default CoolBarCard;

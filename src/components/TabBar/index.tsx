/**
 * TabBar Component (Legacy - replaced by ModeTabs)
 * נשמר לתאימות לאחור
 */

import React from 'react';
import { View } from '@ray-js/ray';

interface TabBarProps {
  tabs?: any[];
  activeKey?: string;
  onChange?: (key: string) => void;
  [key: string]: any;
}

export const TabBar: React.FC<TabBarProps> = ({ 
  children,
  ...props 
}) => {
  // Legacy component - replaced by ModeTabs
  return <View {...props}>{children}</View>;
};

export default TabBar;

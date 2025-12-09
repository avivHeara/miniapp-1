/**
 * BottomNav Component
 * ניווט תחתון
 */

import React from 'react';
import { View, Text } from '@ray-js/ray';
import clsx from 'clsx';
import styles from './index.module.less';

// DEBUG
console.log('📱 BottomNav component loaded!');

export type NavTab = 'lights' | 'timer' | 'shabbat' | '...';

interface NavItem {
  key: NavTab;
  label: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'lights', label: 'מנורות', icon: '💡' },
  { key: 'timer', label: 'טיימר', icon: '⏱️' },
  { key: 'shabbat', label: 'שבת', icon: '🕯️' },
  { key: 'more', label: 'עוד', icon: '...' },
];

interface BottomNavProps {
  activeTab: NavTab;
  onChange: (tab: NavTab) => void;
  onMorePress?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChange,
  onMorePress
}) => {
  const handlePress = (tab: NavTab) => {
    console.log('🔴🔴🔴 BottomNav PRESSED:', tab);
    if (tab === 'more' && onMorePress) {
      onMorePress();
    } else {
      onChange(tab);
    }
  };

  return (
    <View className={styles.container}>
      {NAV_ITEMS.map((item) => (
        <View
          key={item.key}
          className={clsx(
            styles.navItem,
            activeTab === item.key && styles.navItemActive
          )}
          onClick={() => {
            console.log('🟡 onClick fired for:', item.key);
            handlePress(item.key);
          }}
          onTap={() => {
            console.log('🟡 onTap fired for:', item.key);
            handlePress(item.key);
          }}
          onTouchStart={() => {
            console.log('🟣 onTouchStart fired for:', item.key);
          }}
          onTouchEnd={() => {
            console.log('🟣 onTouchEnd fired for:', item.key);
            handlePress(item.key);
          }}
          catchTouchMove={false}
          hoverClass={styles.navItemHover}
        >
          <Text className={styles.navIcon}>{item.icon}</Text>
          <Text
            className={clsx(
              styles.navLabel,
              activeTab === item.key && styles.navLabelActive
            )}
          >
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default BottomNav;

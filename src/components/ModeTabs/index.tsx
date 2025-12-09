/**
 * ModeTabs Component
 * טאבים למעבר בין מצבי תאורה: White / Color / Scenes
 */

import React from 'react';
import { View, Text } from '@ray-js/ray';
import clsx from 'clsx';
import styles from './index.module.less';

export type LightMode = 'white' | 'colour' | 'scene';

interface ModeTab {
  key: LightMode;
  label: string;
  icon: string;
}

const MODE_TABS: ModeTab[] = [
  { key: 'white', label: 'White', icon: '💡' },
  { key: 'colour', label: 'Color', icon: '🎨' },
  { key: 'scene', label: 'Scenes', icon: '🎬' },
];

interface ModeTabsProps {
  activeMode: LightMode;
  onChange: (mode: LightMode) => void;
}

export const ModeTabs: React.FC<ModeTabsProps> = ({ activeMode, onChange }) => {
  const handlePress = (mode: LightMode) => {
    console.log('=== ModeTabs handlePress ===', mode);
    onChange(mode);
  };

  return (
    <View className={styles.container}>
      {MODE_TABS.map((mode) => (
        <View
          key={mode.key}
          className={clsx(
            styles.tab,
            activeMode === mode.key && styles.tabActive
          )}
          onTap={() => handlePress(mode.key)}
          onClick={() => handlePress(mode.key)}
          hoverClass={styles.tabHover}
        >
          <Text className={styles.tabIcon}>{mode.icon}</Text>
          <Text
            className={clsx(
              styles.tabText,
              activeMode === mode.key && styles.tabTextActive
            )}
          >
            {mode.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default ModeTabs;

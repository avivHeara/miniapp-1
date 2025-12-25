/**
 * ModeTabs Component
 * טאבים למעבר בין מצבי תאורה: White / Color / Scenes
 */

import React from 'react';
import { View, Text } from '@ray-js/ray';
import clsx from 'clsx';
import styles from './index.module.less';

export type MetaMode = 'adjustment' | 'fixed';
export type LightMode = 'white' | 'colour' | 'scene';

interface ModeTab {
    key: MetaMode;
    label: string;
    icon: string;
}

const MODE_TABS: ModeTab[] = [
    { key: 'adjustment', label: 'כיונון ויצירה', icon: '🎨' },
    { key: 'fixed', label: 'מצבים קבועים', icon: '🎬' },
];

interface ModeTabsProps {
    activeMode: string;
    onChange: (mode: MetaMode) => void;
}

export const ModeTabs: React.FC<ModeTabsProps> = ({ activeMode, onChange }) => {
    const currentMetaMode = ['white', 'colour'].includes(activeMode) ? 'adjustment' : 'fixed';

    return (
        <View className={styles.container}>
            {MODE_TABS.map((mode) => (
                <View
                    key={mode.key}
                    className={clsx(
                        styles.tab,
                        currentMetaMode === mode.key && styles.tabActive
                    )}
                    onClick={() => onChange(mode.key)}
                    // @ts-ignore
                    hoverClass={styles.tabHover}
                >
                    <Text className={styles.tabIcon}>{mode.icon}</Text>
                    <Text
                        className={clsx(
                            styles.tabText,
                            currentMetaMode === mode.key && styles.tabTextActive
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

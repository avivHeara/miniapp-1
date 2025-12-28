/**
 * ModeTabs Component
 * טאבים למעבר בין מצבי תאורה: White / Color / Scenes
 */

import React from 'react';
import { View, Text, Image } from '@ray-js/ray';
import clsx from 'clsx';
import styles from './index.module.less';

export type MetaMode = 'adjustment' | 'fixed';
export type LightMode = 'white' | 'colour' | 'scene';

interface ModeTab {
    key: MetaMode;
    label: string;
    icon: string;
}

// --- Icons as Data URLs ---
const getSvgDataUrl = (path: string, color: string) => {
    const svg = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${path}</g></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const ICONS = {
    adjustment: (color: string) => getSvgDataUrl('<path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z"/><path d="M12 8l-4 4 4 4 4-4-4-4zM8 12h8"/>', color), // Simplified palette/adjustment icon
    fixed: (color: string) => getSvgDataUrl('<path d="M22 10v6M2 10v6M12 2v20M2 10l10-8 10 8-10 8-10-8z"/>', color), // Simplified scene icon
};

const MODE_TABS: ModeTab[] = [
    { key: 'adjustment', label: 'כיונון ויצירה', icon: 'adjustment' },
    { key: 'fixed', label: 'מצבים קבועים', icon: 'fixed' },
];

interface ModeTabsProps {
    activeMode: string;
    onChange: (mode: MetaMode) => void;
}

export const ModeTabs: React.FC<ModeTabsProps> = ({ activeMode, onChange }) => {
    const currentMetaMode = ['white', 'colour'].includes(activeMode) ? 'adjustment' : 'fixed';

    return (
        <View className={styles.container}>
            {MODE_TABS.map((mode) => {
                const isActive = currentMetaMode === mode.key;
                const color = isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.5)';
                const iconFn = ICONS[mode.icon];

                return (
                    <View
                        key={mode.key}
                        className={clsx(
                            styles.tab,
                            isActive && styles.tabActive
                        )}
                        onClick={() => onChange(mode.key)}
                        // @ts-ignore
                        hoverClass={styles.tabHover}
                    >
                        {iconFn && (
                            <Image
                                src={iconFn(color)}
                                className={styles.tabIconImage}
                            />
                        )}
                        <Text
                            className={clsx(
                                styles.tabText,
                                isActive && styles.tabTextActive
                            )}
                        >
                            {mode.label}
                        </Text>
                    </View>
                );
            })}
        </View>
    );
};

export default ModeTabs;

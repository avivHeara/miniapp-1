/**
 * BottomNav Component
 * ניווט תחתון
 */

import React from 'react';
import { View, Image } from '@ray-js/ray';
import clsx from 'clsx';
import styles from './index.module.less';

export type NavTab = 'lights' | 'timer' | 'shabbat' | '...';

interface NavItem {
    key: NavTab;
    label: string;
    icon: string;
}

// --- Icons as Data URLs ---

const getSvgDataUrl = (path: string, color: string) => {
    const encodedColor = encodeURIComponent(color);
    const svg = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${path}</g></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const ICONS = {
    lights: (color: string) => getSvgDataUrl('<path d="M9 18h6M10 22h4M12 2C8.13 2 5 5.13 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.87-3.13-7-7-7zM12 6v6" />', color),
    timer: (color: string) => getSvgDataUrl('<path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 3" />', color),
    shabbat: (color: string) => getSvgDataUrl('<path d="M19 4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM16 2v4M8 2v4M3 10h18M12 14v4M10 16h4" />', color),
    more: (color: string) => getSvgDataUrl('<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 12h6" />', color),
};

const NAV_ITEMS: NavItem[] = [
    { key: 'lights', label: 'מנורות', icon: 'lights' },
    { key: 'timer', label: 'טיימר', icon: 'timer' },
    { key: 'shabbat', label: 'שבת', icon: 'shabbat' },
    { key: 'more', label: 'עוד', icon: 'more' },
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
        if (tab === 'more' && onMorePress) {
            onMorePress();
        } else {
            onChange(tab);
        }
    };

    const renderIcon = (iconKey: string, active: boolean) => {
        const color = active ? '#ff6b00' : 'rgba(255, 255, 255, 0.4)';
        const iconFn = ICONS[iconKey];
        if (!iconFn) return null;
        return <Image src={iconFn(color)} className={styles.iconImage} />;
    };

    return (
        <View className={styles.outerContainer}>
            <View className={styles.container}>
                {NAV_ITEMS.map((item) => {
                    const isActive = activeTab === item.key;
                    return (
                        <View
                            key={item.key}
                            className={clsx(
                                styles.navItem,
                                isActive && styles.navItemActive
                            )}
                            onClick={() => handlePress(item.key)}
                            onTap={() => handlePress(item.key)}
                            hoverClass={styles.navItemHover}
                            // @ts-ignore
                            aria-label={item.label}
                            role="button"
                        >
                            <View className={styles.navIcon}>
                                {renderIcon(item.icon, isActive)}
                            </View>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

export default BottomNav;

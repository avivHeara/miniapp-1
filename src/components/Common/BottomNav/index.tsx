/**
 * BottomNav Component
 * ניווט תחתון
 */

import React from 'react';
import { View, Text } from '@ray-js/ray';
import clsx from 'clsx';
import styles from './index.module.less';

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
                    onClick={() => handlePress(item.key)}
                    onTap={() => handlePress(item.key)}
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

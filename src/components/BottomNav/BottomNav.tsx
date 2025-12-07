// pages/Home/components/BottomNav.tsx
import React from 'react';
import { View, Text } from '@ray-js/ray';
import styles from '../index.module.less';
import clsx from 'clsx';

interface Props {
    onTimers: () => void;
    onShabbat: () => void;
    onSettings: () => void;
}

export const BottomNav: React.FC<Props> = ({ onTimers, onShabbat, onSettings }) => {
    return (
        <View className={styles.bottomNav}>
            <View className={clsx(styles.navItem, styles.navItemActive)}>
                <Text className={styles.navIcon}>💡</Text>
                <Text className={clsx(styles.navLabel, styles.navLabelActive)}>מנורות</Text>
            </View>
            <View className={styles.navItem} onClick={onTimers}>
                <Text className={styles.navIcon}>⏱️</Text>
                <Text className={styles.navLabel}>טיימר</Text>
            </View>
            <View className={styles.navItem} onClick={onShabbat}>
                <Text className={styles.navIcon}>🕯️</Text>
                <Text className={styles.navLabel}>שבת</Text>
            </View>
            <View className={styles.navItem} onClick={onSettings}>
                <Text className={styles.navIcon}>⚙️</Text>
                <Text className={styles.navLabel}>עוד</Text>
            </View>
        </View>
    );
};

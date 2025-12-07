// pages/Home/components/HomeHeader.tsx
import React from 'react';
import { View, Text } from '@ray-js/ray';
import styles from '../index.module.less';

interface Props {
    title: string;
    onBack: () => void;
    onEditDevices: () => void;
}

export const HomeHeader: React.FC<Props> = ({ title, onBack, onEditDevices }) => {
    return (
        <View className={styles.headerBar}>
            <View className={styles.headerBtn} onClick={onBack}>
                <Text className={styles.headerBtnText}>←</Text>
            </View>

            <View className={styles.headerCenter}>
                <Text className={styles.headerTitle}>{title}</Text>
                <View className={styles.headerEditBtn} onClick={onEditDevices}>
                    <Text className={styles.headerEditText}>✏️</Text>
                </View>
            </View>

            <View className={styles.headerBtn} style={{ opacity: 0 }}>
                <Text className={styles.headerBtnText}>←</Text>
            </View>
        </View>
    );
};

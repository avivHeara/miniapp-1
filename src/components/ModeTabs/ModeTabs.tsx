// pages/Home/components/ModeTabs.tsx
import React from 'react';
import { View, Text } from '@ray-js/ray';
import clsx from 'clsx';
import styles from '../index.module.less';

export type ModeType = 'white' | 'colour' | 'scene';

export interface ModeTab {
    key: ModeType;
    label: string;
    icon: string;
}

interface Props {
    tabs: ModeTab[];
    activeMode: ModeType;
    onChangeMode: (mode: ModeType) => void;
}

export const ModeTabs: React.FC<Props> = ({ tabs, activeMode, onChangeMode }) => {
    return (
        <View className={styles.modeTabs}>
            {tabs.map(tab => (
                <View
                    key={tab.key}
                    className={clsx(styles.modeTab, activeMode === tab.key && styles.modeTabActive)}
                    onClick={() => onChangeMode(tab.key)}
                >
                    <Text className={styles.modeTabIcon}>{tab.icon}</Text>
                    <Text
                        className={clsx(
                            styles.modeTabText,
                            activeMode === tab.key && styles.modeTabTextActive
                        )}
                    >
                        {tab.label}
                    </Text>
                </View>
            ))}
        </View>
    );
};

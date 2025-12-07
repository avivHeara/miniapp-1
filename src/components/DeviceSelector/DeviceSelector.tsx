// pages/Home/components/DeviceSelector.tsx
import React from 'react';
import { View, Text } from '@ray-js/ray';
import clsx from 'clsx';
import styles from '../index.module.less';

export interface DeviceTab {
    key: string;
    name: string;
}

interface Props {
    tabs: DeviceTab[];
    selectedIndex: number;
    onChangeDevice: (key: string) => void;
    onEditDevices: () => void;
}

export const DeviceSelector: React.FC<Props> = ({
    tabs,
    selectedIndex,
    onChangeDevice,
    onEditDevices,
}) => {
    const itemWidthPercent = 100 / tabs.length;
    const offsetPercent = selectedIndex * itemWidthPercent;

    return (
        <View className={styles.deviceSelector}>
            <View className={styles.deviceTabs}>
                <View
                    className={styles.deviceThumb}
                    style={{ width: `${itemWidthPercent}%`, left: `${offsetPercent}%` }}
                />
                {tabs.map((item, index) => (
                    <View
                        key={item.key}
                        className={styles.deviceTab}
                        onClick={() => onChangeDevice(item.key)}
                    >
                        <Text
                            className={clsx(
                                styles.deviceTabText,
                                index === selectedIndex && styles.deviceTabTextActive
                            )}
                        >
                            {item.name}
                        </Text>
                    </View>
                ))}
            </View>

            <View className={styles.editBtn} onClick={onEditDevices}>
                <Text className={styles.editBtnIcon}>✏️</Text>
                <Text className={styles.editBtnText}>Edit</Text>
            </View>
        </View>
    );
};

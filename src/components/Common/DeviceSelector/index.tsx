/**
 * DeviceSelector Component
 * בורר מנורות - תיקון RTL
 */

import React from 'react';
import { View, Text, Image } from '@ray-js/ray';
import clsx from 'clsx';
import { useProps, useActions } from '@ray-js/panel-sdk';
import styles from './index.module.less';

const DEVICE_ENUM_VALUES = ['Device1', 'Device2', 'Device3'] as const;

// --- Icons as Data URLs ---
const getSvgDataUrl = (path: string, color: string) => {
    const svg = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${path}</g></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const EDIT_ICON = (color: string) => getSvgDataUrl('<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>', color);

interface DeviceSelectorProps {
    onEditPress?: () => void;
}

export const DeviceSelector: React.FC<DeviceSelectorProps> = ({ onEditPress }) => {
    const dpActions = useActions();

    const selectedDevice = useProps(props => props.selected_device);
    const devName1 = useProps(props => props.dev_name_1);
    const devName2 = useProps(props => props.dev_name_2);
    const devName3 = useProps(props => props.dev_name_3);

    // סדר מנורות מימין לשמאל (RTL)
    const deviceTabs = React.useMemo(
        () => [
            { key: DEVICE_ENUM_VALUES[0], name: devName1 || 'מנורה 1' },
            { key: DEVICE_ENUM_VALUES[1], name: devName2 || 'מנורה 2' },
            { key: DEVICE_ENUM_VALUES[2], name: devName3 || 'מנורה 3' },
        ],
        [devName1, devName2, devName3]
    );

    const selectedIndex = React.useMemo(() => {
        if (!selectedDevice) return 0;
        const idx = DEVICE_ENUM_VALUES.indexOf(
            selectedDevice as (typeof DEVICE_ENUM_VALUES)[number]
        );
        return idx >= 0 ? idx : 0;
    }, [selectedDevice]);

    const handleChangeDevice = (key: string, index: number) => {
        if (dpActions.selected_device) {
            dpActions.selected_device.set(key, { checkRepeat: false, throttle: 300 });
        }
    };

    const handleEditPress = () => {
        if (onEditPress) {
            onEditPress();
        }
    };

    // חישוב מיקום thumb - מימין לשמאל (RTL)
    const itemWidthPercent = 100 / deviceTabs.length;
    // ב-RTL, אינדקס 0 צריך להיות מימין, אז נהפוך את החישוב
    const offsetPercent = (deviceTabs.length - 1 - selectedIndex) * itemWidthPercent;

    return (
        <View className={styles.container}>
            {/* כפתור Edit - בצד שמאל */}
            <View
                className={styles.editBtn}
                onClick={handleEditPress}
                onTap={handleEditPress}
                hoverClass={styles.editBtnHover}
            >
                <Image src={EDIT_ICON('#00e5ff')} className={styles.editIconImage} />
            </View>

            {/* טאבים - סדר RTL */}
            <View className={styles.tabs}>
                {/* Thumb - הבועה הכתומה */}
                <View
                    className={styles.thumb}
                    style={{
                        width: `${itemWidthPercent}%`,
                        right: `${offsetPercent}%`,
                    }}
                />

                {/* כפתורי המנורות - סדר הפוך ל-RTL */}
                {[...deviceTabs].reverse().map((item, displayIndex) => {
                    const actualIndex = deviceTabs.length - 1 - displayIndex;
                    return (
                        <View
                            key={item.key}
                            className={styles.tab}
                            onClick={() => handleChangeDevice(item.key, actualIndex)}
                            onTap={() => handleChangeDevice(item.key, actualIndex)}
                            hoverClass={styles.tabHover}
                        >
                            <Text
                                className={clsx(
                                    styles.tabText,
                                    actualIndex === selectedIndex && styles.tabTextActive
                                )}
                            >
                                {item.name}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View >
    );
};

export default DeviceSelector;

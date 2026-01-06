import React, { useState } from 'react';
import { View, Text, Switch, PickerView, PickerViewColumn } from '@ray-js/ray';
import styles from './CyclicControls.module.less';

interface CyclicControlsProps {
    isEnabled: boolean;
    onEnabledChange: (val: boolean) => void;
    numberOfCycles: number;
    onCyclesChange: (val: number) => void;
    offDurationMin: number;
    offDurationSec: number;
    onOffDurationChange: (m: number, s: number) => void;
}

export const CyclicControls: React.FC<CyclicControlsProps> = ({
    isEnabled, onEnabledChange,
    numberOfCycles, onCyclesChange,
    offDurationMin, offDurationSec,
    onOffDurationChange
}) => {

    return (
        <View className={styles.container}>

            {/* Header with Switch */}
            <View className={styles.header}>
                <Text className={styles.headerTitle}>טיימר מחזורי</Text>
                <Switch
                    checked={isEnabled}
                    onChange={(e) => onEnabledChange(e.detail.value)}
                    color="#4caf50"
                />
            </View>

            <View className={styles.compactRow}>
                {/* Number of Cycles Picker */}
                <View className={styles.halfSection}>
                    <Text className={styles.sectionLabel}>מספר מחזורים</Text>
                    <View className={styles.pickerContainer}>
                        <View className={styles.miniCol} style={{ width: '100%' }}>
                            <PickerView
                                value={[numberOfCycles - 1]}
                                className={styles.miniPicker}
                                style={{ width: '120rpx' }}
                                onChange={(e) => onCyclesChange(e.detail.value[0] + 1)}
                                indicatorStyle={{ height: '50rpx', border: 'none' }}
                            >
                                <PickerViewColumn>
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <View key={i} className={styles.pickerItem}>
                                            <Text className={styles.pickerText}>{i + 1}</Text>
                                        </View>
                                    ))}
                                </PickerViewColumn>
                            </PickerView>
                        </View>
                    </View>
                </View>

                {/* Delay Duration Picker - LTR for [Min] [Sec] order */}
                <View className={styles.halfSection}>
                    <Text className={styles.sectionLabel}>זמן השהייה</Text>
                    <View className={styles.pickerContainer}>
                        {/* Minutes */}
                        <View className={styles.miniCol}>
                            <Text className={styles.miniLabel}>דקות</Text>
                            <PickerView
                                value={[offDurationMin]}
                                className={styles.miniPicker}
                                onChange={(e) => onOffDurationChange(e.detail.value[0], offDurationSec)}
                                indicatorStyle={{ height: '50rpx', border: 'none' }}
                            >
                                <PickerViewColumn>
                                    {Array.from({ length: 60 }).map((_, i) => (
                                        <View key={i} className={styles.pickerItem}>
                                            <Text className={styles.pickerText}>{i}</Text>
                                        </View>
                                    ))}
                                </PickerViewColumn>
                            </PickerView>
                        </View>

                        <Text className={styles.colon}>:</Text>

                        {/* Seconds */}
                        <View className={styles.miniCol}>
                            <Text className={styles.miniLabel}>שניות</Text>
                            <PickerView
                                value={[offDurationSec]}
                                className={styles.miniPicker}
                                onChange={(e) => onOffDurationChange(offDurationMin, e.detail.value[0])}
                                indicatorStyle={{ height: '50rpx', border: 'none' }}
                            >
                                <PickerViewColumn>
                                    {Array.from({ length: 60 }).map((_, i) => (
                                        <View key={i} className={styles.pickerItem}>
                                            <Text className={styles.pickerText}>{i}</Text>
                                        </View>
                                    ))}
                                </PickerViewColumn>
                            </PickerView>
                        </View>
                    </View>
                </View>
            </View>

        </View>
    );
};

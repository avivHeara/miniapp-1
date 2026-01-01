import React from 'react';
import { View, Text, Slider, Picker } from '@ray-js/ray';
import { useProps, useActions } from '@ray-js/panel-sdk';
import styles from './index.module.less';

const LAMP_TYPES = [
    '0_None',
    '1_Start',
    '2_End',
    '3_Mid1',
    '4_Mid2',
    '5_End1',
    '6_End2',
    '7_End3',
    '8_On_Off',
    '9_Mid_Reverse',
];

const LAMP_TYPE_LABELS = [
    'ללא (None)',
    'התחלה (Start)',
    'סוף (End)',
    'אמצע 1 (Mid1)',
    'אמצע 2 (Mid2)',
    'סוף 1 (End1)',
    'סוף 2 (End2)',
    'סוף 3 (End3)',
    'הדלקה/כיבוי (On/Off)',
    'אמצע הפוך (Reverse)',
];

export const LampSettings: React.FC = () => {
    const dpState = useProps((props) => ({
        dimSpeed: props.dim_speed ?? 80,
        minDim: props.min_dim_level ?? 10,
        maxDim: props.set_max_dimming ?? 100,
        lampType: props.sp ?? '0_None',
    }));

    const actions = useActions();

    const updateDimSpeed = (e: any) => {
        const value = e.detail?.value ?? e;
        actions.dim_speed.set(value);
    };

    const updateMinDim = (e: any) => {
        const value = e.detail?.value ?? e;
        actions.min_dim_level.set(value);
    };

    const updateMaxDim = (e: any) => {
        const value = e.detail?.value ?? e;
        actions.set_max_dimming.set(value);
    };

    const updateLampType = (e: any) => {
        const index = e.detail.value;
        const value = LAMP_TYPES[index];
        actions.sp.set(value);
    };

    return (
        <View className={styles.container}>
            <Text className={styles.title}>⚙️ הגדרות ערוץ מנורה</Text>
            <View className={styles.grid}>
                {/* Dimming Speed */}
                <View className={styles.item}>
                    <Text className={styles.label}>מהירות</Text>
                    <View className={styles.sliderContainer}>
                        <Slider
                            className={styles.slider}
                            value={dpState.dimSpeed}
                            min={5}
                            max={160}
                            activeColor="#ff6b00"
                            backgroundColor="rgba(255,255,255,0.1)"
                            onAfterChange={updateDimSpeed}
                        />
                    </View>
                    <Text className={styles.value}>{dpState.dimSpeed}</Text>
                </View>

                {/* Min Dim */}
                <View className={styles.item}>
                    <Text className={styles.label}>מינימום</Text>
                    <View className={styles.sliderContainer}>
                        <Slider
                            className={styles.slider}
                            value={dpState.minDim}
                            min={0}
                            max={60}
                            activeColor="#00d9ff"
                            backgroundColor="rgba(255,255,255,0.1)"
                            onAfterChange={updateMinDim}
                        />
                    </View>
                    <Text className={styles.value}>{dpState.minDim}%</Text>
                </View>

                {/* Max Dim */}
                <View className={styles.item}>
                    <Text className={styles.label}>מקסימום</Text>
                    <View className={styles.sliderContainer}>
                        <Slider
                            className={styles.slider}
                            value={dpState.maxDim}
                            min={10}
                            max={100}
                            activeColor="#00d9ff"
                            backgroundColor="rgba(255,255,255,0.1)"
                            onAfterChange={updateMaxDim}
                        />
                    </View>
                    <Text className={styles.value}>{dpState.maxDim}%</Text>
                </View>
            </View>

            {/* Lamp Type Picker - Compact */}
            <Picker
                mode="selector"
                range={LAMP_TYPE_LABELS}
                value={LAMP_TYPES.indexOf(dpState.lampType)}
                onChange={updateLampType}
                confirm-text="אישור"
                cancel-text="ביטול"
            >
                <View className={styles.pickerBox}>
                    <Text className={styles.pickerLabel}>סוג מנורה:</Text>
                    <View className={styles.pickerValueWrapper}>
                        <Text className={styles.pickerValue}>{LAMP_TYPE_LABELS[LAMP_TYPES.indexOf(dpState.lampType)] || dpState.lampType}</Text>
                        <Text className={styles.pickerArrow}>▼</Text>
                    </View>
                </View>
            </Picker>
        </View>
    );
};

export default LampSettings;

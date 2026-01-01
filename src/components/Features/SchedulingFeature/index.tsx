/**
 * SchedulingFeature Component
 * תוכן שעון שבת לדף הבית
 */

import React, { useState } from 'react';
import { View, Text, Slider } from '@ray-js/ray';
import { useProps, useActions } from '@ray-js/panel-sdk';
import clsx from 'clsx';
import styles from './index.module.less';

interface ShabbatScene {
    id: number;
    hour: number;
    minute: number;
    level: number;
    enabled: boolean;
}

interface SchedulingFeatureProps {
    onAdvancedPress?: () => void;
}

export const SchedulingFeature: React.FC<SchedulingFeatureProps> = ({ onAdvancedPress }) => {
    const dpState = useProps((props) => ({
        shabatClock: props.shabat_clock ?? false,
        entryHour: props.shabat_entry_hour ?? 18,
        entryMin: props.shabat_entry_min ?? 0,
        exitHour: props.shabat_exit_hour ?? 20,
        exitMin: props.shabat_exit_min ?? 0,
        // Scene 0
        s0h: props.sbabat_scn0_h ?? 0,
        s0m: props.shabat_scn0_m ?? 0,
        s0l: props.shabat_scn0_level ?? 0,
        s0f: props.dhabat_scn1_fixed ?? false,
        // Scene 1
        s1h: props.shabat_scn1_h ?? 0,
        s1m: props.shabat_scn1_m ?? 0,
        s1l: props.shabat_scn1_level ?? 0,
        s1f: props.shabat_scn2_fixed ?? false,
        // Scene 2
        s2h: props.shabat_scn2_h ?? 0,
        s2m: props.shabat_scn2_m ?? 0,
        s2l: props.shabat_scn2_level ?? 0,
        s2f: props.shabat_scn3_fixed ?? false,
        // Scene 3
        s3h: props.shabat_scn3_h ?? 0,
        s3m: props.shabat_scn3_m ?? 0,
        s3l: props.shabat_scn3_level ?? 0,
        s3f: props.shabat_scn4_fixed ?? false,
        // Scene 4
        s4h: props.shabat_scn4_h ?? 0,
        s4m: props.shabat_scn4_m ?? 0,
        s4l: props.shabat_scn4_level ?? 0,
        s4f: props.shabat_scn5_fixed ?? false,
        // Scene 5
        s5h: props.shabat_scn5_h ?? 0,
        s5m: props.shabat_scn5_m ?? 0,
        s5l: props.shabat_scn5_level ?? 0,
        s5f: props.shabat_scn6_fixed ?? false,
    }));

    const actions = useActions();

    const scenes = React.useMemo(() => [
        { id: 0, hour: dpState.s0h, minute: dpState.s0m, level: dpState.s0l, enabled: dpState.s0f },
        { id: 1, hour: dpState.s1h, minute: dpState.s1m, level: dpState.s1l, enabled: dpState.s1f },
        { id: 2, hour: dpState.s2h, minute: dpState.s2m, level: dpState.s2l, enabled: dpState.s2f },
        { id: 3, hour: dpState.s3h, minute: dpState.s3m, level: dpState.s3l, enabled: dpState.s3f },
        { id: 4, hour: dpState.s4h, minute: dpState.s4m, level: dpState.s4l, enabled: dpState.s4f },
        { id: 5, hour: dpState.s5h, minute: dpState.s5m, level: dpState.s5l, enabled: dpState.s5f },
    ], [dpState]);

    const [selectedScene, setSelectedScene] = useState<number | null>(null);

    const toggleShabbatClock = () => {
        actions.shabat_clock.set(!dpState.shabatClock);
    };

    const updateSceneLevel = (id: number, level: number) => {
        const dpCode = `shabat_scn${id}_level`;
        actions[dpCode].set(level);
    };

    const formatTime = (hour: number, minute: number) => {
        return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    };

    const handleAdvancedPress = () => {
        if (onAdvancedPress) onAdvancedPress();
    };

    const handleScenePress = (sceneId: number) => {
        setSelectedScene(selectedScene === sceneId ? null : sceneId);
    };

    const saveAllData = () => {
        actions.save_shabat_data.set(true);
        showToast({ title: 'הנתונים נשמרו', icon: 'success' });
    };

    return (
        <View className={styles.container}>
            <View className={styles.header}>
                <View className={styles.headerLeft}>
                    <Text className={styles.title}>🕯️ שעון שבת</Text>
                    <Text className={styles.subtitle}>
                        כניסה {formatTime(dpState.entryHour, dpState.entryMin)} •
                        יציאה {formatTime(dpState.exitHour, dpState.exitMin)}
                    </Text>
                </View>
                <View
                    className={clsx(styles.toggle, dpState.shabatClock && styles.toggleOn)}
                    onClick={toggleShabbatClock}
                >
                    <Text className={styles.toggleText}>
                        {dpState.shabatClock ? 'פעיל' : 'כבוי'}
                    </Text>
                </View>
            </View>

            <View className={styles.scenesContainer}>
                <Text className={styles.scenesTitle}>סצנות תאורה</Text>

                {scenes.map((scene) => (
                    <View
                        key={scene.id}
                        className={clsx(
                            styles.sceneRow,
                            selectedScene === scene.id && styles.sceneRowSelected
                        )}
                        onClick={() => handleScenePress(scene.id)}
                    >
                        <View className={styles.sceneInfo}>
                            <Text className={styles.sceneTime}>
                                {formatTime(scene.hour, scene.minute)}
                            </Text>
                            <Text className={styles.sceneLabel}>סצנה {scene.id + 1}</Text>
                        </View>

                        <View className={styles.progressContainer}>
                            <View
                                className={styles.progressBar}
                                style={{ width: `${scene.level}%` }}
                            />
                        </View>

                        <Text className={styles.sceneLevel}>{scene.level}%</Text>
                    </View>
                ))}

                {selectedScene !== null && (
                    <View className={styles.sceneEditor}>
                        <Text className={styles.editorTitle}>
                            ערוך סצנה {selectedScene + 1}
                        </Text>
                        <View className={styles.sliderWrapper}>
                            <Slider
                                value={scenes[selectedScene].level}
                                min={0}
                                max={100}
                                activeColor="#ff6b00"
                                backgroundColor="rgba(255,255,255,0.1)"
                                onAfterChange={(e) => updateSceneLevel(selectedScene, e.detail.value)}
                            />
                        </View>
                        <Text className={styles.editorValue}>
                            {scenes[selectedScene].level}%
                        </Text>
                    </View>
                )}
            </View>

            <View className={styles.footerRow}>
                <View className={styles.saveBtn} onClick={saveAllData}>
                    <Text className={styles.saveBtnText}>💾 שמור נתונים</Text>
                </View>
                <View className={styles.advancedBtn} onClick={handleAdvancedPress}>
                    <Text className={styles.advancedText}>⚙️ הגדרות</Text>
                </View>
            </View>
        </View>
    );
};

export default SchedulingFeature;

import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Modal, showToast } from '@ray-js/ray';
import { useActions, useProps } from '@ray-js/panel-sdk';
import styles from './CyclicTimer.module.less';

const DAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];

export const CyclicTimer = () => {
    const { cycleTime } = useProps((props) => ({
        cycleTime: props.cycle_time || '',
    }));
    const actions = useActions();

    const [enabled, setEnabled] = useState(false);
    const [startHour, setStartHour] = useState(8);
    const [startMinute, setStartMinute] = useState(0);
    const [endHour, setEndHour] = useState(20);
    const [endMinute, setEndMinute] = useState(0);

    // Expanded duration state
    const [onDurationMin, setOnDurationMin] = useState(10);
    const [onDurationSec, setOnDurationSec] = useState(0);
    const [offDurationMin, setOffDurationMin] = useState(10);
    const [offDurationSec, setOffDurationSec] = useState(0);

    const [selectedDays, setSelectedDays] = useState<number[]>([]);

    // Picker Modal State
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'start' | 'end'>('start');
    const [tempHour, setTempHour] = useState(0);
    const [tempMinute, setTempMinute] = useState(0);

    const openTimePicker = (mode: 'start' | 'end') => {
        setPickerMode(mode);
        setTempHour(mode === 'start' ? startHour : endHour);
        setTempMinute(mode === 'start' ? startMinute : endMinute);
        setShowTimePicker(true);
    };

    const confirmTimePicker = () => {
        if (pickerMode === 'start') {
            setStartHour(tempHour);
            setStartMinute(tempMinute);
        } else {
            setEndHour(tempHour);
            setEndMinute(tempMinute);
        }
        setShowTimePicker(false);
    };

    const handleSave = () => {
        // Construct the cycle_time string
        // Placeholder logic until format is confirmed
        console.log('Saving Cyclic Timer:', {
            enabled,
            start: `${startHour}:${startMinute}`,
            end: `${endHour}:${endMinute}`,
            on: `${onDurationMin}m ${onDurationSec}s`,
            off: `${offDurationMin}m ${offDurationSec}s`,
            days: selectedDays
        });
    };

    const toggleDay = (index: number) => {
        if (selectedDays.includes(index)) {
            setSelectedDays(selectedDays.filter(d => d !== index));
        } else {
            setSelectedDays([...selectedDays, index]);
        }
    };

    return (
        <View className={styles.container}>
            {/* Enable Switch */}
            <View className={styles.header}>
                <Text className={styles.title}>טיימר מחזורי</Text>
                <Switch checked={enabled} onChange={(e) => setEnabled(e.detail.value)} color="#4caf50" />
            </View>
            <Text className={styles.description}>
                הגדרת מחזורי הדלקה וכיבוי אוטומטיים בטווח זמן מוגדר
            </Text>

            {/* Time Range */}
            <View className={styles.section}>
                <Text className={styles.sectionLabel}>טווח פעילות</Text>
                <View className={styles.row}>
                    <View className={styles.timeInput} onClick={() => openTimePicker('start')}>
                        <Text className={styles.label}>התחלה</Text>
                        <View className={styles.timeBox}>
                            <Text className={styles.timeVal}>{String(startHour).padStart(2, '0')}:{String(startMinute).padStart(2, '0')}</Text>
                        </View>
                    </View>
                    <Text className={styles.arrow}>➜</Text>
                    <View className={styles.timeInput} onClick={() => openTimePicker('end')}>
                        <Text className={styles.label}>סיום</Text>
                        <View className={styles.timeBox}>
                            <Text className={styles.timeVal}>{String(endHour).padStart(2, '0')}:{String(endMinute).padStart(2, '0')}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Cycle Duration */}
            <View className={styles.section}>
                <Text className={styles.sectionLabel}>מחזוריות</Text>

                {/* ON Duration */}
                <View className={styles.durationRow}>
                    <Text className={styles.durationLabel}>זמן דולק:</Text>
                    <View className={styles.durationControls}>
                        {/* Minutes */}
                        <View className={styles.miniControl}>
                            <Text className={styles.miniLabel}>דקות</Text>
                            <View className={styles.numberBox}>
                                <Text className={styles.controlBtn} onClick={() => setOnDurationMin(Math.max(0, onDurationMin - 1))}>-</Text>
                                <Text className={styles.value}>{onDurationMin}</Text>
                                <Text className={styles.controlBtn} onClick={() => setOnDurationMin(onDurationMin + 1)}>+</Text>
                            </View>
                        </View>
                        {/* Seconds */}
                        <View className={styles.miniControl}>
                            <Text className={styles.miniLabel}>שניות</Text>
                            <View className={styles.numberBox}>
                                <Text className={styles.controlBtn} onClick={() => setOnDurationSec(Math.max(0, onDurationSec - 1))}>-</Text>
                                <Text className={styles.value}>{onDurationSec}</Text>
                                <Text className={styles.controlBtn} onClick={() => setOnDurationSec(Math.min(59, onDurationSec + 1))}>+</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* OFF Duration */}
                <View className={styles.durationRow} style={{ marginTop: '24rpx' }}>
                    <Text className={styles.durationLabel}>זמן כבוי:</Text>
                    <View className={styles.durationControls}>
                        {/* Minutes */}
                        <View className={styles.miniControl}>
                            <Text className={styles.miniLabel}>דקות</Text>
                            <View className={styles.numberBox}>
                                <Text className={styles.controlBtn} onClick={() => setOffDurationMin(Math.max(0, offDurationMin - 1))}>-</Text>
                                <Text className={styles.value}>{offDurationMin}</Text>
                                <Text className={styles.controlBtn} onClick={() => setOffDurationMin(offDurationMin + 1)}>+</Text>
                            </View>
                        </View>
                        {/* Seconds */}
                        <View className={styles.miniControl}>
                            <Text className={styles.miniLabel}>שניות</Text>
                            <View className={styles.numberBox}>
                                <Text className={styles.controlBtn} onClick={() => setOffDurationSec(Math.max(0, offDurationSec - 1))}>-</Text>
                                <Text className={styles.value}>{offDurationSec}</Text>
                                <Text className={styles.controlBtn} onClick={() => setOffDurationSec(Math.min(59, offDurationSec + 1))}>+</Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* WeekDays */}
            <View className={styles.section}>
                <Text className={styles.sectionLabel}>חזרה בימים</Text>
                <View className={styles.daysGrid}>
                    {DAYS.map((day, i) => (
                        <View
                            key={i}
                            className={`${styles.dayItem} ${selectedDays.includes(i) ? styles.dayActive : ''}`}
                            onClick={() => toggleDay(i)}
                        >
                            <Text className={`${styles.dayText} ${selectedDays.includes(i) ? styles.textActive : ''}`}>{day}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Test Timer Button */}
            <View className={styles.debugSection}>
                <Text className={styles.debugLink} onClick={() => {
                    actions.test_timer?.set(true);
                    showToast({ title: 'בדיקת טיימר החלה', icon: 'success' });
                }}>בצע בדיקת טיימר (סימולציה מהירה)</Text>
                <Text className={styles.debugHint}>*מפעיל מחזור מקוצר לבדיקת תקינות</Text>
            </View>

            {/* Time Picker Modal Overlay */}
            {showTimePicker && (
                <View className={styles.modalOverlay}>
                    <View className={styles.modalContent}>
                        <Text className={styles.modalTitle}>{pickerMode === 'start' ? 'בחר שעת התחלה' : 'בחר שעת סיום'}</Text>
                        <View className={styles.modalPickerRow}>
                            {/* Hours */}
                            <View className={styles.pickerColumn}>
                                <Text className={styles.pickerLabel}>שעות</Text>
                                <View className={styles.pickerControls}>
                                    <Text className={styles.pickerBtn} onClick={() => setTempHour(h => (h + 1) % 24)}>▲</Text>
                                    <Text className={styles.pickerValue}>{String(tempHour).padStart(2, '0')}</Text>
                                    <Text className={styles.pickerBtn} onClick={() => setTempHour(h => (h - 1 + 24) % 24)}>▼</Text>
                                </View>
                            </View>
                            <Text className={styles.pickerDivider}>:</Text>
                            {/* Minutes */}
                            <View className={styles.pickerColumn}>
                                <Text className={styles.pickerLabel}>דקות</Text>
                                <View className={styles.pickerControls}>
                                    <Text className={styles.pickerBtn} onClick={() => setTempMinute(m => (m + 1) % 60)}>▲</Text>
                                    <Text className={styles.pickerValue}>{String(tempMinute).padStart(2, '0')}</Text>
                                    <Text className={styles.pickerBtn} onClick={() => setTempMinute(m => (m - 1 + 60) % 60)}>▼</Text>
                                </View>
                            </View>
                        </View>
                        <View className={styles.modalActions}>
                            <View className={styles.modalBtnCancel} onClick={() => setShowTimePicker(false)}>
                                <Text className={styles.modalBtnText}>ביטול</Text>
                            </View>
                            <View className={styles.modalBtnConfirm} onClick={confirmTimePicker}>
                                <Text className={styles.modalBtnText}>אישור</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}

        </View>
    );
};

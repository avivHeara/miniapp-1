import React, { useState, useEffect } from 'react';
import { View, Text, PickerView, PickerViewColumn, showToast, setStorage, getStorage, Image } from '@ray-js/ray';
import { useProps } from '@ray-js/panel-sdk';
import { devices } from '@/devices';
import { CyclicControls } from './CyclicControls';
import styles from './index.module.less';

interface Preset {
    label: string;
    h: number;
    m: number;
    s: number;
}

const DEFAULT_PRESETS: Preset[] = [
    { label: "זמן 1", h: 0, m: 15, s: 0 },
    { label: "זמן 2", h: 0, m: 30, s: 0 },
    { label: 'זמן 3', h: 1, m: 0, s: 0 },
    { label: 'זמן 4', h: 2, m: 0, s: 0 },
];

const STORAGE_KEY = 'TIMER_PRESETS_V2';

// Helper for SVG Icons
const getSvgDataUrl = (path: string, color: string) => {
    const encodedColor = encodeURIComponent(color);
    const svg = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${path}</g></svg>`;
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const ICON_ARROW = '<path d="M8 7h11M15 3l4 4-4 4M16 17H5M9 21l-4-4 4-4" />'; // Horizontal Exchange

export const TimerFeature: React.FC = () => {
    const { countdownDp, power } = useProps(props => ({
        countdownDp: props.countdown || 0,
        power: props.switch_led || false,
    }));

    // Shared State (Top Picker)
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(30);
    const [seconds, setSeconds] = useState(0);

    // Standard Mode State
    const [internalTime, setInternalTime] = useState(0);
    const [presets, setPresets] = useState<Preset[]>(DEFAULT_PRESETS);

    // Advanced Mode State
    const [isAdvanced, setIsAdvanced] = useState(false);
    const [isCyclicEnabled, setIsCyclicEnabled] = useState(false);
    const [numberOfCycles, setNumberOfCycles] = useState(1);

    // Cyclic Simulation State
    const [isCyclicRunning, setIsCyclicRunning] = useState(false);
    const [currentCycle, setCurrentCycle] = useState(1);
    const [isPhaseOn, setIsPhaseOn] = useState(true); // true = ON phase, false = OFF phase
    const [cyclicCounter, setCyclicCounter] = useState(0); // Current phase countdown

    const [offDurationMin, setOffDurationMin] = useState(0); // Default to 0m
    const [offDurationSec, setOffDurationSec] = useState(5); // Default to 5s for testing

    const hasInitializedRef = React.useRef(false);

    useEffect(() => {
        getStorage({
            key: STORAGE_KEY,
            success: (res) => {
                if (res.data) setPresets(JSON.parse(res.data));
            },
            fail: () => {
                setStorage({ key: STORAGE_KEY, data: JSON.stringify(DEFAULT_PRESETS) });
            }
        });
    }, []);

    // Standard Countdown Sync
    useEffect(() => {
        if (!isCyclicRunning) {
            setInternalTime(countdownDp);
            if (!hasInitializedRef.current || (countdownDp > 0 && internalTime === 0)) {
                if (countdownDp > 0) {
                    setHours(Math.floor(countdownDp / 3600));
                    setMinutes(Math.floor((countdownDp % 3600) / 60));
                    setSeconds(countdownDp % 60);
                }
                hasInitializedRef.current = true;
            }
        }
    }, [countdownDp, isCyclicRunning]);

    // Standard Timer Interval
    useEffect(() => {
        let timer: any;
        if (internalTime > 0 && !isCyclicRunning) {
            timer = setInterval(() => {
                setInternalTime(prev => Math.max(0, prev - 1));
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [internalTime > 0, isCyclicRunning]);

    // Cyclic Simulation Interval
    useEffect(() => {
        let interval: any;
        if (isCyclicRunning) {
            interval = setInterval(() => {
                setCyclicCounter(prev => {
                    if (prev <= 1) {
                        // Phase complete
                        if (isPhaseOn) {
                            // On Phase finished -> Switch to Off Phase
                            setIsPhaseOn(false);
                            // Set counter to Off Duration
                            return offDurationMin * 60 + offDurationSec;
                        } else {
                            // Off Phase finished -> Check cycles
                            if (currentCycle >= numberOfCycles) {
                                // All cycles done
                                setIsCyclicRunning(false);
                                showToast({ title: 'המחזוריות הסתיימה', icon: 'success' });
                                return 0;
                            } else {
                                // Next Cycle -> Switch to On Phase
                                setCurrentCycle(c => c + 1);
                                setIsPhaseOn(true);
                                // Set counter to On Duration
                                return hours * 3600 + minutes * 60 + seconds;
                            }
                        }
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isCyclicRunning, isPhaseOn, currentCycle, numberOfCycles, offDurationMin, offDurationSec, hours, minutes, seconds]);

    // Sync Device Power with Cyclic Phase
    useEffect(() => {
        if (isCyclicRunning) {
            devices.lamp.publishDps({ switch_led: isPhaseOn });
        }
    }, [isCyclicRunning, isPhaseOn]);

    const handleStartPress = () => {
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;

        if (isAdvanced && isCyclicEnabled) {
            // Cyclic Start
            const offTotal = offDurationMin * 60 + offDurationSec;
            if (totalSeconds <= 0) { showToast({ title: 'בחר זמן עבודה', icon: 'error' }); return; }
            if (offTotal <= 0) { showToast({ title: 'בחר זמן השהייה', icon: 'error' }); return; }

            setIsCyclicRunning(true);
            setCurrentCycle(1);
            setIsPhaseOn(true);
            setCyclicCounter(totalSeconds);

            console.log('Started Cyclic Logic:', { cycles: numberOfCycles, on: totalSeconds, off: offTotal });
            showToast({ title: 'מחזוריות הופעלה', icon: 'success' });
        } else {
            // Standard Start
            if (totalSeconds <= 0) {
                showToast({ title: 'בחר זמן', icon: 'error' });
                return;
            }
            const dps: any = { countdown: totalSeconds };
            if (!power) dps.switch_led = true;
            devices.lamp.publishDps(dps);
            showToast({ title: 'הטיימר הופעל', icon: 'success' });
        }
    };

    const cancelTimer = () => {
        if (isCyclicRunning) {
            setIsCyclicRunning(false);
            devices.lamp.publishDps({ switch_led: false }); // Ensure Off
            showToast({ title: 'מחזוריות בוטלה', icon: 'none' });
        } else {
            devices.lamp.publishDps({ countdown: 0 });
            setHours(0);
            setMinutes(30);
            setSeconds(0);
            showToast({ title: 'הטיימר בוטל', icon: 'none' });
        }
    };

    const updatePreset = (index: number) => {
        const newPresets = [...presets];
        newPresets[index] = { ...newPresets[index], h: hours, m: minutes, s: seconds };
        setPresets(newPresets);
        setStorage({ key: STORAGE_KEY, data: JSON.stringify(newPresets) });
        showToast({ title: 'הזמן נשמר', icon: 'success' });
    };

    const formatShortTime = (h: number, m: number, s: number) => {
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const formatFullTime = (totalSeconds: number) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    // Render Helper for Double Clock
    const renderActiveCyclic = () => {
        return (
            <View className={styles.activeWrapper}>
                <View className={styles.activeStatus} style={{ justifyContent: 'center' }}>
                    <Text className={styles.activeText}>מחזור {currentCycle} מתוך {numberOfCycles}</Text>
                </View>

                {/* Clock 1: Work */}
                <View className={styles.cyclicClockRow + ' ' + (isPhaseOn ? styles.clockActive : styles.clockInactive)}>
                    <Text className={styles.cyclicLabel}>זמן עבודה</Text>
                    <Text className={styles.cyclicTime}>
                        {isPhaseOn ? formatFullTime(cyclicCounter) : formatFullTime(hours * 3600 + minutes * 60 + seconds)}
                    </Text>
                    {isPhaseOn && <View className={styles.pulseDot} />}
                </View>

                {/* Clock 2: Delay */}
                <View className={styles.cyclicClockRow + ' ' + (!isPhaseOn ? styles.clockActive : styles.clockInactive)}>
                    <Text className={styles.cyclicLabel}>זמן השהייה</Text>
                    <Text className={styles.cyclicTime}>
                        {!isPhaseOn ? formatFullTime(cyclicCounter) : formatFullTime(offDurationMin * 60 + offDurationSec)}
                    </Text>
                    {!isPhaseOn && <View className={styles.pulseDot} style={{ background: '#ff8c42' }} />}
                </View>

                <View className={styles.btnDanger} onClick={cancelTimer} style={{ marginTop: '40rpx' }}>
                    <Text className={styles.btnText}>ביטול מחזוריות</Text>
                </View>
            </View>
        );
    };

    const isTimerActive = internalTime > 0;
    const isAnyActive = isTimerActive || isCyclicRunning;

    return (
        <View className={styles.container}>

            {/* Active View (Swap between Standard and Cyclic) */}
            <View className={`${styles.activeContainer} ${!isAnyActive ? styles.hide : ''}`}>
                {isCyclicRunning ? renderActiveCyclic() : (
                    <View className={styles.activeWrapper}>
                        <View className={styles.activeStatus}>
                            <View className={styles.pulseDot} />
                            <Text className={styles.activeText}>המנורה תכבה בעוד</Text>
                        </View>
                        <Text className={styles.largeTime}>{formatFullTime(internalTime)}</Text>
                        <View className={styles.btnDanger} onClick={cancelTimer}>
                            <Text className={styles.btnText}>ביטול טיימר</Text>
                        </View>
                    </View>
                )}
            </View>

            {/* Main Settings Wrapper */}
            <View className={`${styles.settingWrapper} ${isAnyActive ? styles.hide : ''}`}>
                <View className={styles.glassCard}>
                    {/* ... Time Selection (Unchanged) ... */}
                    <View className={styles.timeSelection}>
                        <View className={styles.controlsRow}>
                            <View className={styles.colUnit}><View className={styles.stepBtn} onClick={() => setHours(prev => Math.min(23, prev + 1))}><Text className={styles.stepText}>+</Text></View></View>
                            <View className={styles.colUnit}><View className={styles.stepBtn} onClick={() => setMinutes(prev => Math.min(59, prev + 1))}><Text className={styles.stepText}>+</Text></View></View>
                            <View className={styles.colUnit}><View className={styles.stepBtn} onClick={() => setSeconds(prev => Math.min(59, prev + 1))}><Text className={styles.stepText}>+</Text></View></View>
                        </View>
                        <View className={styles.pickerArea}>
                            <View className={styles.absDivider + ' ' + styles.left}>:</View>
                            <View className={styles.absDivider + ' ' + styles.right}>:</View>
                            <PickerView className={styles.miniPicker} value={[hours, minutes, seconds]} onChange={(e) => { setHours(e.detail.value[0]); setMinutes(e.detail.value[1]); setSeconds(e.detail.value[2]); }} indicatorStyle={{ height: '80rpx', border: 'none' }}>
                                <PickerViewColumn>{Array.from({ length: 24 }).map((_, i) => <View key={`h-${i}`} className={styles.pickerItem}><Text className={styles.pickerText}>{String(i).padStart(2, '0')}</Text></View>)}</PickerViewColumn>
                                <PickerViewColumn>{Array.from({ length: 60 }).map((_, i) => <View key={`m-${i}`} className={styles.pickerItem}><Text className={styles.pickerText}>{String(i).padStart(2, '0')}</Text></View>)}</PickerViewColumn>
                                <PickerViewColumn>{Array.from({ length: 60 }).map((_, i) => <View key={`s-${i}`} className={styles.pickerItem}><Text className={styles.pickerText}>{String(i).padStart(2, '0')}</Text></View>)}</PickerViewColumn>
                            </PickerView>
                        </View>
                        <View className={styles.controlsRow}>
                            <View className={styles.colUnit}><View className={styles.stepBtn} onClick={() => setHours(prev => Math.max(0, prev - 1))}><Text className={styles.stepText}>-</Text></View></View>
                            <View className={styles.colUnit}><View className={styles.stepBtn} onClick={() => setMinutes(prev => Math.max(0, prev - 1))}><Text className={styles.stepText}>-</Text></View></View>
                            <View className={styles.colUnit}><View className={styles.stepBtn} onClick={() => setSeconds(prev => Math.max(0, prev - 1))}><Text className={styles.stepText}>-</Text></View></View>
                        </View>
                        <View className={styles.labelsRow}>
                            <View className={styles.colUnit}><Text className={styles.colLabel}>שעות</Text></View>
                            <View className={styles.colUnit}><Text className={styles.colLabel}>דקות</Text></View>
                            <View className={styles.colUnit}><Text className={styles.colLabel}>שניות</Text></View>
                        </View>
                    </View>
                </View>

                {/* Swappable Bottom Section */}
                {!isAdvanced ? (
                    <View className={styles.presetsSection}>
                        <Text className={styles.presetsTitle}>זמנים שמורים</Text>
                        <View className={styles.presetGrid}>
                            {presets.map((preset, i) => (
                                <View key={i} className={styles.presetItem}>
                                    <View className={styles.presetMain} onClick={() => { setHours(preset.h); setMinutes(preset.m); setSeconds(preset.s); }}>
                                        <Text className={styles.presetTimeText}>{formatShortTime(preset.h, preset.m, preset.s)}</Text>
                                    </View>
                                    <View className={styles.saveActionBox} onClick={() => updatePreset(i)}>
                                        <Text className={styles.saveActionText}>{"שמור\nזמן"}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </View>
                ) : (
                    <CyclicControls
                        isEnabled={isCyclicEnabled}
                        onEnabledChange={setIsCyclicEnabled}
                        numberOfCycles={numberOfCycles}
                        onCyclesChange={setNumberOfCycles}
                        offDurationMin={offDurationMin}
                        offDurationSec={offDurationSec}
                        onOffDurationChange={(m, s) => { setOffDurationMin(m); setOffDurationSec(s); }}
                    />
                )}

                {/* Action Bar */}
                <View className={styles.actionBar}>
                    <View className={styles.switchBtn} onClick={() => setIsAdvanced(!isAdvanced)}>
                        <Image
                            src={getSvgDataUrl(ICON_ARROW, isAdvanced ? '#4caf50' : '#ffffff')}
                            className={styles.switchIcon}
                        />
                    </View>
                    <View className={styles.btnPrimary + ' ' + styles.actionStart} onClick={handleStartPress}>
                        <Text className={styles.btnActionText}>
                            {(isAdvanced && isCyclicEnabled) ? 'הפעלה מחזורית' : 'הפעלת טיימר'}
                        </Text>
                        <View className={styles.playIcon}><Text style={{ fontSize: '24rpx', color: '#fff' }}>▶</Text></View>
                    </View>
                </View>

            </View>
        </View>
    );
};

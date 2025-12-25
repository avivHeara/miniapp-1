/**
 * TimerContent Component
 * תוכן טיימר מודרני בעיצוב נקי
 * כולל כפתור הגדרות מקומי וזמנים קבועים ניתנים לעדכון
 */

import React, { useState, useEffect } from 'react';
import { View, Text, PickerView, PickerViewColumn, showToast, setStorage, getStorage } from '@ray-js/ray';
import { useProps } from '@ray-js/panel-sdk';
import { devices } from '@/devices';
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

const STORAGE_KEY = 'TIMER_PRESETS_V2'; // New key for the overhauled presets

interface TimerContentProps {
  onAdvancedPress?: () => void;
}

export const TimerContent: React.FC<TimerContentProps> = ({ onAdvancedPress }) => {
  const { countdownDp, power } = useProps(props => ({
    countdownDp: props.countdown || 0,
    power: props.switch_led || false,
  }));

  const [internalTime, setInternalTime] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [seconds, setSeconds] = useState(0);
  const [presets, setPresets] = useState<Preset[]>(DEFAULT_PRESETS);
  const hasInitializedRef = React.useRef(false);

  // Load presets
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

  // Sync with hardware
  useEffect(() => {
    setInternalTime(countdownDp);
    if (!hasInitializedRef.current || (countdownDp > 0 && internalTime === 0)) {
      if (countdownDp > 0) {
        setHours(Math.floor(countdownDp / 3600));
        setMinutes(Math.floor((countdownDp % 3600) / 60));
        setSeconds(countdownDp % 60);
      }
      hasInitializedRef.current = true;
    }
  }, [countdownDp]);

  // Ticker
  useEffect(() => {
    let timer: any;
    if (internalTime > 0) {
      timer = setInterval(() => {
        setInternalTime(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [internalTime > 0]);

  const startTimer = () => {
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;
    if (totalSeconds <= 0) {
      showToast({ title: 'בחר זמן', icon: 'error' });
      return;
    }
    const dps: any = { countdown: totalSeconds };
    if (!power) dps.switch_led = true;
    devices.lamp.publishDps(dps);
    showToast({ title: 'הטיימר הופעל', icon: 'success' });
  };

  const cancelTimer = () => {
    devices.lamp.publishDps({ countdown: 0 });
    setHours(0);
    setMinutes(30);
    setSeconds(0);
    showToast({ title: 'הטיימר בוטל', icon: 'none' });
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

  const isTimerActive = internalTime > 0;

  return (
    <View className={styles.container}>
      {/* 
        BRIDGE STABILIZER 
        Always render BOTH wrappers. Toggle visibility via CSS translate/opacity.
        This provides the 3-column PickerView the bridge demands immediately.
      */}

      {/* ACTIVE UI */}
      <View className={`${styles.activeWrapper} ${!isTimerActive ? styles.hide : ''}`}>
        <View className={styles.activeStatus}>
          <View className={styles.pulseDot} />
          <Text className={styles.activeText}>המנורה תכבה בעוד</Text>
        </View>
        <Text className={styles.largeTime}>{formatFullTime(internalTime)}</Text>
        <View className={styles.btnDanger} onClick={cancelTimer}>
          <Text className={styles.btnText}>ביטול טיימר</Text>
        </View>
      </View>

      {/* SETTING UI */}
      <View className={`${styles.settingWrapper} ${isTimerActive ? styles.hide : ''}`}>
        <View className={styles.glassCard}>
          <View className={styles.timeSelection}>
            {/* PLUS BUTTONS */}
            <View className={styles.controlsRow}>
              <View className={styles.colUnit}>
                <View className={styles.stepBtn} onClick={() => setHours(prev => Math.min(23, prev + 1))}><Text className={styles.stepText}>+</Text></View>
              </View>
              <View className={styles.colUnit}>
                <View className={styles.stepBtn} onClick={() => setMinutes(prev => Math.min(59, prev + 1))}><Text className={styles.stepText}>+</Text></View>
              </View>
              <View className={styles.colUnit}>
                <View className={styles.stepBtn} onClick={() => setSeconds(prev => Math.min(59, prev + 1))}><Text className={styles.stepText}>+</Text></View>
              </View>
            </View>

            {/* UNIFIED PICKER */}
            <View className={styles.pickerArea}>
              <View className={styles.absDivider + ' ' + styles.left}>:</View>
              <View className={styles.absDivider + ' ' + styles.right}>:</View>
              <PickerView
                className={styles.miniPicker}
                value={[hours, minutes, seconds]}
                onChange={(e) => {
                  setHours(e.detail.value[0]);
                  setMinutes(e.detail.value[1]);
                  setSeconds(e.detail.value[2]);
                }}
                indicatorStyle={{ height: '80rpx', border: 'none' }}
              >
                <PickerViewColumn>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <View key={`h-${i}`} className={styles.pickerItem}><Text className={styles.pickerText}>{String(i).padStart(2, '0')}</Text></View>
                  ))}
                </PickerViewColumn>
                <PickerViewColumn>
                  {Array.from({ length: 60 }).map((_, i) => (
                    <View key={`m-${i}`} className={styles.pickerItem}><Text className={styles.pickerText}>{String(i).padStart(2, '0')}</Text></View>
                  ))}
                </PickerViewColumn>
                <PickerViewColumn>
                  {Array.from({ length: 60 }).map((_, i) => (
                    <View key={`s-${i}`} className={styles.pickerItem}><Text className={styles.pickerText}>{String(i).padStart(2, '0')}</Text></View>
                  ))}
                </PickerViewColumn>
              </PickerView>
            </View>

            {/* MINUS BUTTONS */}
            <View className={styles.controlsRow}>
              <View className={styles.colUnit}>
                <View className={styles.stepBtn} onClick={() => setHours(prev => Math.max(0, prev - 1))}><Text className={styles.stepText}>-</Text></View>
              </View>
              <View className={styles.colUnit}>
                <View className={styles.stepBtn} onClick={() => setMinutes(prev => Math.max(0, prev - 1))}><Text className={styles.stepText}>-</Text></View>
              </View>
              <View className={styles.colUnit}>
                <View className={styles.stepBtn} onClick={() => setSeconds(prev => Math.max(0, prev - 1))}><Text className={styles.stepText}>-</Text></View>
              </View>
            </View>

            {/* LABELS */}
            <View className={styles.labelsRow}>
              <View className={styles.colUnit}><Text className={styles.colLabel}>שעות</Text></View>
              <View className={styles.colUnit}><Text className={styles.colLabel}>דקות</Text></View>
              <View className={styles.colUnit}><Text className={styles.colLabel}>שניות</Text></View>
            </View>
          </View>
        </View>

        {/* PRESETS */}
        <View className={styles.presetsSection}>
          <Text className={styles.presetsTitle}>זמנים שמורים</Text>
          <View className={styles.presetGrid}>
            {presets.map((p, i) => (
              <View key={i} className={styles.presetItem}>
                <View className={styles.presetMain} onClick={() => { setHours(p.h); setMinutes(p.m); setSeconds(p.s); }}>
                  <Text className={styles.presetTimeText}>{formatShortTime(p.h, p.m, p.s)}</Text>
                </View>
                <View className={styles.saveActionBox} onClick={() => updatePreset(i)}>
                  <Text className={styles.saveActionText}>{"שמור\nזמן"}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className={styles.btnPrimary} onClick={startTimer}>
          <Text className={styles.btnActionText}>הפעל טיימר</Text>
          <View className={styles.playIcon}><Text style={{ fontSize: '24rpx', color: '#fff' }}>▶</Text></View>
        </View>
      </View>
    </View>
  );
};

export default TimerContent;

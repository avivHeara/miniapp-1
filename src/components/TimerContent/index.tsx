/**
 * TimerContent Component
 * תוכן טיימר מהיר לדף הבית
 */

import React, { useState, useEffect } from 'react';
import { View, Text } from '@ray-js/ray';
import { useProps, useActions } from '@ray-js/panel-sdk';
import styles from './index.module.less';

interface TimerContentProps {
  onAdvancedPress?: () => void;
}

export const TimerContent: React.FC<TimerContentProps> = ({ onAdvancedPress }) => {
  const dpState = useProps((props) => ({
    countdown: props.countdown ?? 0,
  }));

  const actions = useActions();

  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (dpState.countdown > 0) {
      setHours(Math.floor(dpState.countdown / 3600));
      setMinutes(Math.floor((dpState.countdown % 3600) / 60));
      setSeconds(dpState.countdown % 60);
    }
  }, [dpState.countdown]);

  const startTimer = () => {
    console.log('=== TimerContent startTimer ===');
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    if (totalSeconds > 0 && actions.countdown) {
      actions.countdown.set(totalSeconds);
    }
  };

  const cancelTimer = () => {
    console.log('=== TimerContent cancelTimer ===');
    if (actions.countdown) {
      actions.countdown.set(0);
    }
    setHours(0);
    setMinutes(0);
    setSeconds(0);
  };

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const presets = [
    { label: '15 דק\'', h: 0, m: 15, s: 0 },
    { label: '30 דק\'', h: 0, m: 30, s: 0 },
    { label: 'שעה', h: 1, m: 0, s: 0 },
    { label: '2 שעות', h: 2, m: 0, s: 0 },
  ];

  const isTimerActive = dpState.countdown > 0;

  const handleAdvancedPress = () => {
    console.log('=== TimerContent handleAdvancedPress ===');
    if (onAdvancedPress) {
      onAdvancedPress();
    }
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <Text className={styles.title}>⏱️ טיימר כיבוי</Text>
        {isTimerActive && (
          <View className={styles.activeIndicator}>
            <Text className={styles.activeText}>פעיל</Text>
          </View>
        )}
      </View>

      {isTimerActive && (
        <View className={styles.countdownDisplay}>
          <Text className={styles.countdownLabel}>נותרו:</Text>
          <Text className={styles.countdownValue}>
            {formatTime(dpState.countdown)}
          </Text>
        </View>
      )}

      <View className={styles.timeSetters}>
        <View className={styles.timeSetter}>
          <Text 
            className={styles.setterBtn}
            onTap={() => setHours(Math.min(23, hours + 1))}
            onClick={() => setHours(Math.min(23, hours + 1))}
          >+</Text>
          <Text className={styles.setterValue}>{String(hours).padStart(2, '0')}</Text>
          <Text 
            className={styles.setterBtn}
            onTap={() => setHours(Math.max(0, hours - 1))}
            onClick={() => setHours(Math.max(0, hours - 1))}
          >-</Text>
          <Text className={styles.setterLabel}>שעות</Text>
        </View>

        <Text className={styles.timeSeparator}>:</Text>

        <View className={styles.timeSetter}>
          <Text 
            className={styles.setterBtn}
            onTap={() => setMinutes(Math.min(59, minutes + 1))}
            onClick={() => setMinutes(Math.min(59, minutes + 1))}
          >+</Text>
          <Text className={styles.setterValue}>{String(minutes).padStart(2, '0')}</Text>
          <Text 
            className={styles.setterBtn}
            onTap={() => setMinutes(Math.max(0, minutes - 1))}
            onClick={() => setMinutes(Math.max(0, minutes - 1))}
          >-</Text>
          <Text className={styles.setterLabel}>דקות</Text>
        </View>

        <Text className={styles.timeSeparator}>:</Text>

        <View className={styles.timeSetter}>
          <Text 
            className={styles.setterBtn}
            onTap={() => setSeconds(Math.min(59, seconds + 1))}
            onClick={() => setSeconds(Math.min(59, seconds + 1))}
          >+</Text>
          <Text className={styles.setterValue}>{String(seconds).padStart(2, '0')}</Text>
          <Text 
            className={styles.setterBtn}
            onTap={() => setSeconds(Math.max(0, seconds - 1))}
            onClick={() => setSeconds(Math.max(0, seconds - 1))}
          >-</Text>
          <Text className={styles.setterLabel}>שניות</Text>
        </View>
      </View>

      <View className={styles.presets}>
        {presets.map((preset, index) => (
          <View 
            key={index}
            className={styles.presetBtn}
            onTap={() => {
              console.log('=== Preset tap ===', preset.label);
              setHours(preset.h);
              setMinutes(preset.m);
              setSeconds(preset.s);
            }}
            onClick={() => {
              setHours(preset.h);
              setMinutes(preset.m);
              setSeconds(preset.s);
            }}
            hoverClass={styles.presetBtnHover}
          >
            <Text className={styles.presetText}>{preset.label}</Text>
          </View>
        ))}
      </View>

      {!isTimerActive ? (
        <View 
          className={styles.btnPrimary} 
          onTap={startTimer}
          onClick={startTimer}
          hoverClass={styles.btnHover}
        >
          <Text className={styles.btnText}>▶️ הפעל טיימר</Text>
        </View>
      ) : (
        <View 
          className={styles.btnDanger} 
          onTap={cancelTimer}
          onClick={cancelTimer}
          hoverClass={styles.btnHover}
        >
          <Text className={styles.btnText}>⏹️ בטל טיימר</Text>
        </View>
      )}

      <View 
        className={styles.advancedBtn} 
        onTap={handleAdvancedPress}
        onClick={handleAdvancedPress}
      >
        <Text className={styles.advancedText}>⚙️ הגדרות מתקדמות</Text>
      </View>
    </View>
  );
};

export default TimerContent;

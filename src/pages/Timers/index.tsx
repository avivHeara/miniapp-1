import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@ray-js/ray';
import { useProps, useActions } from '@ray-js/panel-sdk';
import styles from './index.module.less';

/**
 * Timers Page - דף טיימרים
 * - טיימר השהייה/Countdown (DP 26)
 * - טיימר מחזורי (DP 130)
 * - בדיקת טיימר (DP 152)
 */

export default function TimersPage() {
  // קבלת נתונים מהמכשיר
  const dpState = useProps((props) => ({
    countdown: props.countdown ?? 0,
    cycleTime: props.cycle_time ?? '',
  }));

  const actions = useActions();

  // State מקומי
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  // עדכון State מהמכשיר
  useEffect(() => {
    if (dpState.countdown > 0) {
      setHours(Math.floor(dpState.countdown / 3600));
      setMinutes(Math.floor((dpState.countdown % 3600) / 60));
      setSeconds(dpState.countdown % 60);
    }
  }, [dpState.countdown]);

  // הפעלת טיימר
  const startTimer = () => {
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    if (totalSeconds > 0) {
      actions.countdown.set(totalSeconds);
      console.log('Timer started:', totalSeconds, 'seconds');
    }
  };

  // ביטול טיימר
  const cancelTimer = () => {
    actions.countdown.set(0);
    setHours(0);
    setMinutes(0);
    setSeconds(0);
    console.log('Timer cancelled');
  };

  // בדיקת טיימר
  const testTimer = () => {
    actions.test_timer.set(true);
    console.log('Timer test started');
  };

  // פורמט זמן
  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // בדיקה האם הטיימר פעיל
  const isTimerActive = dpState.countdown > 0;

  return (
    <ScrollView className={styles.container} scrollY>
      {/* טיימר Countdown */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>⏱️ טיימר השהייה</Text>
        <Text className={styles.sectionDesc}>כיבוי אוטומטי אחרי זמן מוגדר</Text>

        {/* תצוגת הזמן הנותר */}
        {isTimerActive && (
          <View className={styles.countdownDisplay}>
            <Text className={styles.countdownLabel}>נותרו:</Text>
            <Text className={styles.countdownValue}>
              {formatTime(dpState.countdown)}
            </Text>
          </View>
        )}

        {/* הגדרת זמן - שעות, דקות, שניות */}
        <View className={styles.timeSetters}>
          {/* שעות */}
          <View className={styles.timeSetter}>
            <Text className={styles.setterLabel}>שעות</Text>
            <Text 
              className={styles.setterBtn}
              onClick={() => setHours(Math.min(23, hours + 1))}
            >+</Text>
            <Text className={styles.setterValue}>{String(hours).padStart(2, '0')}</Text>
            <Text 
              className={styles.setterBtn}
              onClick={() => setHours(Math.max(0, hours - 1))}
            >-</Text>
          </View>

          {/* דקות */}
          <View className={styles.timeSetter}>
            <Text className={styles.setterLabel}>דקות</Text>
            <Text 
              className={styles.setterBtn}
              onClick={() => setMinutes(Math.min(59, minutes + 1))}
            >+</Text>
            <Text className={styles.setterValue}>{String(minutes).padStart(2, '0')}</Text>
            <Text 
              className={styles.setterBtn}
              onClick={() => setMinutes(Math.max(0, minutes - 1))}
            >-</Text>
          </View>

          {/* שניות */}
          <View className={styles.timeSetter}>
            <Text className={styles.setterLabel}>שניות</Text>
            <Text 
              className={styles.setterBtn}
              onClick={() => setSeconds(Math.min(59, seconds + 1))}
            >+</Text>
            <Text className={styles.setterValue}>{String(seconds).padStart(2, '0')}</Text>
            <Text 
              className={styles.setterBtn}
              onClick={() => setSeconds(Math.max(0, seconds - 1))}
            >-</Text>
          </View>
        </View>

        {/* Quick presets */}
        <View className={styles.presets}>
          <View className={styles.presetBtn} onClick={() => { setHours(0); setMinutes(15); setSeconds(0); }}>
            <Text className={styles.presetText}>15 דק'</Text>
          </View>
          <View className={styles.presetBtn} onClick={() => { setHours(0); setMinutes(30); setSeconds(0); }}>
            <Text className={styles.presetText}>30 דק'</Text>
          </View>
          <View className={styles.presetBtn} onClick={() => { setHours(1); setMinutes(0); setSeconds(0); }}>
            <Text className={styles.presetText}>שעה</Text>
          </View>
          <View className={styles.presetBtn} onClick={() => { setHours(2); setMinutes(0); setSeconds(0); }}>
            <Text className={styles.presetText}>שעתיים</Text>
          </View>
        </View>

        {/* כפתורי פעולה */}
        <View className={styles.actions}>
          {!isTimerActive ? (
            <View className={styles.btnPrimary} onClick={startTimer}>
              <Text className={styles.btnText}>▶️ הפעל טיימר</Text>
            </View>
          ) : (
            <View className={styles.btnDanger} onClick={cancelTimer}>
              <Text className={styles.btnText}>⏹️ בטל טיימר</Text>
            </View>
          )}
        </View>
      </View>

      {/* טיימר מחזורי */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>🔄 טיימר מחזורי</Text>
        <Text className={styles.sectionDesc}>הדלקה וכיבוי במרווחים קבועים</Text>
        
        <View className={styles.comingSoon}>
          <Text className={styles.comingSoonText}>🚧 בפיתוח</Text>
        </View>
      </View>

      {/* בדיקת טיימר */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>🧪 בדיקות</Text>
        <View className={styles.btnSecondary} onClick={testTimer}>
          <Text className={styles.btnText}>בדיקת טיימר</Text>
        </View>
      </View>

      {/* Debug Info */}
      <View className={styles.debugSection}>
        <Text className={styles.debugTitle}>🔧 Debug</Text>
        <Text className={styles.debugText}>Countdown: {dpState.countdown} seconds</Text>
        <Text className={styles.debugText}>Formatted: {formatTime(dpState.countdown)}</Text>
        <Text className={styles.debugText}>Cycle Time: {dpState.cycleTime || 'N/A'}</Text>
      </View>
    </ScrollView>
  );
}

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Slider } from '@ray-js/ray';
import { useProps, useActions } from '@ray-js/panel-sdk';
import styles from './index.module.less';

/**
 * Shabbat Page - דף שעון שבת
 * - הפעלת שעון שבת (DP 151)
 * - יום שבתון (DP 162)
 * - שעות כניסה/יציאה (DP 114-117)
 * - 6 סצנות (DP 118-129, 144-149)
 */

interface ShabbatScene {
  id: number;
  hour: number;
  minute: number;
  level: number;
  enabled: boolean;
}

export default function ShabbatPage() {
  // קבלת נתונים מהמכשיר
  const dpState = useProps((props) => ({
    shabbatClock: props.shabat_clock ?? false,
    weekendDay: props.weekend_day ?? 'Friday',
    entryHour: props.shabat_entry_hour ?? 18,
    entryMinute: props.shabat_entry_minute ?? 0,
    exitHour: props.shabat_exit_hour ?? 20,
    exitMinute: props.shabat_exit_minute ?? 0,
    activeScenario: props.active_scenario ?? 0,
    orderError: props.scn_ord_err ?? false,
  }));

  const actions = useActions();

  // State מקומי לסצנות
  const [scenes, setScenes] = useState<ShabbatScene[]>([
    { id: 0, hour: 18, minute: 30, level: 100, enabled: true },
    { id: 1, hour: 19, minute: 0, level: 80, enabled: true },
    { id: 2, hour: 20, minute: 0, level: 60, enabled: true },
    { id: 3, hour: 21, minute: 0, level: 40, enabled: true },
    { id: 4, hour: 22, minute: 0, level: 20, enabled: true },
    { id: 5, hour: 23, minute: 0, level: 0, enabled: true },
  ]);

  // Toggle שעון שבת
  const toggleShabbatClock = () => {
    actions.shabat_clock.set(!dpState.shabbatClock);
  };

  // שמירת הגדרות
  const saveSettings = () => {
    actions.save_shabat_data.set(true);
    console.log('Shabbat settings saved');
  };

  // בדיקת שעון שבת
  const testShabbatClock = () => {
    actions.shabat_test_on.set(true);
    console.log('Shabbat clock test started');
  };

  // עדכון סצנה
  const updateScene = (id: number, field: keyof ShabbatScene, value: number | boolean) => {
    setScenes(prev => prev.map(scene => 
      scene.id === id ? { ...scene, [field]: value } : scene
    ));
  };

  return (
    <ScrollView className={styles.container} scrollY>
      {/* Toggle ראשי */}
      <View className={styles.mainToggle}>
        <View className={styles.toggleRow}>
          <Text className={styles.toggleLabel}>🕯️ הפעל שעון שבת</Text>
          <View 
            className={`${styles.toggle} ${dpState.shabbatClock ? styles.toggleOn : ''}`}
            onClick={toggleShabbatClock}
          >
            <Text className={styles.toggleText}>
              {dpState.shabbatClock ? 'פעיל' : 'כבוי'}
            </Text>
          </View>
        </View>
      </View>

      {/* הגדרות - מוצגות רק כשהשעון פעיל */}
      {dpState.shabbatClock && (
        <>
          {/* יום שבתון */}
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>📅 יום שבתון</Text>
            <View className={styles.daySelector}>
              <View 
                className={`${styles.dayBtn} ${dpState.weekendDay === 'Friday' ? styles.active : ''}`}
                onClick={() => actions.weekend_day.set('Friday')}
              >
                <Text className={styles.dayText}>שישי</Text>
              </View>
              <View 
                className={`${styles.dayBtn} ${dpState.weekendDay === 'Saturday' ? styles.active : ''}`}
                onClick={() => actions.weekend_day.set('Saturday')}
              >
                <Text className={styles.dayText}>שבת</Text>
              </View>
            </View>
          </View>

          {/* שעות כניסה ויציאה */}
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>⏰ שעות כניסה ויציאה</Text>
            
            <View className={styles.timeRow}>
              <Text className={styles.timeLabel}>כניסת שבת:</Text>
              <Text className={styles.timeValue}>
                {String(dpState.entryHour).padStart(2, '0')}:{String(dpState.entryMinute).padStart(2, '0')}
              </Text>
            </View>

            <View className={styles.timeRow}>
              <Text className={styles.timeLabel}>צאת שבת:</Text>
              <Text className={styles.timeValue}>
                {String(dpState.exitHour).padStart(2, '0')}:{String(dpState.exitMinute).padStart(2, '0')}
              </Text>
            </View>
          </View>

          {/* סצנות */}
          <View className={styles.section}>
            <Text className={styles.sectionTitle}>🎬 סצנות ({scenes.length})</Text>
            
            {scenes.map((scene) => (
              <View key={scene.id} className={styles.sceneCard}>
                <View className={styles.sceneHeader}>
                  <Text className={styles.sceneTitle}>סצנה {scene.id + 1}</Text>
                  <View 
                    className={`${styles.sceneToggle} ${scene.enabled ? styles.active : ''}`}
                    onClick={() => updateScene(scene.id, 'enabled', !scene.enabled)}
                  >
                    <Text className={styles.sceneToggleText}>
                      {scene.enabled ? '✓' : '✗'}
                    </Text>
                  </View>
                </View>

                {scene.enabled && (
                  <View className={styles.sceneContent}>
                    <View className={styles.sceneRow}>
                      <Text className={styles.sceneLabel}>שעה:</Text>
                      <Text className={styles.sceneValue}>
                        {String(scene.hour).padStart(2, '0')}:{String(scene.minute).padStart(2, '0')}
                      </Text>
                    </View>
                    <View className={styles.sceneRow}>
                      <Text className={styles.sceneLabel}>בהירות:</Text>
                      <Text className={styles.sceneValue}>{scene.level}%</Text>
                    </View>
                    <View className={styles.sliderWrapper}>
                      <Slider
                        value={scene.level}
                        min={0}
                        max={100}
                        activeColor="#ff6b00"
                        backgroundColor="#2a3a4a"
                        onChange={(e) => updateScene(scene.id, 'level', e.detail.value)}
                      />
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>

          {/* כפתורי פעולה */}
          <View className={styles.actions}>
            <View className={styles.btnPrimary} onClick={saveSettings}>
              <Text className={styles.btnText}>💾 שמור הגדרות</Text>
            </View>

            <View className={styles.btnSecondary} onClick={testShabbatClock}>
              <Text className={styles.btnText}>🧪 בדיקת שעון</Text>
            </View>
          </View>

          {/* סטטוס */}
          {dpState.orderError && (
            <View className={styles.errorBox}>
              <Text className={styles.errorText}>⚠️ שגיאה בסדר הסצנות - בדוק את השעות</Text>
            </View>
          )}
        </>
      )}

      {/* Debug Info */}
      <View className={styles.debugSection}>
        <Text className={styles.debugTitle}>🔧 Debug</Text>
        <Text className={styles.debugText}>Shabbat Clock: {String(dpState.shabbatClock)}</Text>
        <Text className={styles.debugText}>Weekend Day: {dpState.weekendDay}</Text>
        <Text className={styles.debugText}>Active Scenario: {dpState.activeScenario}</Text>
        <Text className={styles.debugText}>Order Error: {String(dpState.orderError)}</Text>
      </View>
    </ScrollView>
  );
}

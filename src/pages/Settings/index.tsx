import React from 'react';
import { View, Text, ScrollView, Slider, router } from '@ray-js/ray';
import { useProps, useActions } from '@ray-js/panel-sdk';
import styles from './index.module.less';

/**
 * Settings Page - דף הגדרות
 * - מהירות עמעום (DP 104)
 * - בהירות מינימלית (DP 109)
 * - בהירות מקסימלית (DP 161)
 * - תאורת לחצנים (DP 105)
 * - עדכון שעה (DP 165)
 * - מידע מכשיר (DP 101, 110, 164)
 */

export default function SettingsPage() {
  // קבלת נתונים מהמכשיר
  const dpState = useProps((props) => ({
    dimSpeed: props.dim_speed ?? 80,
    minDim: props.min_dim_level ?? 10,
    maxDim: props.set_max_dimming ?? 100,
    buttonLight: props.button_light ?? false,
    dimmerSN: props.DIMMER_SN ?? 'N/A',
    firmwareVersion: props.firmware_version ?? 'N/A',
    dimmerType: props.DT ?? 'N/A',
  }));

  const actions = useActions();

  // עדכון מהירות עמעום
  const updateDimSpeed = (e: any) => {
    const value = e.detail?.value ?? e;
    actions.dim_speed.set(value);
  };

  // עדכון בהירות מינימלית
  const updateMinDim = (e: any) => {
    const value = e.detail?.value ?? e;
    actions.min_dim_level.set(value);
  };

  // עדכון בהירות מקסימלית
  const updateMaxDim = (e: any) => {
    const value = e.detail?.value ?? e;
    actions.set_max_dimming.set(value);
  };

  // Toggle תאורת לחצנים
  const toggleButtonLight = () => {
    actions.button_light.set(!dpState.buttonLight);
  };

  // עדכון שעה
  const updateTime = () => {
    actions.update_time.set(true);
    console.log('Time update requested');
  };

  // ניווט להגדרות מתקדמות
  const goToAdvanced = () => {
    router.push('/settingsAdvanced');
  };

  return (
    <ScrollView className={styles.container} scrollY>
      {/* הגדרות עמעום */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>🎚️ הגדרות עמעום</Text>

        {/* מהירות עמעום */}
        <View className={styles.sliderGroup}>
          <View className={styles.sliderHeader}>
            <Text className={styles.sliderLabel}>מהירות עמעום</Text>
            <Text className={styles.sliderValue}>{dpState.dimSpeed}</Text>
          </View>
          <View className={styles.sliderWrapper}>
            <Slider
              value={dpState.dimSpeed}
              min={5}
              max={160}
              activeColor="#ff6b00"
              backgroundColor="#2a3a4a"
              onAfterChange={updateDimSpeed}
            />
          </View>
          <Text className={styles.sliderHint}>מהירות השינוי כשמזיזים את הסליידר</Text>
        </View>

        {/* בהירות מינימלית */}
        <View className={styles.sliderGroup}>
          <View className={styles.sliderHeader}>
            <Text className={styles.sliderLabel}>בהירות מינימלית</Text>
            <Text className={styles.sliderValue}>{dpState.minDim}%</Text>
          </View>
          <View className={styles.sliderWrapper}>
            <Slider
              value={dpState.minDim}
              min={0}
              max={60}
              activeColor="#00d9ff"
              backgroundColor="#2a3a4a"
              onAfterChange={updateMinDim}
            />
          </View>
          <Text className={styles.sliderHint}>למניעת הבהוב במנורות רגישות</Text>
        </View>

        {/* בהירות מקסימלית */}
        <View className={styles.sliderGroup}>
          <View className={styles.sliderHeader}>
            <Text className={styles.sliderLabel}>בהירות מקסימלית</Text>
            <Text className={styles.sliderValue}>{dpState.maxDim}%</Text>
          </View>
          <View className={styles.sliderWrapper}>
            <Slider
              value={dpState.maxDim}
              min={10}
              max={100}
              activeColor="#00d9ff"
              backgroundColor="#2a3a4a"
              onAfterChange={updateMaxDim}
            />
          </View>
          <Text className={styles.sliderHint}>הגבלת ההספק המקסימלי</Text>
        </View>
      </View>

      {/* תאורת לחצנים */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>💡 תאורת לחצנים</Text>
        <View className={styles.toggleRow}>
          <View>
            <Text className={styles.toggleLabel}>הפעל תאורת לחצנים</Text>
            <Text className={styles.toggleHint}>הלחצנים הפיזיים יאירו</Text>
          </View>
          <View 
            className={`${styles.toggle} ${dpState.buttonLight ? styles.toggleOn : ''}`}
            onClick={toggleButtonLight}
          >
            <Text className={styles.toggleText}>
              {dpState.buttonLight ? 'פעיל' : 'כבוי'}
            </Text>
          </View>
        </View>
      </View>

      {/* תאריך ושעה */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>🕐 תאריך ושעה</Text>
        <View className={styles.btnSecondary} onClick={updateTime}>
          <Text className={styles.btnText}>🔄 עדכן שעה מהאינטרנט</Text>
        </View>
      </View>

      {/* מידע מכשיר */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>📋 מידע מכשיר</Text>
        
        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>מספר סידורי:</Text>
          <Text className={styles.infoValue}>{dpState.dimmerSN}</Text>
        </View>

        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>גרסת קושחה:</Text>
          <Text className={styles.infoValue}>{dpState.firmwareVersion}</Text>
        </View>

        <View className={styles.infoRow}>
          <Text className={styles.infoLabel}>סוג דימר:</Text>
          <Text className={styles.infoValue}>{dpState.dimmerType}</Text>
        </View>
      </View>

      {/* הגדרות מתקדמות */}
      <View className={styles.advancedBtn} onClick={goToAdvanced}>
        <Text className={styles.advancedText}>🔧 הגדרות מתקדמות</Text>
        <Text className={styles.advancedArrow}>←</Text>
      </View>

      {/* Debug Info */}
      <View className={styles.debugSection}>
        <Text className={styles.debugTitle}>🔧 Debug</Text>
        <Text className={styles.debugText}>Dim Speed: {dpState.dimSpeed}</Text>
        <Text className={styles.debugText}>Min Dim: {dpState.minDim}</Text>
        <Text className={styles.debugText}>Max Dim: {dpState.maxDim}</Text>
        <Text className={styles.debugText}>Button Light: {String(dpState.buttonLight)}</Text>
      </View>
    </ScrollView>
  );
}

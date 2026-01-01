import React from 'react';
import { View, Text, ScrollView, Slider, router, Picker } from '@ray-js/ray';
import { useProps, useActions } from '@ray-js/panel-sdk';
import styles from './index.module.less';

/**
 * Settings Page - דף הגדרות כלליות
 * - תאורת לחצנים (DP 105)
 * - עדכון שעה (DP 165)
 * - מידע מכשיר (DP 101, 110, 164)
 */

export default function SettingsPage() {
  // קבלת נתונים מהמכשיר
  const dpState = useProps((props) => ({
    buttonLight: props.button_light ?? false,
    dimmerSN: props.DIMMER_SN ?? 'N/A',
    firmwareVersion: props.firmware_version ?? 'N/A',
    dimmerType: props.DT ?? 'N/A',
  }));

  const actions = useActions();

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
        <Text className={styles.debugText}>Button Light: {String(dpState.buttonLight)}</Text>
      </View>
    </ScrollView>
  );
}

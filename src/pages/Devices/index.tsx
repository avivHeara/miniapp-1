import React, { useState } from 'react';
import { View, Text, Input, ScrollView } from '@ray-js/ray';
import { useProps, useActions } from '@ray-js/panel-sdk';
import styles from './index.module.less';

/**
 * Devices Page - דף ניהול מכשירים
 * - עריכת שמות מנורות (DP 111-113)
 * - תאורת לחצנים (DP 105)
 * - צימוד שלטים (DP 102, 106)
 */

export default function DevicesPage() {
  // קבלת נתונים מהמכשיר
  const dpState = useProps((props) => ({
    deviceName1: props.dev_name_1 ?? 'מנורה 1',
    deviceName2: props.dev_name_2 ?? 'מנורה 2',
    deviceName3: props.dev_name_3 ?? 'מנורה 3',
    buttonLight: props.button_light ?? false,
  }));

  const actions = useActions();

  // State מקומי לעריכה
  const [name1, setName1] = useState(dpState.deviceName1);
  const [name2, setName2] = useState(dpState.deviceName2);
  const [name3, setName3] = useState(dpState.deviceName3);

  // שמירת שמות
  const saveNames = () => {
    if (name1 !== dpState.deviceName1) {
      actions.dev_name_1.set(name1);
    }
    if (name2 !== dpState.deviceName1) {
      actions.dev_name_2.set(name2);
    }
    if (name3 !== dpState.deviceName3) {
      actions.dev_name_3.set(name3);
    }
    console.log('Names saved:', { name1, name2, name3 });
  };

  // Toggle תאורת לחצנים
  const toggleButtonLight = () => {
    actions.button_light.set(!dpState.buttonLight);
  };

  // צימוד שלטים
  const startPairing = () => {
    actions.set_pairing_device.set(true);
    console.log('Started pairing mode');
  };

  const pairRemoteButton = () => {
    actions.set_remote_button.set(true);
    console.log('Pair remote button');
  };

  const clearPairing = () => {
    actions.clear_pairing.set(true);
    console.log('Cleared pairing');
  };

  return (
    <ScrollView className={styles.container} scrollY>
      {/* עריכת שמות מנורות */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>📝 שמות מנורות</Text>

        <View className={styles.inputGroup}>
          <Text className={styles.inputLabel}>מנורה 1:</Text>
          <Input
            className={styles.input}
            value={name1}
            onInput={(e) => setName1(e.detail.value)}
            placeholder="שם מנורה 1"
            maxlength={20}
          />
        </View>

        <View className={styles.inputGroup}>
          <Text className={styles.inputLabel}>מנורה 2:</Text>
          <Input
            className={styles.input}
            value={name2}
            onInput={(e) => setName2(e.detail.value)}
            placeholder="שם מנורה 2"
            maxlength={20}
          />
        </View>

        <View className={styles.inputGroup}>
          <Text className={styles.inputLabel}>מנורה 3:</Text>
          <Input
            className={styles.input}
            value={name3}
            onInput={(e) => setName3(e.detail.value)}
            placeholder="שם מנורה 3"
            maxlength={20}
          />
        </View>

        <View className={styles.btnPrimary} onClick={saveNames}>
          <Text className={styles.btnText}>💾 שמור שמות</Text>
        </View>
      </View>

      {/* תאורת לחצנים */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>💡 תאורת לחצנים</Text>
        <View className={styles.toggleRow}>
          <Text className={styles.toggleLabel}>הפעל תאורת לחצנים פיזיים</Text>
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

      {/* צימוד שלטים */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>🎮 צימוד שלטים</Text>

        <View className={styles.btnSecondary} onClick={startPairing}>
          <Text className={styles.btnText}>📡 התחל צימוד מכשיר</Text>
        </View>

        <View className={styles.btnSecondary} onClick={pairRemoteButton}>
          <Text className={styles.btnText}>🔘 צמד כפתור בודד</Text>
        </View>

        <View className={styles.btnDanger} onClick={clearPairing}>
          <Text className={styles.btnText}>🗑️ נקה צימוד</Text>
        </View>
      </View>

      {/* Debug Info */}
      <View className={styles.debugSection}>
        <Text className={styles.debugTitle}>🔧 Debug</Text>
        <Text className={styles.debugText}>Button Light: {String(dpState.buttonLight)}</Text>
      </View>
    </ScrollView>
  );
}

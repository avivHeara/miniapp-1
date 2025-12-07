import React, { useState } from 'react';
import { View, Text, ScrollView, Slider, router } from '@ray-js/ray';
import { useProps, useActions } from '@ray-js/panel-sdk';
import styles from './index.module.less';

/**
 * Settings Advanced Page - דף הגדרות מתקדמות
 * לחשמלאים ואנשי מקצוע בלבד!
 * - טמפרטורה פנימית (DP 103)
 * - נקודת התחלת עמעום (DP 107)
 * - בדיקת טיימר (DP 152)
 * - ניקוי צימוד (DP 172)
 */

export default function SettingsAdvancedPage() {
  const [showWarning, setShowWarning] = useState(true);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // קבלת נתונים מהמכשיר
  const dpState = useProps((props) => ({
    temperature: props.temperature ?? 0,
    dimmingStartPoint: props.dimming_speed ?? 0,
  }));

  const actions = useActions();

  // עדכון נקודת התחלת עמעום
  const updateDimmingStartPoint = (e: any) => {
    const value = e.detail?.value ?? e;
    actions.dimming_speed.set(value);
  };

  // בדיקת טיימר
  const testTimer = () => {
    actions.test_timer.set(true);
    console.log('Timer test started');
  };

  // בדיקת תרחיש
  const testScenario = () => {
    actions.a_test.set(true);
    console.log('Scenario test started');
  };

  // ניקוי צימוד - דורש אישור כפול!
  const clearPairing = () => {
    setShowClearConfirm(true);
  };

  const confirmClearPairing = () => {
    actions.clear_pairing.set(true);
    setShowClearConfirm(false);
    console.log('Pairing cleared!');
  };

  // חזרה
  const goBack = () => {
    router.back();
  };

  // בדיקת טמפרטורה גבוהה
  const isHighTemp = dpState.temperature > 80;

  // דיאלוג אזהרה
  if (showWarning) {
    return (
      <View className={styles.warningOverlay}>
        <View className={styles.warningDialog}>
          <Text className={styles.warningIcon}>⚠️</Text>
          <Text className={styles.warningTitle}>אזור מתקדם</Text>
          <Text className={styles.warningText}>
            אזור זה מיועד לחשמלאים ואנשי מקצוע בלבד!
          </Text>
          <Text className={styles.warningText}>
            שינויים שגויים עלולים לגרום לתקלות במכשיר.
          </Text>
          <View className={styles.warningButtons}>
            <View className={styles.btnPrimary} onClick={() => setShowWarning(false)}>
              <Text className={styles.btnText}>הבנתי, המשך</Text>
            </View>
            <View className={styles.btnSecondary} onClick={goBack}>
              <Text className={styles.btnText}>חזור</Text>
            </View>
          </View>
        </View>
      </View>
    );
  }

  return (
    <ScrollView className={styles.container} scrollY>
      {/* אזהרה */}
      <View className={styles.warningBanner}>
        <Text className={styles.warningBannerText}>⚠️ לחשמלאים בלבד</Text>
      </View>

      {/* טמפרטורה פנימית */}
      <View className={`${styles.section} ${isHighTemp ? styles.danger : ''}`}>
        <Text className={styles.sectionTitle}>🌡️ טמפרטורה פנימית</Text>
        <View className={styles.tempDisplay}>
          <Text className={`${styles.tempValue} ${isHighTemp ? styles.tempHigh : ''}`}>
            {dpState.temperature}°C
          </Text>
          {isHighTemp && (
            <Text className={styles.tempWarning}>🔥 טמפרטורה גבוהה!</Text>
          )}
        </View>
      </View>

      {/* נקודת התחלת עמעום */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>🎚️ נקודת התחלת עמעום</Text>
        <View className={styles.sliderHeader}>
          <Text className={styles.sliderLabel}>רמה ראשונית</Text>
          <Text className={styles.sliderValue}>{dpState.dimmingStartPoint}%</Text>
        </View>
        <View className={styles.sliderWrapper}>
          <Slider
            value={dpState.dimmingStartPoint}
            min={0}
            max={100}
            activeColor="#ff6b00"
            backgroundColor="#2a3a4a"
            onAfterChange={updateDimmingStartPoint}
          />
        </View>
        <Text className={styles.sliderHint}>הרמה הראשונית כשמתחיל העמעום</Text>
      </View>

      {/* בדיקות מערכת */}
      <View className={styles.section}>
        <Text className={styles.sectionTitle}>🧪 בדיקות מערכת</Text>
        
        <View className={styles.btnSecondary} onClick={testTimer}>
          <Text className={styles.btnText}>⏱️ בדיקת טיימר</Text>
        </View>

        <View className={styles.btnSecondary} onClick={testScenario}>
          <Text className={styles.btnText}>🎬 בדיקת תרחיש</Text>
        </View>
      </View>

      {/* איפוס מלא */}
      <View className={styles.dangerSection}>
        <Text className={styles.sectionTitle}>🗑️ איפוס מלא</Text>
        <Text className={styles.dangerText}>
          פעולה זו תמחק את כל השלטים המצומדים!
        </Text>
        <View className={styles.btnDanger} onClick={clearPairing}>
          <Text className={styles.btnText}>נקה כל הצימודים</Text>
        </View>
      </View>

      {/* דיאלוג אישור ניקוי */}
      {showClearConfirm && (
        <View className={styles.confirmOverlay}>
          <View className={styles.confirmDialog}>
            <Text className={styles.confirmTitle}>⚠️ אישור סופי</Text>
            <Text className={styles.confirmText}>
              האם אתה בטוח שברצונך למחוק את כל הצימודים?
            </Text>
            <Text className={styles.confirmText}>
              פעולה זו אינה ניתנת לביטול!
            </Text>
            <View className={styles.confirmButtons}>
              <View className={styles.btnDanger} onClick={confirmClearPairing}>
                <Text className={styles.btnText}>כן, מחק הכל</Text>
              </View>
              <View className={styles.btnSecondary} onClick={() => setShowClearConfirm(false)}>
                <Text className={styles.btnText}>ביטול</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Debug Info */}
      <View className={styles.debugSection}>
        <Text className={styles.debugTitle}>🔧 Debug</Text>
        <Text className={styles.debugText}>Temperature: {dpState.temperature}°C</Text>
        <Text className={styles.debugText}>Dimming Start: {dpState.dimmingStartPoint}%</Text>
      </View>
    </ScrollView>
  );
}

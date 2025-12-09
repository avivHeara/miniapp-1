/**
 * ShabbatContent Component
 * תוכן שעון שבת לדף הבית
 */

import React, { useState } from 'react';
import { View, Text, Slider } from '@ray-js/ray';
import { useProps, useActions } from '@ray-js/panel-sdk';
import clsx from 'clsx';
import styles from './index.module.less';

interface ShabbatScene {
  id: number;
  hour: number;
  minute: number;
  level: number;
  enabled: boolean;
}

interface ShabbatContentProps {
  onAdvancedPress?: () => void;
}

export const ShabbatContent: React.FC<ShabbatContentProps> = ({ onAdvancedPress }) => {
  const dpState = useProps((props) => ({
    shabbatClock: props.shabat_clock ?? false,
    entryHour: props.shabat_entry_hour ?? 18,
    entryMinute: props.shabat_entry_minute ?? 0,
    exitHour: props.shabat_exit_hour ?? 20,
    exitMinute: props.shabat_exit_minute ?? 0,
  }));

  const actions = useActions();

  const [scenes, setScenes] = useState<ShabbatScene[]>([
    { id: 0, hour: 18, minute: 30, level: 100, enabled: true },
    { id: 1, hour: 19, minute: 0, level: 80, enabled: true },
    { id: 2, hour: 20, minute: 0, level: 60, enabled: true },
    { id: 3, hour: 21, minute: 0, level: 40, enabled: true },
    { id: 4, hour: 22, minute: 0, level: 20, enabled: true },
    { id: 5, hour: 23, minute: 0, level: 0, enabled: true },
  ]);

  const [selectedScene, setSelectedScene] = useState<number | null>(null);

  const toggleShabbatClock = () => {
    console.log('=== ShabbatContent toggleShabbatClock ===');
    if (actions.shabat_clock) {
      actions.shabat_clock.set(!dpState.shabbatClock);
    }
  };

  const updateSceneLevel = (id: number, level: number) => {
    setScenes(prev => prev.map(scene => 
      scene.id === id ? { ...scene, level } : scene
    ));
  };

  const formatTime = (hour: number, minute: number) => {
    return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  const handleAdvancedPress = () => {
    console.log('=== ShabbatContent handleAdvancedPress ===');
    if (onAdvancedPress) {
      onAdvancedPress();
    }
  };

  const handleScenePress = (sceneId: number) => {
    console.log('=== ShabbatContent handleScenePress ===', sceneId);
    setSelectedScene(selectedScene === sceneId ? null : sceneId);
  };

  return (
    <View className={styles.container}>
      <View className={styles.header}>
        <View className={styles.headerLeft}>
          <Text className={styles.title}>🕯️ שעון שבת</Text>
          <Text className={styles.subtitle}>
            כניסה {formatTime(dpState.entryHour, dpState.entryMinute)} • 
            יציאה {formatTime(dpState.exitHour, dpState.exitMinute)}
          </Text>
        </View>
        <View 
          className={clsx(styles.toggle, dpState.shabbatClock && styles.toggleOn)}
          onTap={toggleShabbatClock}
          onClick={toggleShabbatClock}
          hoverClass={styles.toggleHover}
        >
          <Text className={styles.toggleText}>
            {dpState.shabbatClock ? 'פעיל' : 'כבוי'}
          </Text>
        </View>
      </View>

      {dpState.shabbatClock && (
        <View className={styles.scenesContainer}>
          <Text className={styles.scenesTitle}>סצנות תאורה</Text>
          
          {scenes.map((scene) => (
            <View 
              key={scene.id} 
              className={clsx(
                styles.sceneRow,
                selectedScene === scene.id && styles.sceneRowSelected
              )}
              onTap={() => handleScenePress(scene.id)}
              onClick={() => handleScenePress(scene.id)}
              hoverClass={styles.sceneRowHover}
            >
              <View className={styles.sceneInfo}>
                <Text className={styles.sceneTime}>
                  {formatTime(scene.hour, scene.minute)}
                </Text>
                <Text className={styles.sceneLabel}>סצנה {scene.id + 1}</Text>
              </View>
              
              <View className={styles.progressContainer}>
                <View 
                  className={styles.progressBar}
                  style={{ width: `${scene.level}%` }}
                />
              </View>
              
              <Text className={styles.sceneLevel}>{scene.level}%</Text>
            </View>
          ))}

          {selectedScene !== null && (
            <View className={styles.sceneEditor}>
              <Text className={styles.editorTitle}>
                ערוך סצנה {selectedScene + 1}
              </Text>
              <View className={styles.sliderWrapper}>
                <Slider
                  value={scenes[selectedScene].level}
                  min={0}
                  max={100}
                  activeColor="#ff6b00"
                  backgroundColor="rgba(255,255,255,0.1)"
                  onChange={(e) => updateSceneLevel(selectedScene, e.detail.value)}
                />
              </View>
              <Text className={styles.editorValue}>
                {scenes[selectedScene].level}%
              </Text>
            </View>
          )}
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

export default ShabbatContent;

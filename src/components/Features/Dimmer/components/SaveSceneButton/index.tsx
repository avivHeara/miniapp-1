import React, { useState, useRef } from 'react';
import { View, Text, Input, showToast } from '@ray-js/ray';
import { useDispatch, useSelector } from 'react-redux';
import { addScene, selectCanAddScene, selectScenesCount } from '@/redux/modules/savedScenesSlice';
import type { AppDispatch } from '@/redux';
import styles from './index.module.less';

interface DeviceInfo {
  deviceId: string;
  deviceName: string;
}

interface CurrentState {
  mode: 'white' | 'colour';
  brightness?: number;
  temperature?: number;
  hue?: number;
  saturation?: number;
  value?: number;
}

interface Props {
  currentDevice: DeviceInfo;
  allDevices: DeviceInfo[];
  currentState: CurrentState;
  style?: React.CSSProperties;
}

export const SaveSceneButton: React.FC<Props> = ({
  currentDevice,
  allDevices,
  currentState,
  style,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const canAdd = useSelector(selectCanAddScene);
  const scenesCount = useSelector(selectScenesCount);

  const [showModal, setShowModal] = useState(false);
  const [sceneName, setSceneName] = useState('');
  const [saveMode, setSaveMode] = useState<'single' | 'all'>('single');
  
  const isModalContentClick = useRef(false);

  const handleOpenModal = () => {
    if (!canAdd) {
      showToast({ 
        title: `הגעת למקסימום 6 מצבים. מחק מצב כדי להוסיף חדש.`, 
        icon: 'none' 
      });
      return;
    }
    setSceneName(`מצב ${scenesCount + 1}`);
    setSaveMode('single');
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setSceneName('');
  };

  const handleOverlayClick = () => {
    if (isModalContentClick.current) {
      isModalContentClick.current = false;
      return;
    }
    handleClose();
  };

  const handleModalContentClick = () => {
    isModalContentClick.current = true;
  };

  const handleSave = () => {
    isModalContentClick.current = true;
    
    if (!sceneName.trim()) {
      showToast({ title: 'נא להזין שם למצב', icon: 'none' });
      return;
    }

    // ✅ שמירת כל הפרמטרים - גם צבע וגם עוצמה/טמפרטורה
    const stateToSave = {
      mode: currentState.mode,
      // White params - תמיד נשמר
      brightness: currentState.brightness,
      temperature: currentState.temperature,
      // Colour params - תמיד נשמר
      hue: currentState.hue,
      saturation: currentState.saturation,
      value: currentState.value,
    };

    if (saveMode === 'single') {
      dispatch(addScene({
        name: sceneName.trim(),
        isMultiDevice: false,
        devices: [{
          deviceId: currentDevice.deviceId,
          deviceName: currentDevice.deviceName,
          ...stateToSave,
        }],
      }));
      
      console.log('💾 Saved single device scene:', {
        name: sceneName.trim(),
        device: currentDevice.deviceName,
        state: stateToSave,
      });
    } else {
      const devicesWithState = allDevices.map(device => ({
        deviceId: device.deviceId,
        deviceName: device.deviceName,
        ...stateToSave,
      }));

      dispatch(addScene({
        name: sceneName.trim(),
        isMultiDevice: true,
        devices: devicesWithState,
      }));

      console.log('💾 Saved multi-device scene:', {
        name: sceneName.trim(),
        devicesCount: allDevices.length,
        state: stateToSave,
      });
    }

    showToast({ title: `נשמר: ${sceneName}`, icon: 'success' });
    handleClose();
  };

  const handleCancelClick = () => {
    isModalContentClick.current = true;
    handleClose();
  };

  const handleInputChange = (e: any) => {
    const value = e?.detail?.value ?? e?.target?.value ?? '';
    setSceneName(value);
  };

  const handleRadioClick = (mode: 'single' | 'all') => {
    isModalContentClick.current = true;
    setSaveMode(mode);
  };

  const hasMultipleDevices = allDevices.length > 1;

  // ✅ תצוגה מקדימה של כל הפרמטרים
  const renderPreview = () => {
    const brightnessPercent = Math.round((currentState.brightness || 0) / 10);
    const saturationPercent = Math.round((currentState.saturation || 0) / 10);
    const valuePercent = Math.round((currentState.value || 0) / 10);

    return (
      <View className={styles.previewItems}>
        {/* White params */}
        <View className={styles.previewRow}>
          <Text className={styles.previewLabel}>🔆 בהירות:</Text>
          <Text className={styles.previewValue}>{brightnessPercent}%</Text>
        </View>
        <View className={styles.previewRow}>
          <Text className={styles.previewLabel}>🌡️ טמפרטורה:</Text>
          <Text className={styles.previewValue}>{currentState.temperature}</Text>
        </View>
        
        {/* Colour params */}
        <View className={styles.previewRow}>
          <Text className={styles.previewLabel}>🎨 צבע:</Text>
          <View className={styles.colorPreviewRow}>
            <View 
              className={styles.colorPreview}
              style={{ 
                background: `hsl(${currentState.hue || 0}, ${saturationPercent}%, ${Math.max(20, valuePercent / 2)}%)` 
              }}
            />
            <Text className={styles.previewValue}>
              H:{currentState.hue} S:{saturationPercent}% V:{valuePercent}%
            </Text>
          </View>
        </View>

        {/* Current mode indicator */}
        <View className={styles.previewRow}>
          <Text className={styles.previewLabel}>📍 מצב פעיל:</Text>
          <Text className={styles.previewValueActive}>
            {currentState.mode === 'colour' ? 'צבע' : 'לבן'}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <>
      {/* Save Button Bubble */}
      <View style={style} className={styles.saveButton} onClick={handleOpenModal}>
        <Text className={styles.saveIcon}>💾</Text>
      </View>

      {/* Save Modal */}
      {showModal && (
        <View className={styles.modalOverlay} onClick={handleOverlayClick}>
          <View className={styles.modalContent} onClick={handleModalContentClick}>
            {/* Header */}
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>שמירת מצב חדש</Text>
              <Text className={styles.modalSubtitle}>({scenesCount}/6 מצבים שמורים)</Text>
            </View>

            {/* Name Input */}
            <View className={styles.inputGroup}>
              <Text className={styles.inputLabel}>שם המצב:</Text>
              <Input
                className={styles.input}
                value={sceneName}
                onInput={handleInputChange}
                onFocus={() => { isModalContentClick.current = true; }}
                placeholder="הזן שם למצב..."
                maxlength={20}
              />
            </View>

            {/* Device Selection */}
            {hasMultipleDevices && (
              <View className={styles.radioGroup}>
                <Text className={styles.radioLabel}>שמור עבור:</Text>
                
                <View 
                  className={`${styles.radioOption} ${saveMode === 'single' ? styles.radioSelected : ''}`}
                  onClick={() => handleRadioClick('single')}
                >
                  <View className={styles.radioCircle}>
                    {saveMode === 'single' && <View className={styles.radioInner} />}
                  </View>
                  <Text className={styles.radioText}>
                    💡 {currentDevice.deviceName} בלבד
                  </Text>
                </View>

                <View 
                  className={`${styles.radioOption} ${saveMode === 'all' ? styles.radioSelected : ''}`}
                  onClick={() => handleRadioClick('all')}
                >
                  <View className={styles.radioCircle}>
                    {saveMode === 'all' && <View className={styles.radioInner} />}
                  </View>
                  <Text className={styles.radioText}>
                    🏠 כל המנורות ({allDevices.length})
                  </Text>
                </View>
              </View>
            )}

            {/* Preview - כל הפרמטרים */}
            <View className={styles.preview}>
              <Text className={styles.previewTitle}>מצב נוכחי לשמירה:</Text>
              {renderPreview()}
            </View>

            {/* Buttons */}
            <View className={styles.modalButtons}>
              <View className={styles.cancelButton} onClick={handleCancelClick}>
                <Text className={styles.cancelText}>ביטול</Text>
              </View>
              <View className={styles.confirmButton} onClick={handleSave}>
                <Text className={styles.confirmText}>שמור</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </>
  );
};

export default SaveSceneButton;

import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, showToast, Input, chooseImage, getFileSystemManager } from '@ray-js/ray';
import { useDispatch, useSelector } from 'react-redux';
import { useProps, utils } from '@ray-js/panel-sdk';
import clsx from 'clsx';
import {
    SavedScene,
    SavedDeviceState,
    updateScene,
    setEditingScene,
    selectSceneById
} from '@/redux/modules/savedScenesSlice';
import { White } from '../../White';
import { Colour } from '../../Colour';
import { lampSchemaMap } from '@/devices/schema';
import styles from './index.module.less';

interface Props {
    sceneId: string;
    onClose: () => void;
    onRelease: (code: string, value: any) => void;
    onReleaseWhite: (cmd: any) => void;
}

export const SceneEditor: React.FC<Props> = ({ sceneId, onClose, onRelease, onReleaseWhite }) => {
    const dispatch = useDispatch();
    const originalScene = useSelector(state => selectSceneById(state, sceneId));

    const [scene, setScene] = useState<SavedScene | null>(originalScene || null);
    const [mainTab, setMainTab] = useState<'general' | 'dimmer'>('dimmer'); // ברירת מחדל לדימור לפי בקשת המשתמש
    const [dimmerType, setDimmerType] = useState<'dimming' | 'intensity' | 'color'>('intensity');
    const [selectedDeviceId, setSelectedDeviceId] = useState<string>('Device2');

    const devNames = {
        Device1: useProps(p => p.dev_name_1) || 'מנורה 1',
        Device2: useProps(p => p.dev_name_2) || 'מנורה 2',
        Device3: useProps(p => p.dev_name_3) || 'מנורה 3',
    };

    if (!scene) return null;

    const currentDeviceState = scene.devices.find(d => d.deviceId === selectedDeviceId) || {
        deviceId: selectedDeviceId,
        deviceName: devNames[selectedDeviceId],
        mode: 'white',
        brightness: 1000,
        temperature: 500
    };

    const handleToggleDevice = (id: string) => {
        const exists = scene.devices.find(d => d.deviceId === id);
        if (exists) {
            if (scene.devices.length > 1) {
                setScene({ ...scene, devices: scene.devices.filter(d => d.deviceId !== id) });
                if (selectedDeviceId === id) setSelectedDeviceId(scene.devices.find(d => d.deviceId !== id).deviceId);
            } else {
                showToast({ title: 'חייב להישאר מנורה אחת לפחות', icon: 'none' });
            }
        } else {
            const newState: SavedDeviceState = {
                deviceId: id,
                deviceName: devNames[id],
                mode: 'white',
                brightness: 1000,
                temperature: 500
            };
            setScene({ ...scene, devices: [...scene.devices, newState] });
            setSelectedDeviceId(id);
        }
    };

    const updateCurrentDevice = (updates: Partial<SavedDeviceState>) => {
        const updated = { ...currentDeviceState, ...updates };
        setScene({
            ...scene,
            devices: scene.devices.map(d => d.deviceId === selectedDeviceId ? updated : d)
        });

        // Real-time updates to device
        if (updates.mode) onRelease?.('work_mode', updates.mode);
        if (updates.brightness !== undefined || updates.temperature !== undefined) {
            onReleaseWhite?.({
                bright_value: updates.brightness ?? updated.brightness,
                temp_value: updates.temperature ?? updated.temperature
            });
        }
        if (updates.hue !== undefined) {
            onRelease?.('colour_data', {
                hue: updates.hue,
                saturation: updates.saturation ?? updated.saturation,
                value: updates.value ?? updated.value
            });
        }
    };

    const handleSave = () => {
        dispatch(updateScene({ id: scene.id, updates: scene }));
        dispatch(setEditingScene(null));
        showToast({ title: 'השינויים נשמרו', icon: 'success' });
        onClose();
    };

    const handleImagePicker = () => {
        chooseImage({
            count: 1,
            success: (res) => {
                if (res.tempFilePaths[0]) {
                    setScene({ ...scene, customImage: res.tempFilePaths[0] });
                }
            }
        });
    };

    return (
        <View className={styles.overlay}>
            <View className={styles.modal}>
                {/* Main Tabs Header */}
                <View className={styles.mainTabs}>
                    <View className={clsx(styles.mainTab, mainTab === 'general' && styles.mainTabActive)} onClick={() => setMainTab('general')}>
                        <Text className={styles.mainTabText}>כללי (שם ותמונה)</Text>
                    </View>
                    <View className={clsx(styles.mainTab, mainTab === 'dimmer' && styles.mainTabActive)} onClick={() => setMainTab('dimmer')}>
                        <Text className={styles.mainTabText}>דימור</Text>
                    </View>
                </View>

                <View className={styles.contentArea}>
                    {mainTab === 'general' && (
                        <View className={styles.tabContent}>
                            <View className={styles.inputGroup}>
                                <Text className={styles.tabLabel}>שם המצב:</Text>
                                <Input
                                    className={styles.fullInput}
                                    value={scene.name}
                                    onInput={(e) => setScene({ ...scene, name: e.value })}
                                />
                            </View>

                            <View className={styles.imageGroup}>
                                <Text className={styles.tabLabel}>תמונת המצב:</Text>
                                <View className={styles.imageEditWrap} onClick={handleImagePicker}>
                                    <Image src={scene.customImage || '/images/scene/generic.png'} className={styles.previewImg} mode="aspectFill" />
                                    <View className={styles.editOverlay}><Text>📷 החלף תמונה</Text></View>
                                </View>
                            </View>
                        </View>
                    )}

                    {mainTab === 'dimmer' && (
                        <View className={styles.dimmerTab}>
                            {/* Row 1: Effect Type */}
                            <View className={styles.controlRow}>
                                <Text
                                    className={clsx(styles.typeBtn, dimmerType === 'dimming' && styles.typeBtnActive)}
                                    onClick={() => setDimmerType('dimming')}
                                >עמעום</Text>
                                <Text
                                    className={clsx(styles.typeBtn, dimmerType === 'intensity' && styles.typeBtnActive)}
                                    onClick={() => { setDimmerType('intensity'); updateCurrentDevice({ mode: 'white' }); }}
                                >עוצמה</Text>
                                <Text
                                    className={clsx(styles.typeBtn, dimmerType === 'color' && styles.typeBtnActive)}
                                    onClick={() => { setDimmerType('color'); updateCurrentDevice({ mode: 'colour' }); }}
                                >צבע</Text>
                            </View>

                            {/* Row 2: Device Selection */}
                            <View className={styles.deviceRow}>
                                {Object.entries(devNames).map(([id, name]) => {
                                    const isActive = scene.devices.some(d => d.deviceId === id);
                                    const isSelected = selectedDeviceId === id;
                                    return (
                                        <View
                                            key={id}
                                            className={clsx(styles.devPill, isActive && styles.devPillActive, isSelected && styles.devPillSelected)}
                                            onClick={() => isSelected ? handleToggleDevice(id) : setSelectedDeviceId(id)}
                                        >
                                            <Text className={styles.devPillText}>{name}</Text>
                                        </View>
                                    );
                                })}
                            </View>

                            {/* Component Area */}
                            <View className={styles.componentContainer}>
                                {dimmerType === 'intensity' && (
                                    <White
                                        brightness={currentDeviceState.brightness}
                                        temperature={currentDeviceState.temperature}
                                        onRelease={(code, val) => {
                                            if (code === 'bright_value') updateCurrentDevice({ brightness: val });
                                            else updateCurrentDevice({ temperature: val });
                                        }}
                                        onChange={(isColor, val) => updateCurrentDevice({ brightness: val.brightness, temperature: val.temperature })}
                                    />
                                )}
                                {dimmerType === 'color' && (
                                    <Colour
                                        radius={130}
                                        currentLampName={devNames[selectedDeviceId]}
                                        allDevices={scene.devices}
                                        colour={{
                                            hue: currentDeviceState.hue || 0,
                                            saturation: currentDeviceState.saturation || 0,
                                            value: currentDeviceState.value || 0
                                        }}
                                        onRelease={(code, val) => {
                                            // Identify which device was actually changed if possible, 
                                            // but for now, the Colour component handles the active lamp.
                                            // The Colour component's onRelease might be called for markers.
                                            updateCurrentDevice({ hue: val.hue, saturation: val.saturation, value: val.value });
                                        }}
                                        onChange={(isColor, val) => updateCurrentDevice({ hue: val.hue, saturation: val.saturation, value: val.value })}
                                    />
                                )}
                                {dimmerType === 'dimming' && (
                                    <View className={styles.dimmingControls}>
                                        <View className={styles.settingBox}>
                                            <Text className={styles.boxLabel}>זמן דהייה (Fade)</Text>
                                            <Text className={styles.boxVal}>1.5s</Text>
                                            <View className={styles.lineSlider} />
                                        </View>
                                        <View className={styles.settingBox}>
                                            <Text className={styles.boxLabel}>השהיית פתיחה (Delay)</Text>
                                            <Text className={styles.boxVal}>0s</Text>
                                            <View className={styles.lineSlider} />
                                        </View>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}
                </View>

                {/* Footer Buttons */}
                <View className={styles.editorFooter}>
                    <View className={styles.cancelAction} onClick={onClose}><Text>ביטול</Text></View>
                    <View className={styles.saveAction} onClick={handleSave}><Text>שמור שינויים</Text></View>
                </View>
            </View>
        </View>
    );
};

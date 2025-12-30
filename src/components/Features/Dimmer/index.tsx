import React, { useCallback } from 'react';
import { View, Text, showToast } from '@ray-js/ray';
import clsx from 'clsx';
import { DpState, useSupport, useActions, useProps } from '@ray-js/panel-sdk';
import { lampSchemaMap } from '@/devices/schema';
import Strings from '@/i18n';
import { ModeTabs, type MetaMode } from '@/components/Common/ModeTabs';
import { Box } from '@/components/Base/Box';
import { Scene } from './Scene';
import { Music } from './Music';
import { White } from './White';
import { Colour } from './Colour';
import { CollectColors } from './components/CollectColors';
import { SavedScenesDropdown } from './components/SavedScenesDropdown';
import { SaveSceneButton } from './components/SaveSceneButton';
import { FixedModesLayout } from './components/FixedModesLayout';
import { SavedScene, SavedDeviceState } from '@/redux/modules/savedScenesSlice';

import styles from './index.module.less';

const { bright_value, temp_value, colour_data } = lampSchemaMap;

interface IColour {
    hue: number;
    saturation: number;
    value: number;
}

type WorkMode = 'white' | 'colour' | 'scene' | 'music';

interface IProps {
    style?: React.CSSProperties;
    className?: string;
    contentClassName?: string;
    showTitle?: boolean;
    hideTabs?: boolean;
    hideCollectColors?: boolean;
    mode: WorkMode;
    temperature: number;
    brightness: number;
    colour: IColour;
    canEdit?: boolean;
    validWorkMode?: WorkMode[];
    onModeChange?: (v: string) => void;
    onRelease: (code: string, value: any) => void;
    onReleaseWhite: (cmd: DpState) => void;
    onChange?: (isColor: boolean, value: any) => void;
    setScrollEnabled?: (v: boolean) => void;
    deviceName?: string;
    deviceId?: string;
    searchQuery?: string;
}

const DEFAULT_COLOUR: IColour = {
    hue: 0,
    saturation: 0,
    value: 0,
};

export const Dimmer = React.memo((props: IProps) => {
    const {
        showTitle,
        hideTabs = false,
        hideCollectColors = false,
        deviceName = 'מנורה',
        deviceId = '',
        mode,
        style,
        className,
        contentClassName,
        temperature = 0,
        brightness = 0,
        colour,
        canEdit = true,
        onModeChange,
        onRelease,
        onChange,
        onReleaseWhite,
        setScrollEnabled,
        searchQuery = '',
    } = props;

    const safeColour = colour || DEFAULT_COLOUR;

    const support = useSupport();
    const actions = useActions();

    // קבלת שמות המכשירים מה-DP
    const selectedDeviceKey = useProps(props => props.selected_device) || 'Device1';
    const devName1 = useProps(props => props.dev_name_1) || 'מנורה 1';
    const devName2 = useProps(props => props.dev_name_2) || 'מנורה 2';
    const devName3 = useProps(props => props.dev_name_3) || 'מנורה 3';

    // בניית רשימת כל המכשירים
    const allDevices = React.useMemo(() => [
        { deviceId: 'Device1', deviceName: devName1 },
        { deviceId: 'Device2', deviceName: devName2 },
        { deviceId: 'Device3', deviceName: devName3 },
    ], [devName1, devName2, devName3]);

    // המכשיר הנוכחי
    const currentDevice = React.useMemo(() => {
        const device = allDevices.find(d => d.deviceId === selectedDeviceKey);
        return device || allDevices[0];
    }, [allDevices, selectedDeviceKey]);

    // ה-state הנוכחי (משותף לכל המכשירים)
    const currentState = React.useMemo(() => ({
        mode: mode as 'white' | 'colour',
        brightness: brightness,
        temperature: temperature,
        hue: safeColour.hue,
        saturation: safeColour.saturation,
        value: safeColour.value,
    }), [mode, brightness, temperature, safeColour]);

    const ADJUSTMENT_TAB = 'adjustment';
    const FIXED_TAB = 'fixed';

    const activeMetaMode = ['white', 'colour'].includes(mode) ? ADJUSTMENT_TAB : FIXED_TAB;

    const handleTabChange = (metaMode: MetaMode) => {
        if (metaMode === ADJUSTMENT_TAB) {
            onModeChange?.(mode === 'white' ? 'white' : 'colour');
        } else {
            onModeChange?.('scene');
        }
    };

    const handleChooseColor = (data: COLOUR & WHITE) => {
        const { hue, saturation, value, brightness: bright, temperature: temp } = data;
        if (mode === 'colour') {
            onRelease?.(colour_data.code, { hue, saturation, value });
        } else {
            onReleaseWhite?.({ [bright_value.code]: bright, [temp_value.code]: temp });
        }
    };

    // ========== Saved Scenes Handlers ==========

    const handleActivateScene = useCallback((scene: SavedScene) => {
        console.log('🎬 Activating scene:', scene.name, scene);

        scene.devices.forEach((device: SavedDeviceState) => {
            // אם זה מצב של מנורה אחת, בדוק שזה המכשיר הנוכחי
            if (!scene.isMultiDevice && device.deviceId !== selectedDeviceKey) {
                console.log('⏭️ Skipping device (not current):', device.deviceId);
                return;
            }

            console.log('💡 Applying state to device:', device.deviceId, device);

            if (device.mode === 'colour' && device.hue !== undefined) {
                // הפעלת מצב צבע
                actions.switch_led?.on({ checkRepeat: false });
                actions.work_mode?.set('colour', { checkRepeat: false, delay: 100 });
                onRelease?.(colour_data.code, {
                    hue: device.hue,
                    saturation: device.saturation,
                    value: device.value,
                });
                console.log('🎨 Set colour:', { hue: device.hue, saturation: device.saturation, value: device.value });
            } else if (device.mode === 'white' && device.brightness !== undefined) {
                // הפעלת מצב לבן
                actions.switch_led?.on({ checkRepeat: false });
                actions.work_mode?.set('white', { checkRepeat: false, delay: 100 });
                onReleaseWhite?.({
                    [bright_value.code]: device.brightness,
                    [temp_value.code]: device.temperature,
                });
                console.log('💡 Set white:', { brightness: device.brightness, temperature: device.temperature });
            }
        });

        // עדכון ה-UI mode
        const firstDevice = scene.devices[0];
        if (firstDevice) {
            onModeChange?.(firstDevice.mode);
        }
    }, [selectedDeviceKey, actions, onRelease, onReleaseWhite, onModeChange]);

    // ========== End Saved Scenes ==========

    const commonProps = { onChange, onRelease, setScrollEnabled };

    return (
        <Box
            style={style || {}}
            className={clsx(styles.container || '', className || '')}
            contentClassName={clsx(styles.boxContent || '', contentClassName || '')}
            title={showTitle ? Strings.getLang('dimming') : ''}
        >
            {!hideTabs && (
                <ModeTabs
                    activeMode={mode}
                    onChange={handleTabChange}
                />
            )}

            {!hideCollectColors && activeMetaMode === ADJUSTMENT_TAB && (
                <CollectColors
                    style={{ justifyContent: 'start', width: '100%', margin: '24rpx 0' }}
                    showAdd={canEdit}
                    isColor={mode === 'colour'}
                    colourData={safeColour}
                    brightness={brightness}
                    temperature={temperature}
                    chooseColor={data => handleChooseColor?.(data)}
                />
            )}

            <View className={clsx(styles.contentArea || '', activeMetaMode === FIXED_TAB && (styles.fixedContentArea || ''))}>
                {activeMetaMode === ADJUSTMENT_TAB ? (
                    <>
                        {/* ====== כפתור שמירה - צד שמאל ====== */}
                        <SaveSceneButton
                            currentDevice={currentDevice}
                            allDevices={allDevices}
                            currentState={currentState}
                        />
                        {/* ====== סוף כפתור שמירה ====== */}

                        {/* White Mode */}
                        <View
                            className={clsx(
                                styles.swapWrapper,
                                mode === 'white' ? styles.stateMain : styles.stateMini
                            )}
                            onClick={() => mode === 'colour' && onModeChange?.('white')}
                        >
                            <View className={styles.miniBackground} />
                            <White
                                {...commonProps}
                                brightness={brightness}
                                temperature={temperature}
                                style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                            />
                        </View>

                        {/* Colour Mode */}
                        <View
                            className={clsx(
                                styles.swapWrapper,
                                mode === 'colour' ? styles.stateMain : styles.stateMini
                            )}
                            onClick={() => mode === 'white' && onModeChange?.('colour')}
                        >
                            <View className={styles.miniBackground} />
                            <Colour
                                {...commonProps}
                                colour={safeColour}
                                currentLampName={deviceName}
                                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                            />
                        </View>
                    </>
                ) : (
                    <FixedModesLayout searchQuery={searchQuery} />
                )}

            </View>
        </Box>
    );
});
import React from 'react';
import { View } from '@ray-js/ray';
import clsx from 'clsx';
import { DpState, useSupport } from '@ray-js/panel-sdk';
import { lampSchemaMap } from '@/devices/schema';
import Strings from '@/i18n';
import { ModeTabs, type MetaMode } from '@/components/Common/ModeTabs';
import { Box } from '@/components/Base/Box';
import { Scene } from './Scene';
import { Music } from './Music';
import { White } from './White';
import { Colour } from './Colour';
import { CollectColors } from './components/CollectColors';

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
}

export const Dimmer = React.memo((props: IProps) => {
    const {
        showTitle,
        hideTabs = false,
        hideCollectColors = false,
        deviceName = 'מנורה',
        mode,
        style,
        className,
        contentClassName,
        temperature,
        brightness,
        colour,
        canEdit = true,
        onModeChange,
        onRelease,
        onChange,
        onReleaseWhite,
        setScrollEnabled,
    } = props;

    const support = useSupport();

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

    const commonProps = { onChange, onRelease, setScrollEnabled };

    return (
        <Box
            style={style}
            className={clsx(styles.container, className || '')}
            contentClassName={clsx(styles.boxContent, contentClassName || '')}
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
                    colourData={colour}
                    brightness={brightness}
                    temperature={temperature}
                    chooseColor={data => handleChooseColor?.(data)}
                />
            )}

            <View className={styles.contentArea || ''}>
                {activeMetaMode === ADJUSTMENT_TAB ? (
                    <>
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
                                brightness={props.brightness}
                                temperature={props.temperature}
                                style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                            />
                        </View>

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
                                colour={props.colour}
                                currentLampName={props.deviceName}
                                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                            />
                        </View>
                    </>
                ) : (
                    <View style={{ position: 'relative', width: '100%', height: '100%' }}>
                        {mode === 'scene' && <Scene style={{ position: 'relative', width: '100%' }} />}
                        {mode === 'music' && support.isSupportDp(lampSchemaMap.music_data.code) && (
                            <Music style={{ position: 'relative', width: '100%' }} />
                        )}
                    </View>
                )}
            </View>
        </Box>
    );
});

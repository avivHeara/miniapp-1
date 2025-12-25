import React from 'react';
import { View } from '@ray-js/ray';
import clsx from 'clsx';
import { DpState, useSupport } from '@ray-js/panel-sdk';
import { useCreation } from 'ahooks';
import { lampSchemaMap } from '@/devices/schema';
import Strings from '@/i18n';
import { TabBar } from '../TabBar';
import { CollectColors } from '../CollectColors';
import { Box } from '../Box';
import { Scene } from './Scene';
import { Music } from './Music';
import { White } from './White';
import { Colour } from './Colour';

import styles from './index.module.less';

const { bright_value, temp_value, colour_data, scene_data, music_data } = lampSchemaMap;

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
  /** הסתר את הטאבים הפנימיים - להשתמש כשיש טאבים חיצוניים */
  hideTabs?: boolean;
  /** הסתר את צבעי האוסף (עיגולי הצבעים) */
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
    validWorkMode = ['white', 'colour', 'scene', 'music'],
    onModeChange,
    onRelease,
    onChange,
    onReleaseWhite,
    setScrollEnabled,
  } = props;

  const support = useSupport();

  // Refactor Tab Bar into two meta-modes
  const ADJUSTMENT_TAB = 'adjustment';
  const FIXED_TAB = 'fixed';

  const activeMetaMode = ['white', 'colour'].includes(mode) ? ADJUSTMENT_TAB : FIXED_TAB;

  const handleTabClick = (tabKey: string) => {
    if (tabKey === ADJUSTMENT_TAB) {
      // Switch back to previous preference or default to colour if moving from fixed
      onModeChange?.(mode === 'white' ? 'white' : 'colour');
    } else {
      onModeChange?.('scene'); // Default to scene for fixed
    }
  };

  const workModeTabs = [
    { key: ADJUSTMENT_TAB, label: 'כיונון ויצירה' },
    { key: FIXED_TAB, label: 'מצבים קבועים' },
  ];

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
      {/* Refactored TabBar */}
      {!hideTabs && (
        <TabBar
          itemWidth="50%"
          itemHeight={56}
          value={activeMetaMode}
          tabList={workModeTabs.map(t => t.key)}
          // Custom render for TabBar might be needed if it doesn't support labels,
          // but assuming TabBar takes a list of keys and we can map them in i18n or Props if it supports labels.
          // Looking at previous TabBar usage: it took workModeTabs which were raw modes.
          // I will use raw strings and map them in the TabBar UI if possible, or just use the labels as keys.
          onClick={handleTabClick}
        />
      )}

      {/* Show color collection only in adjustment modes */}
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

      {/* ANIMATED SWAP CONTENT - Only active in Adjustment Meta-Mode */}
      <View className={styles.contentArea || ''}>
        {activeMetaMode === ADJUSTMENT_TAB ? (
          <>
            {/* WHITE (SLIDERS) */}
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

            {/* COLOUR (WHEEL) */}
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
          /* FIXED MODES (SCENE/MUSIC) */
          <View style={{ position: 'relative', width: '100%', height: '100%' }}>
            {mode === 'scene' && <Scene style={{ position: 'relative', width: '100%' }} />}
            {mode === 'music' && support.isSupportDp(music_data.code) && (
              <Music style={{ position: 'relative', width: '100%' }} />
            )}
          </View>
        )}
      </View>
    </Box>
  );
});

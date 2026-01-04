/**
 * Home Page
 * דף הבית הראשי
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  showToast,
  Text,
  router,
  Image // Added Image
} from '@ray-js/ray';
import clsx from 'clsx';
import {
  useActions,
  useProps,
  useStructuredActions,
  useStructuredProps,
  useSupport,
} from '@ray-js/panel-sdk';
import { lampSchemaMap } from '@/devices/schema';
import { devices } from '@/devices';

import {
  PowerButton,
  DeviceSelector,
  BottomNav,
  ModeTabs,
  SearchBar,
} from '@/components';
import { LampSettings } from '@/components/Features/LampSettings';
import { Dimmer } from '@/components/Features/Dimmer';
import { TimerFeature as TimerContent } from '@/components/Features/TimerFeature';
import { SchedulingFeature as ShabbatContent } from '@/components/Features/SchedulingFeature';

import type { NavTab, LightMode } from '@/components';

import styles from './index.module.less';

// ========== DEBUG LOG ==========
console.log('🏠 HOME PAGE LOADED - VERSION 2.2');

const { control_data, colour_data } = lampSchemaMap;

// Define Props for Home
interface Props {
  devInfo: DevInfo;
  extraInfo?: Record<string, any>;
}

// Helper for SVG Icons
const getSvgDataUrl = (path: string, color: string) => {
  const encodedColor = encodeURIComponent(color);
  const svg = `<svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><g fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${path}</g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
};

const ICONS = {
  // Exchange icon for switching views
  switch: '<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M3 4l17 17M16 21H3v-5" />',
  back: '<path d="M19 12H5M12 19l-7-7 7-7" />'
};

export function Home(props: Props) {
  const { devInfo } = props;

  // DEBUG - log on mount
  useEffect(() => {
    console.log('🏠 Home component mounted!', devInfo?.name);
  }, []);

  const support = useSupport();
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const dpActions = useActions();
  const dpStructuredActions = useStructuredActions();

  const colour = useStructuredProps(props => props.colour_data);
  const brightness = useProps(props => props.bright_value);
  const temperature = useProps(props => props.temp_value);
  const power = useProps(props => props.switch_led);
  const workMode = useProps(props => props.work_mode);

  // -- Device Selector State --
  const selectedDeviceKey = useProps(props => props.selected_device);
  const devName1 = useProps(props => props.dev_name_1);
  const devName2 = useProps(props => props.dev_name_2);
  const devName3 = useProps(props => props.dev_name_3);

  const currentDeviceName = React.useMemo(() => {
    // Default to Name 1 if nothing selected
    switch (selectedDeviceKey) {
      case 'Device1': return devName1 || 'מנורה 1';
      case 'Device2': return devName2 || 'מנורה 2';
      case 'Device3': return devName3 || 'מנורה 3';
      default: return devName1 || 'מנורה 1';
    }
  }, [selectedDeviceKey, devName1, devName2, devName3]);

  const [activeNavTab, setActiveNavTab] = useState<NavTab>('lights');
  const [showAdvancedTimer, setShowAdvancedTimer] = useState(false); // New State
  const [searchQuery, setSearchQuery] = useState('');

  const [activeLightMode, setActiveLightMode] = useState<LightMode>(() => {
    if (['white', 'colour', 'scene'].includes(workMode)) {
      return workMode as LightMode;
    }
    return 'white';
  });

  // Local state for colour data to "neutralize" DP interaction
  const [localColour, setLocalColour] = useState(colour);
  const [localBrightness, setLocalBrightness] = useState(brightness);
  const [localTemperature, setLocalTemperature] = useState(temperature);
  const isInteracting = React.useRef(false);

  // Sync local state when DP updates
  useEffect(() => {
    if (colour && !isInteracting.current) setLocalColour(colour);
  }, [colour]);

  useEffect(() => {
    if (brightness !== undefined && !isInteracting.current) setLocalBrightness(brightness);
  }, [brightness]);

  useEffect(() => {
    if (temperature !== undefined && !isInteracting.current) setLocalTemperature(temperature);
  }, [temperature]);

  // ========================================
  // Navigation Functions
  // ========================================

  const goToDevices = () => {
    console.log('🔵 goToDevices clicked!');
    try {
      router.push('/devices');
    } catch (e) {
      console.log('Navigation failed', e);
    }
  };

  const goToSettings = () => {
    console.log('🔵 goToSettings clicked!');
    try {
      router.push('/settings');
    } catch (e) {
      console.log('Navigation failed', e);
    }
  };

  const toggleAdvancedTimer = () => {
    console.log('🔵 toggleAdvancedTimer clicked!');
    setShowAdvancedTimer(prev => !prev);
  };

  const goToShabbatPage = () => {
    console.log('🔵 goToShabbatPage clicked!');
    try {
      router.push('/shabbat');
    } catch (e) {
      console.log('Navigation failed', e);
    }
  };

  // ========================================
  // Handlers
  // ========================================

  const handleLightModeChange = (mode: string) => {
    console.log('🟢 handleLightModeChange (Meta or Raw):', mode);
    let targetMode = mode;
    if (mode === 'adjustment') {
      targetMode = activeLightMode === 'colour' ? 'colour' : 'white';
    } else if (mode === 'fixed') {
      targetMode = 'scene';
    }

    // @ts-ignore
    setActiveLightMode(targetMode);
    dpActions.work_mode?.set(targetMode, { checkRepeat: false, throttle: 300 });
  };

  const handleNavTabChange = (tab: NavTab) => {
    console.log('🟢 handleNavTabChange:', tab);
    setActiveNavTab(tab);
    // Reset advanced view when switching tabs
    if (tab !== 'timer') setShowAdvancedTimer(false);
  };

  const handleColorChange = (isColour: boolean, data: any) => {
    if (!support.isSupportDp(control_data.code)) return;
    isInteracting.current = true;
    let controlData = { hue: 0, saturation: 0, value: 0, bright: 0, temp: 0 };
    if (isColour) {
      const { hue, saturation, value } = data;
      controlData = { hue, saturation, value, bright: 0, temp: 0 };
      setLocalColour({ hue, saturation, value }); // Instant local update
    } else {
      const { brightness: bright, temperature: temp } = data;
      controlData = { hue: 0, saturation: 0, value: 0, bright, temp };
      setLocalBrightness(bright); // Instant local update
      setLocalTemperature(temp); // Instant local update
    }
    // Network update remains throttled to avoid congestion
    devices.lamp.publishDps({ control_data: controlData }, { throttle: 200 });
  };

  const handleRelease = (code: string, value: any) => {
    isInteracting.current = false;
    if (code === colour_data.code) {
      // Local update for release
      setLocalColour({ ...localColour, ...value });
    }
    // Reliable DP call via SDM instance
    devices.lamp.publishDps({ [code]: value }, { throttle: 200, immediate: true });
  };

  const handleReleaseWhite = (value: any) => {
    isInteracting.current = false;
    if (value.bright_value !== undefined) setLocalBrightness(value.bright_value);
    if (value.temp_value !== undefined) setLocalTemperature(value.temp_value);
    // Correctly publish multiple DPS for white mode
    devices.lamp.publishDps(value, { throttle: 200 });
  };

  // ========================================
  // Render
  // ========================================

  return (
    <View className={styles.pageContainer}>
      {/* ===== SPACER - דוחף את DeviceSelector למטה - מוקטן לשיפור מיקום המנורות ===== */}
      <View style={{ height: '80rpx' }} />

      {/* ===== HEADER AREA: SEARCH OR DEVICE SELECTOR ===== */}
      {(activeNavTab === 'lights' && activeLightMode === 'scene') || activeNavTab === 'music' ? (
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          style={{ marginTop: '20rpx' }}
        />
      ) : (
        <DeviceSelector onEditPress={goToDevices} />
      )}

      {/* ===== MODE TABS ===== */}
      {activeNavTab === 'lights' && (
        <ModeTabs
          activeMode={activeLightMode}
          onChange={handleLightModeChange}
        />
      )}

      {/* ===== CONTENT AREA - Persistent Mounting ===== */}
      <ScrollView
        className={styles.contentArea}
        scrollY={scrollEnabled}
        scrollWithAnimation
      >
        <View className={styles.contentWrapper}>
          {/* PERSISTENT LIGHTS TAB */}
          <View
            className={clsx(styles.dimmerContainer, {
              [styles.hideTab]: activeNavTab !== 'lights'
            })}
          >
            <Dimmer
              contentClassName={clsx((activeLightMode !== 'scene' && !power) && styles.disabled)}
              setScrollEnabled={setScrollEnabled}
              showTitle={false}
              hideTabs={true}
              hideCollectColors={true}
              mode={activeLightMode as any}
              colour={localColour}
              brightness={localBrightness}
              temperature={localTemperature}
              onModeChange={handleLightModeChange}
              onChange={handleColorChange}
              onRelease={handleRelease}
              onReleaseWhite={handleReleaseWhite}
              deviceName={currentDeviceName}
              searchQuery={searchQuery}
            />
          </View>

          {/* PERSISTENT TIMER TAB */}
          <View
            className={clsx({
              [styles.hideTab]: activeNavTab !== 'timer'
            })}
          >
            <TimerContent showAdvanced={showAdvancedTimer} />
          </View>

          {/* PERSISTENT SHABBAT TAB */}
          <View
            className={clsx({
              [styles.hideTab]: activeNavTab !== 'shabbat'
            })}
          >
            <ShabbatContent onAdvancedPress={goToShabbatPage} />
          </View>

          {/* PERSISTENT LAMP SETTINGS TAB */}
          <View
            className={clsx({
              [styles.hideTab]: activeNavTab !== 'lampSettings'
            })}
          >
            <LampSettings />
          </View>
        </View>
      </ScrollView>

      {/* ===== BOTTOM NAV ===== */}
      <BottomNav
        activeTab={activeNavTab}
        onChange={handleNavTabChange}
        onMorePress={goToSettings}
      />

      {/* ===== BOTTOM FIXED BUTTONS (Moved last to be on top) ===== */}
      {activeNavTab !== 'shabbat' && (
        <View className={styles.bottomFixedContainer}>
          {/* Advanced Timer Button - Left Side, only for Timer tab */}
          {activeNavTab === 'timer' && (
            <View className={styles.extraBtnWrapper} onClick={toggleAdvancedTimer}>
              <View className={styles.timerBtn}>
                <Image
                  src={getSvgDataUrl(
                    // Show same switch icon but maybe different color or effect? 
                    // User requested "Show same icon, no text".
                    // I will use a nice 'Switch/Exchange' icon that implies toggling views.
                    ICONS.switch,
                    showAdvancedTimer ? '#4caf50' : '#00e5ff' // Green when active/advanced, Cyan when normal
                  )}
                  style={{ width: '56rpx', height: '56rpx' }}
                />
              </View>
              {/* Text Removed as requested */}
            </View>
          )}
          {/* Show Power Button only in Adjustment modes (White/Colour) */}
          {(activeNavTab === 'lights' && activeLightMode !== 'scene') && <PowerButton />}
        </View>
      )}
    </View>
  );
}

export default Home;

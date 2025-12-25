/**
 * Home Page
 * דף הבית הראשי
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, router } from '@ray-js/ray';
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
  Dimmer,
  DeviceSelector,
  BottomNav,
  ModeTabs,
  TimerContent,
  ShabbatContent,
} from '@/components';

import type { NavTab, LightMode } from '@/components';

import styles from './index.module.less';

// ========== DEBUG LOG ==========
console.log('🏠 HOME PAGE LOADED - VERSION 2.0');

const { control_data, colour_data } = lampSchemaMap;

// Define Props for Home
interface Props {
  devInfo: DevInfo;
  extraInfo?: Record<string, any>;
}

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

  const [activeLightMode, setActiveLightMode] = useState<LightMode>(() => {
    if (['white', 'colour', 'scene'].includes(workMode)) {
      return workMode as LightMode;
    }
    return 'white';
  });

  // Local state for colour data to "neutralize" DP interaction
  const [localColour, setLocalColour] = useState(colour);

  // Sync local state when DP updates (optional, keeping it here for initial load correct value)
  useEffect(() => {
    if (colour) setLocalColour(colour);
  }, []); // Only on mount/change, actually if we want to "detach", maybe once is enough. 
  // If we want to support external updates later, we'd add [colour] dependency.
  // For now, let's keep it detached after mount so user local changes persist even if DP doesn't update.

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

  const goToTimersPage = () => {
    console.log('🔵 goToTimersPage clicked!');
    try {
      router.push('/timers');
    } catch (e) {
      console.log('Navigation failed', e);
    }
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
  };

  const handleColorChange = (isColour: boolean, data: any) => {
    if (!support.isSupportDp(control_data.code)) return;
    let controlData = { hue: 0, saturation: 0, value: 0, bright: 0, temp: 0 };
    if (isColour) {
      const { hue, saturation, value } = data;
      controlData = { hue, saturation, value, bright: 0, temp: 0 };
      // Local update for dragging
      setLocalColour({ ...localColour, hue, saturation, value });
    } else {
      const { brightness: bright, temperature: temp } = data;
      controlData = { hue: 0, saturation: 0, value: 0, bright, temp };
    }
    // NEUTRALIZED DP CALL
    // dpStructuredActions.control_data.set(controlData, { throttle: 50 });
    console.log('🔴 Neutralized control_data.set:', controlData);
  };

  const handleRelease = (code: string, value: any) => {
    console.log('🔴 handleRelease neutralized:', code, value);
    if (code === colour_data.code) {
      // Local update for release
      setLocalColour({ ...localColour, ...value });

      // NEUTRALIZED DP CALL
      // dpStructuredActions[code].set(value, { throttle: 50, immediate: true });
    } else {
      // dpActions[code].set(value, { throttle: 50 });
    }
  };

  const handleReleaseWhite = (value: any) => {
    devices.lamp.publishDps(value, { throttle: 50 });
  };

  // ========================================
  // Render Content
  // ========================================

  const renderContent = () => {
    switch (activeNavTab) {
      case 'lights':
        return (
          <View className={styles.dimmerContainer}>
            <Dimmer
              contentClassName={clsx(!power && styles.disabled)}
              setScrollEnabled={setScrollEnabled}
              showTitle={false}
              hideTabs={true}
              hideCollectColors={true}
              mode={activeLightMode as any}
              colour={localColour}
              brightness={brightness}
              temperature={temperature}
              onModeChange={handleLightModeChange}
              onChange={handleColorChange}
              onRelease={handleRelease}
              onReleaseWhite={handleReleaseWhite}
              deviceName={currentDeviceName}
            />
          </View>
        );

      case 'timer':
        return <TimerContent onAdvancedPress={goToTimersPage} />;

      case 'shabbat':
        return <ShabbatContent onAdvancedPress={goToShabbatPage} />;

      default:
        return null;
    }
  };

  return (
    <View className={styles.pageContainer}>
      {/* ===== SPACER - דוחף את DeviceSelector למטה - מוקטן לשיפור מיקום המנורות ===== */}
      <View style={{ height: '80rpx' }} />

      {/* ===== DEVICE SELECTOR ===== */}
      <DeviceSelector onEditPress={goToDevices} />

      {/* ===== MODE TABS ===== */}
      {activeNavTab === 'lights' && (
        <ModeTabs
          activeMode={activeLightMode}
          onChange={handleLightModeChange}
        />
      )}

      {/* ===== CONTENT AREA ===== */}
      <ScrollView
        className={styles.contentArea}
        scrollY={scrollEnabled}
        scrollWithAnimation
      >
        <View className={styles.contentWrapper}>
          {renderContent()}
        </View>
      </ScrollView>

      {/* ===== POWER BUTTON ===== */}
      {activeNavTab !== 'shabbat' && <PowerButton />}

      {/* ===== BOTTOM NAV ===== */}
      <BottomNav
        activeTab={activeNavTab}
        onChange={handleNavTabChange}
        onMorePress={goToSettings}
      />
    </View>
  );
}

export default Home;

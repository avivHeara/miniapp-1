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

export function Home() {
  // DEBUG - log on mount
  useEffect(() => {
    console.log('🏠 Home component mounted!');
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

  const [activeNavTab, setActiveNavTab] = useState<NavTab>('lights');

  const [activeLightMode, setActiveLightMode] = useState<LightMode>(() => {
    if (['white', 'colour', 'scene'].includes(workMode)) {
      return workMode as LightMode;
    }
    return 'white';
  });

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

  const handleLightModeChange = (mode: LightMode) => {
    console.log('🟢 handleLightModeChange:', mode);
    setActiveLightMode(mode);
    dpActions.work_mode?.set(mode, { checkRepeat: false, throttle: 300 });
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
    } else {
      const { brightness: bright, temperature: temp } = data;
      controlData = { hue: 0, saturation: 0, value: 0, bright, temp };
    }
    dpStructuredActions.control_data.set(controlData, { throttle: 50 });
  };

  const handleRelease = (code: string, value: any) => {
    if (code === colour_data.code) {
      dpStructuredActions[code].set(value, { throttle: 50, immediate: true });
    } else {
      dpActions[code].set(value, { throttle: 50 });
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
              colour={colour}
              brightness={brightness}
              temperature={temperature}
              onModeChange={handleLightModeChange}
              onChange={handleColorChange}
              onRelease={handleRelease}
              onReleaseWhite={handleReleaseWhite}
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
      {/* ===== SPACER - דוחף את DeviceSelector למטה ===== */}
      <View style={{ height: '160rpx' }} />

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

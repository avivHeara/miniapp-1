import React, { useState } from 'react';
import { View, Text, ScrollView, router } from '@ray-js/ray';
import clsx from 'clsx';
import {
  useDevice,
  useActions,
  useProps,
  useStructuredActions,
  useStructuredProps,
  useSupport,
} from '@ray-js/panel-sdk';
import { useCreation } from 'ahooks';
import { lampSchemaMap } from '@/devices/schema';
import { ControlBar, Dimmer } from '@/components';
import { devices } from '@/devices';
import styles from './index.module.less';

const { control_data, colour_data } = lampSchemaMap;

// DP 108 - selected_device (Enum: Device1, Device2, Device3)
const DEVICE_ENUM_VALUES = ['Device1', 'Device2', 'Device3'] as const;

// Mode tabs - רק מצבי אור (בלי שבת/טיימר)
type ModeType = 'white' | 'colour' | 'scene';

const MODE_TABS: { key: ModeType; label: string; icon: string }[] = [
  { key: 'white', label: 'White', icon: '💡' },
  { key: 'colour', label: 'Color', icon: '🎨' },
  { key: 'scene', label: 'Scenes', icon: '🎬' },
];

export function Home() {
  const support = useSupport();
  const deviceName = useDevice(d => d.devInfo.name);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const dpActions = useActions();
  const dpStructuredActions = useStructuredActions();

  // Device state
  const colour = useStructuredProps(props => props.colour_data);
  const brightness = useProps(props => props.bright_value);
  const temperature = useProps(props => props.temp_value);
  const power = useProps(props => props.switch_led);
  const workMode = useProps(props => props.work_mode);

  // בחירת מנורה (DP 108 + 111–113)
  const selectedDevice = useProps(props => props.selected_device);
  const devName1 = useProps(props => props.dev_name_1);
  const devName2 = useProps(props => props.dev_name_2);
  const devName3 = useProps(props => props.dev_name_3);

  // Active mode tab
  const [activeMode, setActiveMode] = useState<ModeType>(() => {
    if (['white', 'colour', 'scene'].includes(workMode)) {
      return workMode as ModeType;
    }
    return 'white';
  });

  const deviceTabs = useCreation(
    () => [
      { key: DEVICE_ENUM_VALUES[0], name: devName1 || 'מנורה 1' },
      { key: DEVICE_ENUM_VALUES[1], name: devName2 || 'מנורה 2' },
      { key: DEVICE_ENUM_VALUES[2], name: devName3 || 'מנורה 3' },
    ],
    [devName1, devName2, devName3]
  );

  const selectedDeviceIndex = React.useMemo(() => {
    if (!selectedDevice) return 0;
    const idx = DEVICE_ENUM_VALUES.indexOf(
      selectedDevice as (typeof DEVICE_ENUM_VALUES)[number]
    );
    return idx >= 0 ? idx : 0;
  }, [selectedDevice]);

  // ========================================
  // Navigation Functions
  // ========================================
  const goBack = React.useCallback(() => {
    router.back();
  }, []);

  const goToSettings = React.useCallback(() => {
    router.push('/settings');
  }, []);

  const goToDevices = React.useCallback(() => {
    router.push('/devices');
  }, []);

  const goToShabbat = React.useCallback(() => {
    router.push('/shabbat');
  }, []);

  const goToTimers = React.useCallback(() => {
    router.push('/timers');
  }, []);

  // ========================================
  // Handlers
  // ========================================
  const handleModeChange = React.useCallback(
    (mode: ModeType) => {
      setActiveMode(mode);
      dpActions.work_mode?.set(mode, { checkRepeat: false, throttle: 300 });
    },
    [dpActions]
  );

  const handleChangeDevice = React.useCallback(
    (key: string) => {
      if (dpActions.selected_device) {
        dpActions.selected_device.set(key, { checkRepeat: false, throttle: 300 });
      }
    },
    [dpActions]
  );

  const handleColorChange = React.useCallback(
    (isColour: boolean, data: any) => {
      if (!support.isSupportDp(control_data.code)) return;
      let controlData = { hue: 0, saturation: 0, value: 0, bright: 0, temp: 0 };
      if (isColour) {
        const { hue, saturation, value } = data;
        controlData = { hue, saturation, value, bright: 0, temp: 0 };
      } else {
        const { brightness: bright, temperature: temp } = data;
        controlData = { hue: 0, saturation: 0, value: 0, bright, temp };
      }
      dpStructuredActions.control_data.set(controlData, { throttle: 300 });
    },
    [dpStructuredActions, support]
  );

  const handleRelease = React.useCallback(
    (code: string, value: any) => {
      if (code === colour_data.code) {
        dpStructuredActions[code].set(value, { throttle: 300, immediate: true });
      } else {
        dpActions[code].set(value, { throttle: 300 });
      }
    },
    [dpActions, dpStructuredActions]
  );

  const handleReleaseWhite = React.useCallback((value: any) => {
    devices.lamp.publishDps(value, { throttle: 300 });
  }, []);

  // ========================================
  // Render helpers
  // ========================================

  // Header Bar
  const renderHeader = () => {
    return (
      <View className={styles.headerBar}>
        {/* כפתור חזרה */}
        <View className={styles.headerBtn} onClick={goBack}>
          <Text className={styles.headerBtnText}>←</Text>
        </View>

        {/* שם המכשיר */}
        <View className={styles.headerCenter}>
          <Text className={styles.headerTitle}>{deviceName || 'MBN Dimmer'}</Text>
          <View className={styles.headerEditBtn} onClick={goToDevices}>
            <Text className={styles.headerEditText}>✏️</Text>
          </View>
        </View>

        {/* Placeholder לאיזון */}
        <View className={styles.headerBtn} style={{ opacity: 0 }}>
          <Text className={styles.headerBtnText}>←</Text>
        </View>
      </View>
    );
  };

  // Device Selector
  const renderDeviceSelector = () => {
    const itemWidthPercent = 100 / deviceTabs.length;
    const offsetPercent = selectedDeviceIndex * itemWidthPercent;

    return (
      <View className={styles.deviceSelector}>
        <View className={styles.deviceTabs}>
          <View
            className={styles.deviceThumb}
            style={{
              width: `${itemWidthPercent}%`,
              left: `${offsetPercent}%`,
            }}
          />
          {deviceTabs.map((item, index) => (
            <View
              key={item.key}
              className={styles.deviceTab}
              onClick={() => handleChangeDevice(item.key)}
            >
              <Text
                className={clsx(
                  styles.deviceTabText,
                  index === selectedDeviceIndex && styles.deviceTabTextActive
                )}
              >
                {item.name}
              </Text>
            </View>
          ))}
        </View>
        <View className={styles.editBtn} onClick={goToDevices}>
          <Text className={styles.editBtnIcon}>✏️</Text>
          <Text className={styles.editBtnText}>Edit</Text>
        </View>
      </View>
    );
  };

  // Mode Tabs
  const renderModeTabs = () => {
    return (
      <View className={styles.modeTabs}>
        {MODE_TABS.map(mode => (
          <View
            key={mode.key}
            className={clsx(
              styles.modeTab,
              activeMode === mode.key && styles.modeTabActive
            )}
            onClick={() => handleModeChange(mode.key)}
          >
            <Text className={styles.modeTabIcon}>{mode.icon}</Text>
            <Text
              className={clsx(
                styles.modeTabText,
                activeMode === mode.key && styles.modeTabTextActive
              )}
            >
              {mode.label}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Bottom Navigation
  const renderBottomNav = () => {
    return (
      <View className={styles.bottomNav}>
        <View className={clsx(styles.navItem, styles.navItemActive)}>
          <Text className={styles.navIcon}>💡</Text>
          <Text className={clsx(styles.navLabel, styles.navLabelActive)}>מנורות</Text>
        </View>
        <View className={styles.navItem} onClick={goToTimers}>
          <Text className={styles.navIcon}>⏱️</Text>
          <Text className={styles.navLabel}>טיימר</Text>
        </View>
        <View className={styles.navItem} onClick={goToShabbat}>
          <Text className={styles.navIcon}>🕯️</Text>
          <Text className={styles.navLabel}>שבת</Text>
        </View>
        <View className={styles.navItem} onClick={goToSettings}>
          <Text className={styles.navIcon}>⚙️</Text>
          <Text className={styles.navLabel}>עוד</Text>
        </View>
      </View>
    );
  };

  // ========================================
  // Render
  // ========================================
  return (
    <View className={styles.pageContainer}>
      {/* ===== HEADER BAR ===== */}
      {renderHeader()}

      {/* ===== DEVICE SELECTOR ===== */}
      {renderDeviceSelector()}

      {/* ===== MODE TABS ===== */}
      {renderModeTabs()}

      {/* ===== CONTENT AREA ===== */}
      <ScrollView
        className={styles.contentArea}
        scrollY={scrollEnabled}
        scrollWithAnimation
      >
        <View className={styles.contentWrapper}>
          <View className={styles.dimmerContainer}>
            <Dimmer
              style={{ marginTop: 0 }}                 // 👈 מכווץ את המרווח של ה-Box
              contentClassName={clsx(!power && styles.disabled)}
              setScrollEnabled={setScrollEnabled}
              showTitle={false}
              hideTabs={true}
              mode={activeMode as any}
              colour={colour}
              brightness={brightness}
              temperature={temperature}
              onModeChange={handleModeChange}
              onChange={handleColorChange}
              onRelease={handleRelease}
              onReleaseWhite={handleReleaseWhite}
            />
          </View>
        </View>
      </ScrollView>

      {/* ===== POWER BUTTON ===== */}
      <ControlBar />

      {/* ===== BOTTOM NAV BAR ===== */}
      {renderBottomNav()}
    </View>
  );
}

export default Home;

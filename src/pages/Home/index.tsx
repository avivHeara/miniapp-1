import React, { useState } from 'react';
import { View, Image, Text, ScrollView, router } from '@ray-js/ray';
import clsx from 'clsx';
import {
  useDevice,
  useActions,
  useProps,
  useStructuredActions,
  useStructuredProps,
  useSupport,
} from '@ray-js/panel-sdk';
import { useCreation, useThrottleFn } from 'ahooks';
import { lampSchemaMap } from '@/devices/schema';
import { ControlBar, Button, Dimmer } from '@/components';
import { getCachedSystemInfo } from '@/api/getCachedSystemInfo';
import { devices } from '@/devices';
import Strings from '@/i18n';
import { openScheduleFunctional } from '@/utils/openScheduleFunctional';
import { Box } from '@/components/Box';
import { useSelector } from 'react-redux';
import { selectCollectColors } from '@/redux/modules/cloudStateSlice';
import { ReduxState } from '@/redux';
import { openPowerMemoryFunctional } from '@/utils/openPowerMemoryFunctional';
import { NavBar } from '@ray-js/smart-ui';
import styles from './index.module.less';

const {
  countdown,
  control_data,
  white_gradi_time,
  switch_gradient,
  colour_gradi_time,
  colour_data,
  power_memory,
  do_not_disturb,
} = lampSchemaMap;

const HeaderHeight = 59;

// DP 108 - selected_device (Enum: Device1, Device2, Device3)
const DEVICE_ENUM_VALUES = ['Device1', 'Device2', 'Device3'] as const;

const sysInfo = getCachedSystemInfo();

export function Home() {
  const support = useSupport();
  const deviceName = useDevice(d => d.devInfo.name);
  const deviceId = useDevice(d => d.devInfo.devId);
  const groupId = useDevice(d => d.devInfo.groupId);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  // מצב המגירה
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const dpActions = useActions();
  const dpStructuredActions = useStructuredActions();

  const colour = useStructuredProps(props => props.colour_data);
  const brightness = useProps(props => props.bright_value);
  const temperature = useProps(props => props.temp_value);
  const power = useProps(props => props.switch_led);
  const workMode = useProps(props => props.work_mode);

  // שעון שבת וטיימר
  const shabbatClock = useProps(props => props.shabat_clock);
  const countdownTimer = useProps(props => props.countdown);

  const collectColors = useSelector((state: ReduxState) => selectCollectColors(state, true));
  const collectWhites = useSelector((state: ReduxState) => selectCollectColors(state, false));

  // --- בחירת מנורה (DP 108 + 111–113) ---
  const selectedDevice = useProps(props => props.selected_device);
  const devName1 = useProps(props => props.dev_name_1);
  const devName2 = useProps(props => props.dev_name_2);
  const devName3 = useProps(props => props.dev_name_3);

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

  // Debug ל־console כדי לראות שה-DP מתעדכן
  React.useEffect(() => {
    console.log('[DeviceSelector] DP selected_device changed:', selectedDevice);
    console.log('[DeviceSelector] selectedDeviceIndex =', selectedDeviceIndex);
  }, [selectedDevice, selectedDeviceIndex]);

  // ========================================
  // פונקציות ניווט
  // ========================================
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

  // Toggle שעון שבת
  const toggleShabbatClock = React.useCallback(() => {
    if (dpActions.shabat_clock) {
      dpActions.shabat_clock.set(!shabbatClock, { throttle: 300 });
    }
  }, [dpActions, shabbatClock]);

  // פורמט זמן טיימר
  const formatCountdown = (seconds: number) => {
    if (!seconds || seconds <= 0) return null;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(
      2,
      '0'
    )}`;
  };

  const moreFuncs = useCreation(() => {
    const isGroupDevice = support.isGroupDevice();
    return [
      {
        code: 'powerMemory',
        hidden: !support.isSupportDp(power_memory.code) || isGroupDevice,
        disabled: !power,
        onClick: () => {
          openPowerMemoryFunctional(collectColors, collectWhites);
        },
      },
      {
        code: 'doNotDisturb',
        hidden: !support.isSupportDp(do_not_disturb.code) || isGroupDevice,
        disabled: !power,
        onClick: () => {
          const jumpUrl = `functional://LampNoDisturbFunctional/home?deviceId=${deviceId ||
            ''}&groupId=${groupId || ''}&activeColor=rgb(16, 130, 254)`;
          ty.navigateTo({
            url: jumpUrl,
          });
        },
      },
      {
        code: 'switchGradient',
        hidden:
          (!support.isSupportDp(switch_gradient.code) &&
            !support.isSupportDp(white_gradi_time.code) &&
            !support.isSupportDp(colour_gradi_time.code)) ||
          isGroupDevice,
        disabled: !power,
        onClick: () => {
          const jumpUrl = `functional://LampMutationFunctional/home?deviceId=${deviceId ||
            ''}&groupId=${groupId || ''}`;
          ty.navigateTo({
            url: jumpUrl,
          });
        },
      },
      {
        code: 'schedule',
        hidden: !support.isSupportCloudTimer() && !support.isSupportDp(countdown.code),
        onClick: openScheduleFunctional,
        disabled: false,
      },
    ].filter(item => !item.hidden);
  }, [power, groupId, deviceId, collectColors, collectWhites, support]);

  const handleChangeTab = React.useCallback(
    (val: string) => {
      dpActions.work_mode.set(val, { checkRepeat: false, throttle: 300 });
    },
    [dpActions]
  );

  const handleChangeDevice = React.useCallback(
    (key: string) => {
      console.log('[DeviceSelector] click key =', key);
      if (dpActions.selected_device) {
        dpActions.selected_device.set(key, { checkRepeat: false, throttle: 300 });
      } else {
        console.warn('[DeviceSelector] dpActions.selected_device is not defined');
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

  const handleJump = useThrottleFn(
    (code: string) => {
      router.push(`/${code}`);
    },
    { wait: 80 }
  ).run;

  // ====== לוגיקה של משיכה/סוויפ למגירה ======
  const touchStartY = React.useRef(0);
  const touchLastY = React.useRef(0);

  const handleDrawerTouchStart = React.useCallback((e: any) => {
    const t = e.touches?.[0] || e.changedTouches?.[0] || e.targetTouches?.[0];
    const y = t?.clientY || 0;
    touchStartY.current = y;
    touchLastY.current = y;
  }, []);

  const handleDrawerTouchMove = React.useCallback((e: any) => {
    const t = e.touches?.[0] || e.changedTouches?.[0] || e.targetTouches?.[0];
    const y = t?.clientY || 0;
    touchLastY.current = y;
  }, []);

  const handleDrawerTouchEnd = React.useCallback(() => {
    const diff = touchLastY.current - touchStartY.current;

    // סוויפ קצר → מתעלמים
    if (Math.abs(diff) < 30) {
      return;
    }

    if (diff > 0) {
      // משיכה למטה → סגירה
      setIsDrawerOpen(false);
    } else {
      // משיכה למעלה → פתיחה
      setIsDrawerOpen(true);
    }

    touchStartY.current = 0;
    touchLastY.current = 0;
  }, []);

  const renderDeviceSelector = React.useCallback(() => {
    if (!deviceTabs || deviceTabs.length === 0) return null;

    const itemWidthPercent = 100 / deviceTabs.length;
    const offsetPercent = selectedDeviceIndex * itemWidthPercent;

    return (
      <View className={styles.deviceSelectorWrapper}>
        <View className={styles.deviceSelectorContainer}>
          <View className={styles.deviceSelectorTrack}>
            {/* הגועה הלבנה */}
            <View
              className={styles.deviceSelectorThumb}
              style={{
                width: `${itemWidthPercent}%`,
                left: `${offsetPercent}%`,
              }}
            />

            {/* הטקסטים */}
            {deviceTabs.map((item, index) => (
              <View
                key={item.key}
                className={styles.deviceSelectorItem}
                onClick={() => handleChangeDevice(item.key)}
              >
                <Text
                  className={clsx(
                    styles.deviceSelectorText,
                    index === selectedDeviceIndex && styles.deviceSelectorTextActive
                  )}
                >
                  {item.name}
                </Text>
              </View>
            ))}
          </View>

          {/* כפתור עריכה */}
          <View className={styles.editDevicesBtn} onClick={goToDevices}>
            <Text className={styles.editDevicesBtnText}>✏️</Text>
          </View>
        </View>
      </View>
    );
  }, [deviceTabs, selectedDeviceIndex, handleChangeDevice, goToDevices]);

  // כרטיס שעון שבת
  const renderShabbatCard = React.useCallback(() => {
    return (
      <View className={styles.featureCard}>
        <View className={styles.featureHeader}>
          <Text className={styles.featureIcon}>🕯️</Text>
          <Text className={styles.featureTitle}>שעון שבת</Text>
          <View
            className={clsx(styles.featureToggle, shabbatClock && styles.featureToggleOn)}
            onClick={toggleShabbatClock}
          >
            <Text className={styles.featureToggleText}>
              {shabbatClock ? 'פעיל' : 'כבוי'}
            </Text>
          </View>
        </View>
        <View className={styles.featureBtn} onClick={goToShabbat}>
          <Text className={styles.featureBtnText}>הגדרות שעון שבת ←</Text>
        </View>
      </View>
    );
  }, [shabbatClock, toggleShabbatClock, goToShabbat]);

  // כרטיס טיימר
  const renderTimerCard = React.useCallback(() => {
    const formattedTime = formatCountdown(countdownTimer);

    return (
      <View className={styles.featureCard}>
        <View className={styles.featureHeader}>
          <Text className={styles.featureIcon}>⏲️</Text>
          <Text className={styles.featureTitle}>טיימר</Text>
        </View>
        {formattedTime && (
          <Text className={styles.timerCountdown}>כיבוי בעוד: {formattedTime}</Text>
        )}
        <View className={styles.featureBtn} onClick={goToTimers}>
          <Text className={styles.featureBtnText}>הגדרות טיימר ←</Text>
        </View>
      </View>
    );
  }, [countdownTimer, goToTimers]);

  const renderMore = React.useCallback(() => {
    return (
      <Box contentClassName={styles.row} title={Strings.getLang('more')}>
        {moreFuncs.map((item, index) => {
          return (
            <Button
              key={item.code}
              className={clsx(styles.greyCard, styles.item)}
              disabled={item.disabled}
              style={{
                marginRight: moreFuncs.length > 1 && index % 2 === 0 ? 14 : 0,
              }}
              onClick={item.onClick || (() => handleJump(item.code))}
            >
              <Text className={styles.funcTitle}>{Strings.getLang(item.code as any)}</Text>
              <Image
                style={{ width: 48, height: 48, marginRight: 12 }}
                src={`/images/setting_${item.code}.png`}
              />
            </Button>
          );
        })}
      </Box>
    );
  }, [moreFuncs, handleJump]);

  // ====== המגירה התחתונה בצורת המגרעת ======
  const renderBottomDrawer = React.useCallback(() => {
    return (
      <>
        {/* מסכה כהה מאחורי המגירה */}
        <View
          className={clsx(styles.drawerMask, isDrawerOpen && styles.drawerMaskVisible)}
          onClick={() => setIsDrawerOpen(false)}
        />

        {/* המגירה עצמה – יוצאת מעל ה-ControlBar */}
        <View
          className={clsx(styles.bottomDrawer, isDrawerOpen && styles.bottomDrawerOpen)}
        >
          {/* החלק העליון עם הצורה של המגרעת */}
          <View
            className={styles.drawerHeader}
            onClick={() => setIsDrawerOpen(prev => !prev)}
            onTouchStart={handleDrawerTouchStart}
            onTouchMove={handleDrawerTouchMove}
            onTouchEnd={handleDrawerTouchEnd}
          >
            <Image
              className={styles.drawerHeaderBg}
              mode="widthFix"
              src="/images/drawer_top.png" // ← התמונה הלבנה עם המגרעת
            />
          </View>

          {/* התוכן הפנימי של המגירה */}
          <ScrollView scrollY className={styles.drawerContent}>
            <View className={styles.featuresContainer}>
              {renderShabbatCard()}
              {renderTimerCard()}
            </View>

            {moreFuncs.length > 0 && renderMore()}
            <View style={{ height: '40rpx' }} />
          </ScrollView>
        </View>
      </>
    );
  }, [
    isDrawerOpen,
    handleDrawerTouchStart,
    handleDrawerTouchMove,
    handleDrawerTouchEnd,
    renderShabbatCard,
    renderTimerCard,
    renderMore,
    moreFuncs.length,
  ]);

  return (
    <View className={styles.view}>
      {/* NavBar עם כפתור הגדרות */}
      <NavBar
        leftTextType="title"
        leftText={deviceName}
        rightText="⚙️"
        onClickRight={goToSettings}
      />

      <ScrollView
        scrollY={scrollEnabled && !isDrawerOpen}
        refresherTriggered
        style={{
          height: `calc(100vh - ${HeaderHeight}px - ${ControlBar.height}px - ${sysInfo.statusBarHeight}px)`,
          marginTop: '32rpx',
        }}
      >
        <View className={styles.ltrContainer}>
          {renderDeviceSelector()}

          <Dimmer
            contentClassName={clsx(!power && styles.disabled)}
            setScrollEnabled={setScrollEnabled}
            showTitle
            mode={workMode as any}
            colour={colour}
            brightness={brightness}
            temperature={temperature}
            onModeChange={handleChangeTab}
            onChange={handleColorChange}
            onRelease={handleRelease}
            onReleaseWhite={handleReleaseWhite}
          />
        </View>
      </ScrollView>

      {/* המגירה החדשה בצורת המגרעת */}
      {renderBottomDrawer()}

      {/* ControlBar המקורי עם הכפתור הכתום והמגרעת הכחולה */}
      <ControlBar />
    </View>
  );
}

export default Home;

import { isUndefined } from 'lodash-es';
import { View, Text } from '@ray-js/ray';
import clsx from 'clsx';
import { useProps, useSupport, utils } from '@ray-js/panel-sdk';
import React from 'react';
import { useThrottleFn } from 'ahooks';
import LampTempSlider from '@ray-js/lamp-temp-slider';
import LampBrightSlider from '@ray-js/lamp-bright-slider';
import { lampSchemaMap } from '@/devices/schema';
import Strings from '@/i18n';
import styles from './index.module.less';

const { bright_value, temp_value } = lampSchemaMap;

interface IProps {
  style?: React.CSSProperties;
  className?: string;
  temperature?: number;
  brightness?: number;
  onRelease: (code: string, value: number) => void;
  onChange?: (isColor: boolean, value: { temperature: number; brightness: number }) => void;
  setScrollEnabled?: (v: boolean) => void;
}

export const White = (props: IProps) => {
  const { style, className, onRelease, onChange, setScrollEnabled } = props;
  const support = useSupport();
  const brightnessDp = useProps(dpState => dpState.bright_value);
  const temperatureDp = useProps(dpState => dpState.temp_value);

  const brightness = isUndefined(props.brightness) ? brightnessDp : props.brightness;
  const temperature = isUndefined(props.temperature) ? temperatureDp : props.temperature;

  const isTouching = React.useRef(false);

  const handleTouchStart = React.useCallback(() => {
    isTouching.current = true;
  }, []);

  // הורדת throttle ל-16ms (60fps) לתגובה מהירה
  const handleChange = useThrottleFn(
    (key, value) => {
      if (isTouching.current) setScrollEnabled?.(false);
      if (key === 'temp') onChange?.(false, { temperature: value, brightness });
      else onChange?.(false, { temperature, brightness: value });
    },
    { wait: 16 }  // היה 80, עכשיו 16
  ).run;

  const handleWhiteRelease = useThrottleFn(
    (code, value) => {
      isTouching.current = false;
      setScrollEnabled?.(true);
      onRelease?.(code, value);
    },
    { wait: 16 }  // היה 80, עכשיו 16
  ).run;

  // חישוב אחוזים
  const temperaturePercent = Math.round(utils.calcPosition(temperature, 0, 1000, 0, 100));
  const brightnessPercent = Math.round(utils.calcPosition(brightness, 10, 1000, 1, 100));

  // חישוב טמפרטורה בקלווין (2700K - 6500K)
  const temperatureKelvin = Math.round(2700 + (temperaturePercent / 100) * (6500 - 2700));

  // חישוב תווית טמפרטורה (Warm/Cool/Neutral)
  const getTempLabel = () => {
    if (temperatureKelvin > 6500) return ' Cool ';
    if (temperatureKelvin > 3500) return ' Neutral ';
    return ' Warm ';
  };

  // Track styles - matched to wrapper dimensions
  const trackStyle = {
    width: '100%',
    height: '100rpx',
    borderRadius: '60rpx',
    background: 'transparent', // Transparent to show custom wrapper background
  };

  // Metallic 3D thumb with radial gradient
  const thumbStyle = {
    width: '68rpx',
    height: '68rpx',
    borderRadius: '50%',
    border: 'none',
    background: 'radial-gradient(circle at 30% 30%, #ffffff 0%, #d0d0d0 60%, #a0a0a0 100%)',
    boxShadow: '0 0 30rpx 4rpx rgba(255, 255, 255, 0.8), 0 8rpx 16rpx rgba(0,0,0,0.6), inset -4rpx -4rpx 10rpx rgba(0,0,0,0.3)',
  };

  return (
    <View style={style} className={clsx(styles.container, className || '')}>
      {/* === BRIGHTNESS SLIDER === */}
      {support.isSupportBright() && (
        <View className={styles.sliderCard}>
          <View className={styles.sliderHeader}>
            <Text className={styles.label}>{Strings.getLang('brightness')}</Text>
            <Text className={styles.value}>{brightnessPercent}%</Text>
          </View>
          <View
            className={styles.brightnessWrapper}
            style={{
              '--progress': `${brightnessPercent}%`,
            } as React.CSSProperties}
          >
            <View className={styles.sliderContent}>
              <LampBrightSlider
                value={brightness}
                trackStyle={trackStyle}
                thumbStyle={thumbStyle}
                activeThumbStyle={thumbStyle}
                onTouchStart={handleTouchStart}
                onTouchMove={bright => handleChange('bright', bright)}
                onTouchEnd={bright => handleWhiteRelease(bright_value.code, bright)}
              />
            </View>
          </View>
        </View>
      )}

      {/* === TEMPERATURE SLIDER === */}
      {support.isSupportTemp() && (
        <View className={styles.sliderCard}>
          <View className={styles.sliderHeader}>
            <Text className={styles.label}>{Strings.getLang('temp')}</Text>
            <Text className={styles.valueTemp}>
              {temperatureKelvin}K - {getTempLabel()}
            </Text>
          </View>
          <View
            className={styles.temperatureWrapper}
            style={{
              '--progress': `${temperaturePercent}%`,
            } as React.CSSProperties}
          >
            <View className={styles.sliderContent}>
              <LampTempSlider
                value={temperature}
                trackStyle={trackStyle}
                thumbStyle={thumbStyle}
                activeThumbStyle={thumbStyle}
                onTouchStart={handleTouchStart}
                onTouchMove={temp => handleChange('temp', temp)}
                onTouchEnd={temp => handleWhiteRelease(temp_value.code, temp)}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

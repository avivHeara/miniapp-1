import { isUndefined } from 'lodash-es';
import { View, Text } from '@ray-js/ray';
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
  temperature?: number;
  brightness?: number;
  onRelease: (code: string, value: number) => void;
  onChange?: (isColor: boolean, value: { temperature: number; brightness: number }) => void;
  setScrollEnabled?: (v: boolean) => void;
}

export const White = (props: IProps) => {
  const { style, onRelease, onChange, setScrollEnabled } = props;
  const support = useSupport();
  const brightnessDp = useProps(dpState => dpState.bright_value);
  const temperatureDp = useProps(dpState => dpState.temp_value);

  const brightness = isUndefined(props.brightness) ? brightnessDp : props.brightness;
  const temperature = isUndefined(props.temperature) ? temperatureDp : props.temperature;

  const isTouching = React.useRef(false);

  const handleTouchStart = React.useCallback(() => {
    isTouching.current = true;
  }, []);

  const handleChange = useThrottleFn(
    (key, value) => {
      if (isTouching.current) setScrollEnabled?.(false);
      if (key === 'temp') onChange?.(false, { temperature: value, brightness });
      else onChange?.(false, { temperature, brightness: value });
    },
    { wait: 80 }
  ).run;

  const handleWhiteRelease = useThrottleFn(
    (code, value) => {
      isTouching.current = false;
      setScrollEnabled?.(true);
      onRelease?.(code, value);
    },
    { wait: 80 }
  ).run;

  // חישוב אחוזים
  const temperaturePercent = Math.round(utils.calcPosition(temperature, 0, 1000, 0, 100));
  const brightnessPercent = Math.round(utils.calcPosition(brightness, 10, 1000, 1, 100));

  // חישוב טמפרטורה בקלווין (2700K - 6500K)
  const temperatureKelvin = Math.round(2700 + (temperaturePercent / 100) * (6500 - 2700));

  // חישוב תווית טמפרטורה (Warm/Cool)
  const getTempLabel = () => {
    if (temperatureKelvin < 3500) return 'Warm';
    if (temperatureKelvin > 5000) return 'Cool';
    return '';
  };

  // Track styles מותאמים
  const trackStyle = {
    width: '100%',
    height: '120rpx',
    borderRadius: '60rpx',
  };

  const thumbStyle = {
    width: '88rpx',
    height: '88rpx',
    borderRadius: '50%',
    backgroundColor: '#ffffff',
    boxShadow: '0 0 30px 8px rgba(255, 255, 255, 0.9)',
  };

  return (
    <View style={style} className={styles.container}>
      {/* === BRIGHTNESS SLIDER === */}
      {support.isSupportBright() && (
        <View className={styles.sliderCard}>
          <View className={styles.sliderHeader}>
            <Text className={styles.label}>{Strings.getLang('brightness')}</Text>
            <Text className={styles.value}>{brightnessPercent}%</Text>
          </View>
          <View 
            className={styles.sliderWrapper}
            style={{
              '--progress': `${brightnessPercent}%`,
            } as React.CSSProperties}
          >
            <View className={styles.brightnessTrack}>
              <View 
                className={styles.brightnessFill}
                style={{ width: `${brightnessPercent}%` }}
              />
            </View>
            {/* Thumb indicator */}
            <View 
              className={styles.thumbIndicator}
              style={{ left: `${brightnessPercent}%` }}
            />
            <View className={styles.sliderInput}>
              <LampBrightSlider
                value={brightness}
                trackStyle={trackStyle}
                thumbStyle={thumbStyle}
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
              {temperatureKelvin}K {getTempLabel()}
            </Text>
          </View>
          <View 
            className={styles.sliderWrapper}
            style={{
              '--progress': `${temperaturePercent}%`,
            } as React.CSSProperties}
          >
            <View className={styles.temperatureTrack}>
              <View 
                className={styles.temperatureFill}
                style={{ width: `${temperaturePercent}%` }}
              />
            </View>
            {/* Thumb indicator */}
            <View 
              className={styles.thumbIndicator}
              style={{ left: `${temperaturePercent}%` }}
            />
            <View className={styles.sliderInput}>
              <LampTempSlider
                value={temperature}
                trackStyle={trackStyle}
                thumbStyle={thumbStyle}
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

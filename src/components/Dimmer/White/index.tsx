import { isUndefined } from 'lodash-es';
import { View, Text } from '@ray-js/ray';
import { useProps, useSupport, utils } from '@ray-js/panel-sdk';
import React from 'react';
import { useThrottleFn } from 'ahooks';
import LampTempSlider from '@ray-js/lamp-temp-slider';
import LampBrightSlider from '@ray-js/lamp-bright-slider';
import { lampSchemaMap } from '@/devices/schema';
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

export const White: React.FC<IProps> = props => {
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
    (key: 'temp' | 'bright', value: number) => {
      if (isTouching.current) {
        setScrollEnabled?.(false);
      }

      if (key === 'temp') {
        onChange?.(false, { temperature: value, brightness });
      } else {
        onChange?.(false, { temperature, brightness: value });
      }
    },
    { wait: 80 }
  ).run;

  const handleWhiteRelease = useThrottleFn(
    (code: string, value: number) => {
      isTouching.current = false;
      setScrollEnabled?.(true);
      onRelease?.(code, value);
    },
    { wait: 80 }
  ).run;

  // סליידר – גודל ורוחב
  const trackStyle = {
    width: '100%',
    height: '44rpx', // נמוך יותר, מודרני
    borderRadius: '999rpx',
  };

  const thumbStyle = {
    width: '60rpx',
    height: '60rpx',
    borderRadius: '100%',
  };

  // בהירות באחוזים
  const brightnessPercent = Math.round(utils.calcPosition(brightness, 10, 1000, 1, 100));

  // טמפרטורה – 0–1000 -> 2700K–6500K
  const minKelvin = 2700;
  const maxKelvin = 6500;
  const temperatureKelvinRaw = utils.calcPosition(temperature, 0, 1000, minKelvin, maxKelvin);
  const temperatureKelvin = Math.round(temperatureKelvinRaw / 50) * 50;
  const temperatureLabel = temperatureKelvin < 4000 ? 'חם' : 'קר';

  return (
    <View style={style} className={styles.container}>
      {/* בהירות */}
      {support.isSupportBright() && (
        <View className={styles.card}>
          <View className={styles.textBox}>
            <Text className={styles.label}>בהירות</Text>
            <Text className={styles.value}>{`${brightnessPercent}%`}</Text>
          </View>
          <LampBrightSlider
            value={brightness}
            trackStyle={trackStyle}
            thumbStyle={thumbStyle}
            onTouchStart={handleTouchStart}
            onTouchMove={bright => handleChange('bright', bright)}
            onTouchEnd={bright => handleWhiteRelease(bright_value.code, bright)}
          />
        </View>
      )}

      {/* טמפרטורה */}
      {support.isSupportTemp() && (
        <View className={styles.card}>
          <View className={styles.textBox}>
            <Text className={styles.label}>טמפרטורה</Text>
            <Text className={styles.value}>{`${temperatureKelvin}K ${temperatureLabel}`}</Text>
          </View>
          <LampTempSlider
            value={temperature}
            trackStyle={trackStyle}
            thumbStyle={thumbStyle}
            onTouchStart={handleTouchStart}
            onTouchMove={temp => handleChange('temp', temp)}
            onTouchEnd={temp => handleWhiteRelease(temp_value.code, temp)}
          />
        </View>
      )}
    </View>
  );
};

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

    const [localBrightness, setLocalBrightness] = React.useState(brightness);
    const [localTemperature, setLocalTemperature] = React.useState(temperature);
    const isTouching = React.useRef(false);

    // Sync local state when props change, but only if not currently touching
    React.useEffect(() => {
        if (!isTouching.current) {
            setLocalBrightness(brightness);
            setLocalTemperature(temperature);
        }
    }, [brightness, temperature]);

    const handleTouchStart = React.useCallback(() => {
        isTouching.current = true;
    }, []);

    // Throttle only the external communication
    const throttledOnChange = useThrottleFn(
        (isColor, data) => {
            onChange?.(isColor, data);
        },
        { wait: 200 }
    ).run;

    const handleChange = (key: 'temp' | 'bright', value: number) => {
        if (isTouching.current) setScrollEnabled?.(false);

        if (key === 'temp') {
            setLocalTemperature(value);
            throttledOnChange(false, { temperature: value, brightness: localBrightness });
        } else {
            setLocalBrightness(value);
            throttledOnChange(false, { temperature: localTemperature, brightness: value });
        }
    };

    const handleWhiteRelease = (code: string, value: number) => {
        isTouching.current = false;
        setScrollEnabled?.(true);
        // Important: Update local state one last time and send final value immediately
        if (code === bright_value.code) setLocalBrightness(value);
        if (code === temp_value.code) setLocalTemperature(value);
        onRelease?.(code, value);
    };

    const temperaturePercent = Math.round(utils.calcPosition(localTemperature, 0, 1000, 0, 100));
    const brightnessPercent = Math.round(utils.calcPosition(localBrightness, 10, 1000, 1, 100));

    const temperatureKelvin = Math.round(2700 + (temperaturePercent / 100) * (6500 - 2700));

    const getTempLabel = () => {
        if (temperatureKelvin > 6500) return ' Cool ';
        if (temperatureKelvin > 3500) return ' Neutral ';
        return ' Warm ';
    };

    const trackStyle = {
        width: '100%',
        height: '100rpx',
        borderRadius: '60rpx',
        background: 'transparent',
    };

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
            {support.isSupportBright() && (
                <View className={styles.sliderCard}>
                    <View className={styles.sliderHeader}>
                        <Text className={styles.label}>{Strings.getLang('brightness')}</Text>
                        <Text className={styles.value}>{brightnessPercent}%</Text>
                    </View>
                    <View className={styles.brightnessWrapper}>
                        <View className={styles.sliderContent}>
                            {/* @ts-ignore */}
                            <LampBrightSlider
                                value={localBrightness}
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

            {support.isSupportTemp() && (
                <View className={styles.sliderCard}>
                    <View className={styles.sliderHeader}>
                        <Text className={styles.label}>{Strings.getLang('temp')}</Text>
                        <Text className={styles.valueTemp}>
                            {temperatureKelvin}K - {getTempLabel()}
                        </Text>
                    </View>
                    <View className={styles.temperatureWrapper}>
                        <View className={styles.sliderContent}>
                            {/* @ts-ignore */}
                            <LampTempSlider
                                value={localTemperature}
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

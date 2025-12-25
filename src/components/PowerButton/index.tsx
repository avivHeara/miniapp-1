import React from 'react';
import clsx from 'clsx';
import { View, Image, Text } from '@ray-js/ray';
import { useActions, useProps } from '@ray-js/panel-sdk';
import styles from './index.module.less';

export const PowerButton = () => {
    const actions = useActions();
    const isOn = useProps((props) => props.switch_led ?? false);
    const [isPressed, setIsPressed] = React.useState(false);

    const handleTouchStart = React.useCallback(() => {
        setIsPressed(true);
    }, []);

    const handleTouchEnd = React.useCallback(() => {
        setIsPressed(false);
    }, []);

    const handleClick = React.useCallback(
        (e) => {
            e?.origin?.stopPropagation();
            actions.switch_led.toggle({ throttle: 300 });
        },
        [actions]
    );

    return (
        <View className={styles.container}>
            <View
                className={clsx(
                    styles.powerBox,
                    isOn ? styles.powerOn : styles.powerOff,
                    { [styles.touching]: isPressed }
                )}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={handleClick}
            >
                <Image src="/images/power.png" className={styles.powerBtn} />
            </View>
        </View>
    );
};

PowerButton.height = 103;

import React from 'react';
import clsx from 'clsx';
import { View, Image } from '@ray-js/ray';
import { useActions, useProps } from '@ray-js/panel-sdk';
import styles from './index.module.less';

export const PowerButton = () => {
    const actions = useActions();
    const isOn = useProps((props) => props.switch_led ?? false);
    const [isPressed, setIsPressed] = React.useState(false);

    const handleClick = React.useCallback(
        (e) => {
            console.log('⚡ PowerButton Pressed! Current state:', isOn);
            // In Ray, stopPropagation is often under origin
            if (e?.origin?.stopPropagation) e.origin.stopPropagation();
            else if (e?.stopPropagation) e.stopPropagation();

            if (actions.switch_led) {
                actions.switch_led.set(!isOn, { checkRepeat: false });
            } else {
                console.error('❌ switch_led action not found!');
            }
        },
        [actions, isOn]
    );

    const handleTouchStart = React.useCallback(() => {
        console.log('👆 PowerButton Touch Start');
        setIsPressed(true);
    }, []);

    const handleTouchEnd = React.useCallback(() => {
        console.log('👇 PowerButton Touch End');
        setIsPressed(false);
    }, []);

    return (
        <View className={styles.container} style={{ pointerEvents: 'none' }}>
            <View
                className={clsx(
                    styles.powerBox,
                    isOn ? styles.powerOn : styles.powerOff,
                    { [styles.touching]: isPressed }
                )}
                style={{ pointerEvents: 'auto' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                // @ts-ignore
                onTap={handleClick}
                onClick={handleClick}
            >
                <Image src="/images/power.png" className={styles.powerBtn} />
            </View>
        </View>
    );
};

PowerButton.height = 103;

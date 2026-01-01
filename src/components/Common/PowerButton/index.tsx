import React from 'react';
import clsx from 'clsx';
import { View, Image } from '@ray-js/ray';
import { useActions, useProps } from '@ray-js/panel-sdk';
import styles from './index.module.less';

export const PowerButton = () => {
    const actions = useActions();
    const hardwareIsOn = useProps((props) => props.switch_led ?? false);
    const [localIsOn, setLocalIsOn] = React.useState(hardwareIsOn);
    const [isPressed, setIsPressed] = React.useState(false);
    const isToggling = React.useRef(false);

    // Sync local state when hardware state changes, unless we are currently toggling
    React.useEffect(() => {
        if (!isToggling.current) {
            setLocalIsOn(hardwareIsOn);
        }
    }, [hardwareIsOn]);

    const handleClick = React.useCallback(
        (e) => {
            const newState = !localIsOn;
            console.log('⚡ PowerButton Pressed! Optimistic update to:', newState);

            if (e?.origin?.stopPropagation) e.origin.stopPropagation();
            else if (e?.stopPropagation) e.stopPropagation();

            if (actions.switch_led) {
                isToggling.current = true;
                setLocalIsOn(newState);
                actions.switch_led.set(newState, { checkRepeat: false });

                // Allow hardware sync after a delay to account for network latency
                setTimeout(() => {
                    isToggling.current = false;
                }, 1000);
            } else {
                console.error('❌ switch_led action not found!');
            }
        },
        [actions, localIsOn]
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
                    localIsOn ? styles.powerOn : styles.powerOff,
                    { [styles.touching]: isPressed }
                )}
                style={{ pointerEvents: 'auto' }}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                // @ts-ignore
                onTap={handleClick}
                onClick={handleClick}
            >
                <Image src="/images/icon/power.png" className={styles.powerBtn} />
            </View>
        </View>
    );
};

PowerButton.height = 103;

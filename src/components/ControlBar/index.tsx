import React from 'react';
import clsx from 'clsx';
import { View, Image } from '@ray-js/ray';
import { useActions, useProps } from '@ray-js/panel-sdk';
import { Button } from '../Button';
import styles from './index.module.less';

export const ControlBar = () => {
  const actions = useActions();

  // קבלת מצב ההדלקה
  const isOn = useProps((props) => props.switch_led ?? false);

  const handleTogglePower = React.useCallback(() => {
    actions.switch_led.toggle({ throttle: 300 });
  }, []);

  return (
    <View className={styles.container}>
      <Image className={styles.bg} mode="aspectFill" src="/images/bottom_dark.png" />
      <Button
        img="/images/power.png"
        onClick={handleTogglePower}
        imgClassName={styles.powerBtn}
        className={clsx(styles.powerBox, isOn ? styles.powerOn : styles.powerOff)}
      />
    </View>
  );
};

ControlBar.height = 103;
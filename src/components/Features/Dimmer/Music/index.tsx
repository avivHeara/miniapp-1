import { find } from 'lodash-es';
import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useUnmount } from 'ahooks';
import { View, Text, Image } from '@ray-js/ray';
import { useProps, utils, kit, useStructuredActions } from '@ray-js/panel-sdk';
import clsx from 'clsx';
import defaultConfig from '@/config/default';
import styles from './index.module.less';

const { defaultAppMusicList } = defaultConfig;
const { onMusic2RgbChange, offMusic2RgbChange } = kit.music2rgb;

const safeCall = (fn: () => any) => {
    try {
        const res = fn();
        if (res && typeof res.then === 'function' && typeof res.catch === 'function') {
            res.catch((e: any) => {
                console.warn('Music sync not supported or failed:', e);
            });
        }
    } catch (e) {
        console.warn('Music sync not supported or failed:', e);
    }
};

const musicKey = ['music', 'romance', 'game'] as const;

interface Props {
    style?: React.CSSProperties;
}

export const Music: React.FC<Props> = ({ style }) => {
    const [activeId, setActiveId] = useState(-1);
    const power = useProps(dpState => dpState.switch_led);
    const work_mode = useProps(dpState => dpState.work_mode);
    const actions = useStructuredActions();

    const handleMusic2RgbChange = useCallback((id: number) => {
        const mode = find<MusicConfig>(defaultAppMusicList, d => d.id === id)?.mode ?? 0;
        safeCall(() => {
            onMusic2RgbChange(data => {
                const musicData = {
                    mode,
                    hue: data.hue,
                    saturation: data.saturation,
                    value: data.value,
                    brightness: 0,
                    temperature: 0,
                };
                actions.music_data.set(musicData);
            });
        });
    }, []);

    useEffect(() => {
        if (!power || work_mode !== 'music' || activeId === -1) {
            setActiveId(-1);
            safeCall(() => offMusic2RgbChange());
            return;
        }
        handleMusic2RgbChange(activeId);
    }, [power, activeId, work_mode]);

    useUnmount(() => {
        safeCall(() => offMusic2RgbChange());
    });

    const appMusicList = useMemo(
        () =>
            musicKey.map((item, index) => {
                const musicNameMap: Record<string, string> = {
                    'music': 'קצב מוזיקה',
                    'romance': 'רומנטי',
                    'game': 'משחק'
                };
                return {
                    id: index,
                    icon: `/images/music_${item}.png`,
                    title: musicNameMap[item] || item,
                };
            }),
        []
    );

    const handlePlay = React.useCallback(
        (item: typeof appMusicList[number]) => () => {
            setActiveId(activeId === item.id ? -1 : item.id);
        },
        [activeId]
    );

    return (
        <View style={style} className={styles.list}>
            <View className={styles.content}>
                {appMusicList.map(item => (
                    <View
                        key={item.id}
                        className={clsx(styles.card, activeId === item.id && styles.cardActive)}
                        onClick={handlePlay(item)}
                    >
                        <Image className={styles.icon} src={item.icon} />
                        <Text className={styles.title}>{item.title}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

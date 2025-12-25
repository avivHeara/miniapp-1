import { View } from '@ray-js/ray';
import React from 'react';
import clsx from 'clsx';
import styles from './index.module.less';

interface Props {
    className?: string;
    contentClassName?: string;
    style?: React.CSSProperties;
    title: string;
    /** האם הרקע של ה-Box יהיה שקוף */
    transparent?: boolean;
}

export const Box: React.FC<Props> = ({
    className,
    contentClassName,
    style,
    title,
    transparent = false,
    children,
}) => {
    return (
        <View
            className={clsx(styles.box, { [styles.transparent]: transparent }, className)}
            style={style}
        >
            {title ? <View className={styles.title}>{title}</View> : null}
            <View className={contentClassName}>{children}</View>
        </View>
    );
};

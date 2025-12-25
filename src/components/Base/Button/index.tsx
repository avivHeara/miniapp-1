import React from 'react';
import clsx from 'clsx';
import { View } from '@ray-js/ray';
import styles from './index.module.less';

interface ButtonProps {
    id?: string;
    img?: string;
    style?: React.CSSProperties;
    className?: string;
    imgClassName?: string;
    disabled?: boolean;
    onClick?: () => void;
    onTouchStart?: () => void;
    onTouchEnd?: () => void;
    children?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    id,
    img,
    style,
    className,
    imgClassName,
    disabled = false,
    onClick,
    onTouchStart,
    onTouchEnd,
    children,
}) => {
    const [isPressed, setIsPressed] = React.useState(false);

    const handleTouchStart = React.useCallback(() => {
        setIsPressed(true);
        onTouchStart?.();
    }, [onTouchStart]);

    const handleTouchEnd = React.useCallback(() => {
        setIsPressed(false);
        onTouchEnd?.();
    }, [onTouchEnd]);

    const handleClick = React.useCallback(
        (e: any) => {
            if (disabled) return;
            e?.origin?.stopPropagation();
            onClick?.();
        },
        [disabled, onClick]
    );

    return (
        <View
            id={id}
            className={clsx(
                className,
                styles.button,
                {
                    [styles.touching]: isPressed,
                    [styles.disabled]: disabled,
                }
            )}
            style={style}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onClick={handleClick}
        >
            {img && <img src={img} className={imgClassName} alt="" />}
            {children}
        </View>
    );
};

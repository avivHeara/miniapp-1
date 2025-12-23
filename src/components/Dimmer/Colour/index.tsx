import { isUndefined } from 'lodash-es';
import React, { useMemo } from 'react';
import { View, Text } from '@ray-js/ray';
import { useStructuredProps, useSupport } from '@ray-js/panel-sdk';
import { useThrottleFn } from 'ahooks';
import { LampCirclePickerColor } from '@ray-js/components-ty-lamp';

import Strings from '@/i18n';
import { lampSchemaMap } from '@/devices/schema';
import styles from './index.module.less';

const { colour_data } = lampSchemaMap;

interface IProps {
  style?: React.CSSProperties;
  /**
   * 彩光值，不传则默认使用 DP colour_data
   */
  colour?: COLOUR;
  onRelease: (code: string, value: COLOUR) => void;
  onChange?: (isColor: boolean, value: COLOUR) => void;
  setScrollEnabled?: (v: boolean) => void;
  currentLampName?: string;
}

// Mock Data Initial State
const otherLampsInitial = [
  { id: '1', name: 'מנורה 1', hue: 0, saturation: 1000, value: 1000 },
  { id: '3', name: 'מנורה 3', hue: 120, saturation: 800, value: 900 },
];

const WHEEL_RADIUS = 165;

export const Colour = (props: IProps) => {
  const { style, onRelease, onChange, setScrollEnabled, currentLampName = 'מנורה 2' } = props;

  const support = useSupport();
  const colourDp = useStructuredProps(dpState => dpState.colour_data);
  const colour = isUndefined(props.colour) ? colourDp : props.colour;
  const isTouching = React.useRef(false);
  const [isDragging, setIsDragging] = React.useState(false);

  // State for other lamps
  const [otherLamps, setOtherLamps] = React.useState(otherLampsInitial);
  // Refs for dragging logic
  const dragStartRef = React.useRef<{ id: string; startX: number; startY: number; initialPos: { x: number; y: number } } | null>(null);

  // Helper to convert HSV to x,y relative to center
  const getPosFromHS = (h: number, s: number) => {
    // h is 0-360, s is 0-1000
    const angle = (h * Math.PI) / 180;
    const dist = (s / 1000) * WHEEL_RADIUS;
    // Note: LampCirclePickerColor usually has Red at 0 deg (right or top?).
    // Typically Canvas standard is 0 = Right, 90 = Bottom.
    // CSS standard might be different.
    // We might need to adjust based on visual testing. Assuming standard polar.
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;
    return { x, y };
  };

  // Helper convert x,y to HS
  const getHSFromPos = (x: number, y: number) => {
    const dist = Math.sqrt(x * x + y * y);
    const clampedDist = Math.min(dist, WHEEL_RADIUS);
    let angle = Math.atan2(y, x); // radians -PI to PI
    if (angle < 0) angle += 2 * Math.PI; // 0 to 2PI

    const h = (angle * 180) / Math.PI;
    const s = (clampedDist / WHEEL_RADIUS) * 1000;
    return { h, s };
  };

  // Helper to get CSS color from HSV (s is 0-1000)
  // Center (s=0) should be White (L=100%). Edge (s=1000) should be Color (L=50%).
  const getColorString = (h: number, s: number) => {
    const lightness = 100 - (s / 1000 * 50);
    return `hsl(${h}, 100%, ${lightness}%)`;
  };

  const handleMarkerTouchStart = (id: string) => (e: any) => {
    console.log('👆 Marker Touch Start:', id);
    // e.touches[0]
    const touch = e.touches[0] || e.changedTouches[0];
    const lamp = otherLamps.find(l => l.id === id);
    if (!lamp) return;

    const initialPos = getPosFromHS(lamp.hue, lamp.saturation);
    dragStartRef.current = {
      id,
      startX: touch.pageX,
      startY: touch.pageY,
      initialPos,
    };
    if (setScrollEnabled) setScrollEnabled(false);
  };

  const handleMarkerTouchMove = (e: any) => {
    if (!dragStartRef.current) return;
    const { id, startX, startY, initialPos } = dragStartRef.current;
    const touch = e.touches[0] || e.changedTouches[0];

    const dx = touch.pageX - startX;
    const dy = touch.pageY - startY;

    const newX = initialPos.x + dx;
    const newY = initialPos.y + dy;

    const { h, s } = getHSFromPos(newX, newY);

    setOtherLamps(prev => prev.map(l => {
      if (l.id === id) {
        return { ...l, hue: h, saturation: s };
      }
      return l;
    }));
  };

  const handleMarkerTouchEnd = () => {
    console.log('👆 Marker Touch End');
    dragStartRef.current = null;
    if (setScrollEnabled) setScrollEnabled(true);
  };

  const handleColourMove = useThrottleFn(
    (v: any, type?: keyof COLOUR) => {
      if (isTouching.current) setScrollEnabled?.(false);
      let newColorData;
      if (typeof v === 'object') {
        newColorData = { ...colour, hue: v.hue, saturation: v.s };
        setIsDragging(true);
      } else if (type) {
        newColorData = { ...colour, [type]: v };
      }

      if (newColorData) {
        onChange?.(true, newColorData);
      }
    },
    { wait: 80 }
  ).run;

  const handleColourEnd = React.useCallback(
    (v: any, type?: keyof COLOUR) => {
      setIsDragging(false);
      setScrollEnabled?.(true);
      let newColorData;
      if (typeof v === 'object') {
        newColorData = { ...colour, hue: v.hue, saturation: v.s };
      } else if (type) {
        newColorData = { ...colour, [type]: v };
      }
      if (newColorData) {
        onRelease?.(colour_data.code, newColorData);
      }
    },
    [colour]
  );

  const handleWheelMove = (v: { h: number; s: number }) => {
    handleColourMove({ hue: v.h, s: v.s });
  };

  const handleWheelEnd = (v: { h: number; s: number }) => {
    handleColourEnd({ hue: v.h, s: v.s });
  };


  const handleTouchStart = React.useCallback(
    (type: 'hue' | 'saturation' | 'value' | 'wheel') => {
      return () => {
        isTouching.current = true;
        if (type === 'wheel') setIsDragging(true);
      };
    },
    [colour]
  );

  const handleTouchEnd = React.useCallback(
    (type: 'hue' | 'saturation' | 'value' | 'wheel') => {
      return (v: any) => {
        isTouching.current = false;
        if (type === 'wheel') {
          setIsDragging(false);
          handleColourEnd(v);
        } else {
          handleColourEnd(v, type as keyof COLOUR);
        }
      };
    },
    [colour]
  );

  // Calculate current lamp position for the custom pin
  const currentPos = getPosFromHS(colour?.hue || 0, colour?.saturation || 0);

  // if (support.isSupportColour())
  return (
    <View style={style} className={styles.container}>
      <View className={styles.wheelContainer} style={{ width: WHEEL_RADIUS * 2, height: WHEEL_RADIUS * 2 }}>
        {/* Render Other Lamps Markers */}
        {otherLamps.map(lamp => {
          const pos = getPosFromHS(lamp.hue, lamp.saturation);
          const bg = getColorString(lamp.hue, lamp.saturation);

          return (
            <View
              key={lamp.id}
              // Wrapper for larger hit area
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '60rpx', // Larger hit area
                height: '60rpx',
                zIndex: 30, // Higher than pin to be safe if overlapping
                transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              // @ts-ignore
              catchTouchStart={handleMarkerTouchStart(lamp.id)}
              catchTouchMove={handleMarkerTouchMove}
              catchTouchEnd={handleMarkerTouchEnd}
            >
              <View
                className={styles.marker}
                style={{
                  // Marker itself
                  backgroundColor: bg,
                  position: 'static', // positioning handled by wrapper
                  transform: 'none',
                }}
              />
            </View>
          );
        })}

        {/* Render Current Lamp Pin */}
        <View
          className={styles.currentMarker}
          style={{
            left: '50%',
            top: '50%',
            transform: `translate(calc(-50% + ${currentPos.x}px), calc(-100% + ${currentPos.y}px))`,
            color: getColorString(colour?.hue || 0, colour?.saturation || 0)
          }}
        >
          {/* Popup */}
          {isDragging && (
            <View className={styles.popup}>
              <Text>{currentLampName}</Text>
            </View>
          )}
        </View>


        {/* @ts-ignore */}
        <LampCirclePickerColor
          radius={WHEEL_RADIUS}
          hsColor={{ h: colour?.hue || 0, s: colour?.saturation || 1000 }}
          onTouchStart={handleTouchStart('wheel')}
          onTouchMove={handleWheelMove}
          onTouchEnd={handleWheelEnd}
        />
      </View>
    </View>
  );
};

import { isUndefined } from 'lodash-es';
import React, { useMemo } from 'react';
import { View, Text } from '@ray-js/ray';
import clsx from 'clsx';
import { useStructuredProps, useSupport } from '@ray-js/panel-sdk';
import { useThrottleFn } from 'ahooks';
import { LampCirclePickerColor } from '@ray-js/components-ty-lamp';

import Strings from '@/i18n';
import { lampSchemaMap } from '@/devices/schema';
import styles from './index.module.less';

const { colour_data } = lampSchemaMap;

interface IProps {
  style?: React.CSSProperties;
  className?: string;
  /**
   * Color value; if not provided, the default value is DP colour_data.
   */
  colour?: COLOUR;
  onRelease: (code: string, value: COLOUR) => void;
  onChange?: (isColor: boolean, value: COLOUR) => void;
  setScrollEnabled?: (v: boolean) => void;
  currentLampName?: string;
}

// Unified Lamp Interface
interface LampData {
  id: string;
  name: string;
  hue: number;
  saturation: number;
}

const WHEEL_RADIUS = 165;

// Initial Mock Data for Simulation
const allKnownLamps: LampData[] = [
  { id: 'lamp_1', name: 'מנורה 1', hue: 0, saturation: 1000 },
  { id: 'lamp_2', name: 'מנורה 2', hue: 240, saturation: 1000 },
  { id: 'lamp_3', name: 'מנורה 3', hue: 120, saturation: 800 },
];

export const Colour = (props: IProps) => {
  const { style, className, onRelease, onChange, setScrollEnabled, currentLampName = 'מנורה 2', colour } = props;

  const support = useSupport();

  // -- STATE --
  const [lamps, setLamps] = React.useState<LampData[]>(allKnownLamps);
  const [activeLampId, setActiveLampId] = React.useState<string>('lamp_2');
  const [draggingId, setDraggingId] = React.useState<string | null>(null);

  // -- REFS --
  const dragStartRef = React.useRef<{ id: string; startX: number; startY: number; initialPos: { x: number; y: number } } | null>(null);

  // -- SYNC --
  // 1. Handle Selection Change (Tab switch)
  React.useEffect(() => {
    const activeRaw = allKnownLamps.find(l => l.name === currentLampName) || allKnownLamps[1];
    setActiveLampId(activeRaw.id);
    // Note: We don't update lamps state here to avoid "jumping" to the current hardware color
    // Which might belong to the previous lamp.
  }, [currentLampName]);

  // 2. Handle Hardware Color Sync
  const lastHardwareColourRef = React.useRef(colour);
  React.useEffect(() => {
    if (!colour) return;

    // Only sync from physical device if the value actually changed (External/Hardware source)
    // and if we aren't currently dragging it locally.
    const isSignificantChange =
      Math.abs((colour?.hue || 0) - (lastHardwareColourRef.current?.hue || 0)) > 1 ||
      Math.abs((colour?.saturation || 0) - (lastHardwareColourRef.current?.saturation || 0)) > 1;

    if (isSignificantChange) {
      lastHardwareColourRef.current = colour;
      setLamps(prev =>
        prev.map(l => {
          if (l.id === activeLampId && draggingId !== l.id) {
            return {
              ...l,
              hue: colour.hue,
              saturation: colour.saturation,
            };
          }
          return l;
        })
      );
    }
  }, [colour, activeLampId, draggingId]);


  // -- HELPERS --
  const getPosFromHS = (h: number, s: number) => {
    const angle = (h * Math.PI) / 180;
    const dist = (s / 1000) * WHEEL_RADIUS;
    const x = Math.cos(angle) * dist;
    const y = Math.sin(angle) * dist;
    return { x, y };
  };

  const getHSFromPos = (x: number, y: number) => {
    const dist = Math.sqrt(x * x + y * y);
    const clampedDist = Math.min(dist, WHEEL_RADIUS);
    let angle = Math.atan2(y, x);
    if (angle < 0) angle += 2 * Math.PI;

    const h = (angle * 180) / Math.PI;
    const s = (clampedDist / WHEEL_RADIUS) * 1000;
    return { h, s };
  };

  const getColorString = (h: number, s: number) => {
    const lightness = 100 - (s / 1000 * 50);
    return `hsl(${h}, 100%, ${lightness}%)`;
  };

  // -- HANDLERS --

  // 1. Wheel Handlers (For Active Lamp)
  const handleWheelDataChange = (v: { h: number; s: number }, isComplete: boolean) => {
    const targetId = activeLampId;

    if (!isComplete) {
      setDraggingId(targetId);
    } else {
      setDraggingId(null);
    }

    setLamps(prev => prev.map(l => {
      if (l.id === targetId) {
        return { ...l, hue: v.h, saturation: v.s };
      }
      return l;
    }));

    // Report to parent (Real Device update)
    const newData = { hue: v.h, saturation: v.s, value: 1000 };
    if (isComplete) {
      onRelease?.(colour_data.code, newData);
    } else {
      onChange?.(true, newData);
    }
  };

  const handleWheelMove = (v: { h: number; s: number }) => {
    handleWheelDataChange(v, false);
    if (setScrollEnabled) setScrollEnabled(false);
  };
  const handleWheelEnd = (v: { h: number; s: number }) => {
    handleWheelDataChange(v, true);
    if (setScrollEnabled) setScrollEnabled(true);
  };
  const handleWheelTouchStart = () => {
    setDraggingId(activeLampId);
    if (setScrollEnabled) setScrollEnabled(false);
  };

  // 2. Marker Touch Handlers
  const handleMarkerTouchStart = (id: string) => (e: any) => {
    const touch = e.touches[0] || e.changedTouches[0];
    const lamp = lamps.find(l => l.id === id);
    if (!lamp) return;

    // Set Drag Ref
    const initialPos = getPosFromHS(lamp.hue, lamp.saturation);
    dragStartRef.current = {
      id,
      startX: touch.pageX,
      startY: touch.pageY,
      initialPos,
    };

    setDraggingId(id);
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

    setLamps(prev => prev.map(l => {
      if (l.id === id) {
        return { ...l, hue: h, saturation: s };
      }
      return l;
    }));
  };

  const handleMarkerTouchEnd = () => {
    if (dragStartRef.current) {
      const { id } = dragStartRef.current;
      // Logic to switch active lamp on tap?
      // User requested STRICT SELECTION: Only DeviceSelector changes the active lamp.
      // Dragging a marker should NOT make it active.
      // if (id !== activeLampId) {
      //   setActiveLampId(id);
      // }
    }

    setDraggingId(null);
    dragStartRef.current = null;
    if (setScrollEnabled) setScrollEnabled(true);
  };


  const handleTouchStart = React.useCallback(
    (type: 'hue' | 'saturation' | 'value' | 'wheel') => {
      return () => {
        // isTouching.current = true; // Unused?
        if (type === 'wheel') setDraggingId(activeLampId);
      };
    },
    [activeLampId]
  );

  // -- RENDER UTILS --
  const activeLamp = lamps.find(l => l.id === activeLampId);

  return (
    <View style={style} className={clsx(styles.container, className || '')}>
      <View
        className={styles.wheelContainer}
        style={{
          width: WHEEL_RADIUS * 2,
          height: WHEEL_RADIUS * 2,
          position: 'relative',
        }}
      >
        {/* LAYER 1: The Wheel (Background) */}
        {/* @ts-ignore */}
        <LampCirclePickerColor
          radius={WHEEL_RADIUS}
          // @ts-ignore
          hsColor={{ h: activeLamp?.hue || 0, s: activeLamp?.saturation || 0 }}
          onTouchStart={handleWheelTouchStart}
          onTouchMove={handleWheelMove}
          onTouchEnd={handleWheelEnd}
          // @ts-ignore
          thumbRadius={0}
          // @ts-ignore 
          thumbStyle={{ opacity: 0, width: 0, height: 0 }}
        />

        {/* LAYER 2: Markers (Directly in Container) */}

        {/* 2.1 Inactive Markers */}
        {lamps.filter(l => l.id !== activeLampId).map(lamp => {
          const pos = getPosFromHS(lamp.hue, lamp.saturation);
          const bg = getColorString(lamp.hue, lamp.saturation);
          const isBeingDragged = draggingId === lamp.id;

          return (
            <View
              key={lamp.id}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: '80rpx', // Reasonable hit area
                height: '80rpx',
                zIndex: 9999,
                // Position relative to center
                transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onTouchStart={(e) => {
                // No logs, just logic
                handleMarkerTouchStart(lamp.id)(e);
              }}
              onTouchMove={(e) => {
                handleMarkerTouchMove(e);
              }}
              onTouchEnd={(e) => {
                handleMarkerTouchEnd();
              }}
            >
              {/* Visual Marker */}
              <View
                className={styles.marker}
                style={{
                  backgroundColor: bg,
                  transform: 'none',
                  position: 'static',
                  pointerEvents: 'none',
                }}
              />

              {/* Popup */}
              {isBeingDragged && (
                <View className={styles.popup}>
                  <Text>{lamp.name}</Text>
                </View>
              )}
            </View>
          );
        })}

        {/* 2.2 Active Lamp Pin */}
        {activeLamp && (
          <View
            className={styles.currentMarker}
            style={{
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${getPosFromHS(activeLamp.hue, activeLamp.saturation).x}px), calc(-100% + ${getPosFromHS(activeLamp.hue, activeLamp.saturation).y}px))`,
              color: getColorString(activeLamp.hue, activeLamp.saturation),
              pointerEvents: 'none',
              zIndex: 101,
            }}
          >
            {draggingId === activeLamp.id && (
              <View className={styles.popup}>
                <Text>{activeLamp.name}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { transform } from './transform';

export default class ControlFormatter {
  uuid: string;
  defaultValue: {
    hue: number;
    saturation: number;
    value: number;
    bright: number;
    temp: number;
  };

  constructor(uuid = 'control_data', defaultValue = null) {
    this.defaultValue = {
      hue: 360,
      saturation: 1000,
      value: 1000,
      bright: 0,
      temp: 0,
    };
    this.uuid = uuid;
    if (defaultValue) {
      this.defaultValue = defaultValue;
    }
  }

  equal(source, target) {
    return source === target;
  }

  parser(val = '') {
    // Custom parsing
    const { length } = val;
    if (!length) {
      console.log('The data is corrupted and cannot be parsed');
      return this.defaultValue;
    }
    const generator = transform(val);
    generator.next();
    // Version
    const mode = parseInt(`${generator.next(1).value}`, 16);
    const hue = parseInt(`${generator.next(4).value}`, 16);
    const saturation = parseInt(`${generator.next(4).value}`, 16);
    const value = parseInt(`${generator.next(4).value}`, 16);
    const temp = parseInt(`${generator.next(4).value}`, 16);
    const bright = parseInt(`${generator.next(4).value}`, 16);
    return {
      /**
       * Mode: 0 jump, 1 breathing, 0x0-0x1
       */
      mode,
      /**
       * Hue: 0-360
       */
      hue,
      /**
       * Saturation: 0-1000
       */
      saturation,
      /**
       * Brightness: 0-1000
       */
      value,
      /**
       * White light brightness: 0-1000
       */
      temp,
      /**
       * Color temperature value: 0-1000
       */
      bright,
    };
  }

  to16(value, length) {
    let result = Number(value).toString(16);
    if (result.length < length) {
      result = result.padStart(length, '0');
    }
    return result;
  }

  formatter(data) {
    // Custom format to 16-bit
    const { hue = 360, saturation = 1000, value = 1000, bright = 0, temp = 0 } = data;
    const hStr = this.to16(hue, 4);
    const sStr = this.to16(saturation, 4);
    const vStr = this.to16(value, 4);
    const bStr = this.to16(bright, 4);
    const tStr = this.to16(temp, 4);
    return `1${hStr}${sStr}${vStr}${bStr}${tStr}`;
  }
}

import defaultConfig from '@/config/default';
import { devices } from '@/devices';
import { lampSchemaMap } from '@/devices/schema';

const { defaultScenesRGBCW, defaultScenesRGB, defaultScenesCW } = defaultConfig;

const temperatureCode = lampSchemaMap.temp_value.code;
const brightCode = lampSchemaMap.bright_value.code;

export const getDefaultScenes = () => {
  const { support } = devices.lamp.model.abilities;
  const supportColorAndWhite = support.isSupportColour() && support.isSupportDp(temperatureCode); // Is 5-road light
  const SupportColorAndBright = support.isSupportColour() && support.isSupportDp(brightCode); // Is 4-road light
  const onlySupportColor = support.isSupportColour() && !support.isSupportDp(temperatureCode); // Is 3-road light
  // const onlySupportBright =
  //   !support.isSupportColour() &&
  //   (support.isSupportDp(temperatureCode) || support.isSupportDp(brightCode)); // Is 1 or 2-road light
  if (supportColorAndWhite || SupportColorAndBright) {
    return defaultScenesRGBCW;
  }
  if (onlySupportColor) {
    return defaultScenesRGB;
  }
  return defaultScenesCW;
};

import { getCachedLaunchOptions } from '@/api/getCachedLaunchOptions';
import { navigateTo } from '@ray-js/ray';

const { deviceId, groupId } = getCachedLaunchOptions()?.query ?? {};

export const presetFunctionalData = (url: string, data: Record<string, any>): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    ty.presetFunctionalData({
      url,
      data,
      success: () => resolve(true),
      fail: err => reject(err),
    });
  });
};

/**
 * @name: Jump to Scene Play Cool functional page
 * @desc:
 * @param {boolean} supportSceneData Whether it's full color
 * @return {*}
 */
export const openPlayCoolFunctional = async (supportSceneData: boolean, road: number) => {
  // Enter Dream Light Scene functional page
  const url = `functional://rayPlayCoolFunctional/home?deviceId=${deviceId ||
    ''}&groupId=${groupId || ''}&type=C`;
  const data = supportSceneData
    ? {
      lightNum: `${road}`, // Number of light roads - Full color interface needs
      dpCode: 'scene_data', // Full color DP
    }
    : null;
  // Add functional page preset data
  await presetFunctionalData(url, data);

  // Navigate
  navigateTo({ url, fail: err => console.warn(err) });
};

export const getArray = array => (Array.isArray(array) ? array : []);

export const buildMap = (arr, key) =>
  getArray(arr).reduce(
    (acc, item) => (isNotNullOrUndefined(item[key]) ? { ...acc, [item[key]]: item } : acc),
    {}
  );

/**
 * Value does not exist
 */
export const isNullOrUndefined = val => val === null || typeof val === 'undefined';

/**
 * Value exists
 */
export const isNotNullOrUndefined = val => !isNullOrUndefined(val);

const RoadValMap = {
  road1: 1,
  road2: 2,
  road3: 3,
  road4: 4,
  road5: 5,
};

const STAND_LAMP_DP_CODE = {
  colour_data: 'colour_data', // 3,4,5 roads
  bright_value: 'bright_value', // 1,2,3,4,5 roads
  temp_value: 'temp_value', // 2,3,4,5 roads
};

const defaultRoad = {
  [RoadValMap.road1]: [STAND_LAMP_DP_CODE.bright_value],
  [RoadValMap.road2]: [STAND_LAMP_DP_CODE.bright_value, STAND_LAMP_DP_CODE.temp_value],
  [RoadValMap.road3]: [STAND_LAMP_DP_CODE.colour_data],
  [RoadValMap.road4]: [STAND_LAMP_DP_CODE.colour_data, STAND_LAMP_DP_CODE.bright_value],
  [RoadValMap.road5]: [
    STAND_LAMP_DP_CODE.colour_data,
    STAND_LAMP_DP_CODE.bright_value,
    STAND_LAMP_DP_CODE.temp_value,
  ],
};

// eslint-disable-next-line consistent-return
export const getRoad = devInfo => {
  const { schema } = devInfo;
  if (!schema) return RoadValMap.road1;

  const dpSchemaObj = Array.isArray(schema) ? buildMap(schema, 'code') : schema;

  const params = defaultRoad;
  // Determine how many roads the light has
  // 5 roads
  if (params[RoadValMap.road5]) {
    const road5List = params[RoadValMap.road5];
    const _road = road5List.every(item => {
      return !!dpSchemaObj[item];
    });
    if (_road) {
      return RoadValMap.road5;
    }
  }

  // 4 roads
  if (params[RoadValMap.road4]) {
    const road4List = params[RoadValMap.road4];
    const _road = road4List.every(item => {
      return !!dpSchemaObj[item];
    });
    if (_road) {
      return RoadValMap.road4;
    }
  }

  // 3 roads
  if (params[RoadValMap.road3]) {
    const road3List = params[RoadValMap.road3];
    const _road = road3List.every(item => {
      return !!dpSchemaObj[item];
    });
    if (_road) {
      return RoadValMap.road3;
    }
  }

  // 2 roads
  if (params[RoadValMap.road2]) {
    const road2List = params[RoadValMap.road2];
    const _road = road2List.every(item => {
      return !!dpSchemaObj[item];
    });
    if (_road) {
      return RoadValMap.road2;
    }
  }

  // 1 road
  if (params[RoadValMap.road1]) {
    const road1List = params[RoadValMap.road1];
    const _road = road1List.every(item => {
      return !!dpSchemaObj[item];
    });
    if (_road) {
      return RoadValMap.road1;
    }
  }
};

/*
 * @Author: mjh
 * @Date: 2025-03-25 17:28:56
 * @LastEditors: mjh
 * @LastEditTime: 2025-03-25 17:30:44
 * @Description:
 */
import { getCachedLaunchOptions } from '@/api/getCachedLaunchOptions';
import { navigateTo } from '@ray-js/ray';
import { presetFunctionalData } from './openPlayCoolFunctional';

const { deviceId, groupId } = getCachedLaunchOptions()?.query ?? {};

/**
 * @name: Jump to Power Memory functional page
 * @desc:
 * @param {boolean} supportSceneData האם זה בצבע מלא?
 * @return {*}
 */
export const openPowerMemoryFunctional = async (collectColors: any[], collectWhites: any[]) => {
  const jumpUrl = `functional://LampPowerMemoryFunctional/home?deviceId=${deviceId ||
    ''}&groupId=${groupId || ''}`;
  // Preset data
  const data = {
    collectColors,
    collectWhites,
  };
  // Add functional page preset data
  await presetFunctionalData(jumpUrl, data);

  // Navigate
  navigateTo({ url: jumpUrl, fail: err => console.warn(err) });
};

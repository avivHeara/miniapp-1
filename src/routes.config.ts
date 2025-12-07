import { Routes } from '@ray-js/types';

export const routes: Routes = [
  {
    route: '/',
    path: '/pages/Home/index',
    name: 'Home',
  },
  {
    route: '/devices',
    path: '/pages/Devices/index',
    name: 'Devices',
  },
  {
    route: '/shabbat',
    path: '/pages/Shabbat/index',
    name: 'Shabbat',
  },
  {
    route: '/timers',
    path: '/pages/Timers/index',
    name: 'Timers',
  },
  {
    route: '/settings',
    path: '/pages/Settings/index',
    name: 'Settings',
  },
  {
    route: '/settingsAdvanced',
    path: '/pages/SettingsAdvanced/index',
    name: 'SettingsAdvanced',
  },
];
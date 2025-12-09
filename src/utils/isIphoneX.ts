export const isIphoneX = info => {
  // Check if current device has status bar
  if (info.platform === 'ios' && info?.screenHeight >= 812) {
    return true;
  }
  return false;
};

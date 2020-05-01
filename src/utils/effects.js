import bridge from '@vkontakte/vk-bridge';

export const vibrate = {
  result() {
    if (bridge.supports('VKWebAppTapticNotificationOccurred')) {
      bridge.send('VKWebAppTapticNotificationOccurred', {
        type: 'warning'
      });
    } else if ('vibrate' in window.navigator) {
      window.navigator.vibrate(100);
    } else if ('mozVibrate' in window.navigator) {
      window.navigator.mozVibrate(100);
    }
  },
  touch() {
    if (bridge.supports('VKWebAppTapticImpactOccurred')) {
      bridge.send('VKWebAppTapticImpactOccurred', {
        style: 'medium'
      });
    } else if ('vibrate' in window.navigator) {
      window.navigator.vibrate(50);
    } else if ('mozVibrate' in window.navigator) {
      window.navigator.mozVibrate(50);
    }
  }
};

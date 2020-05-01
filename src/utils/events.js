import global from '../utils/global';

export const SWIPE_EVENTS = ['dragstart', 'dragenter', 'gesturestart', 'gesturechange', 'MSGestureStart'];

export const PARAM_PASSIVE = { passive: true };
export const PARAM_ACTIVE = { passive: false };

export const forcePrevent = (e = window.event) => {
  if (!e) {
    return;
  }

  if (e.cancelable) {
    if (e.preventDefault && !e.defaultPrevented) {
      e.preventDefault();
    } else {
      e.returnValue = false;
    }
  }

  if (e.stopImmediatePropagation) {
    e.stopImmediatePropagation();
  }

  if (e.stopPropagation) {
    e.stopPropagation();
  }

  return false;
};

export const swipe = {
  state: false,
  enable() {
    this.state = true;

    if (global.bridge.supports('VKWebAppEnableSwipeBack')) {
      global.bridge.send('VKWebAppEnableSwipeBack');
    }

    SWIPE_EVENTS.forEach((event) => {
      document.removeEventListener(event, forcePrevent, PARAM_ACTIVE);
    });
  },
  disable() {
    this.state = false;

    if (global.bridge.supports('VKWebAppDisableSwipeBack')) {
      global.bridge.send('VKWebAppDisableSwipeBack');
    }

    SWIPE_EVENTS.forEach((event) => {
      document.addEventListener(event, forcePrevent, PARAM_ACTIVE);
    });
  }
};

import * as workerTimers from 'worker-timers';

const safeTimer = (by, fallback) => {
  return (callback, time) => {
    if (callback) {
      try {
        return by(callback, time);
      } catch {
        return fallback(callback, time);
      }
    }
  };
};

window._setTimeout = window.setTimeout.bind(window);
window._clearTimeout = window.clearTimeout.bind(window);

window.setTimeout = safeTimer(workerTimers.setTimeout, window._setTimeout);
window.clearTimeout = safeTimer(workerTimers.clearTimeout, window._clearTimeout);

window._setInterval = window.setInterval.bind(window);
window._clearInterval = window.setInterval.bind(window);

window.setInterval = safeTimer(workerTimers.setInterval, window._setInterval);
window.clearInterval = safeTimer(workerTimers.clearInterval, window._clearInterval);

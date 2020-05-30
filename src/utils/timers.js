import { platform, ANDROID } from '@vkontakte/vkui';
import bridge from './bridge';
import worker from './worker';
import { load } from 'worker-timers-broker/build/es2019/module';
import { createLoadWorkerTimers } from 'worker-timers/build/es2019/factories/load-worker-timers';

window._setTimeout = window.setTimeout.bind(window);
window._clearTimeout = window.clearTimeout.bind(window);

window._setInterval = window.setInterval.bind(window);
window._clearInterval = window.setInterval.bind(window);

// Web Worker doesn't work well in Android WebView
const isAndroidWebView = bridge.isWebView() && platform() === ANDROID;
if (!isAndroidWebView) {
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

  const loadWorkerTimers = createLoadWorkerTimers(load, worker);

  const workerSetTimeout = (func, delay) => loadWorkerTimers().setTimeout(func, delay);
  const workerClearTimeout = (timerId) => loadWorkerTimers().clearTimeout(timerId);

  window.setTimeout = safeTimer(workerSetTimeout, window._setTimeout);
  window.clearTimeout = safeTimer(workerClearTimeout, window._clearTimeout);

  const workerSetInterval = (func, delay) => loadWorkerTimers().setInterval(func, delay);
  const workerClearInterval = (timerId) => loadWorkerTimers().clearInterval(timerId);

  window.setInterval = safeTimer(workerSetInterval, window._setInterval);
  window.clearInterval = safeTimer(workerClearInterval, window._clearInterval);
}

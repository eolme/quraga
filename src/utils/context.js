import {
  window as windowFallback,
  document as documentFallback
} from 'ssr-window/dist/ssr-window.esm';
import * as raf from 'raf';

const context = (() => {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  }
  if (typeof self !== 'undefined') {
    return self;
  }
  if (typeof window !== 'undefined') {
    return window;
  }
  if (typeof global !== 'undefined') {
    return global;
  }
  if (typeof this !== 'undefined') {
    return this;
  }
  return Function('return this')();
})();

if (!('globalThis' in context)) {
  context.globalThis = context;
}

if (!('window' in context)) {
  context.window = windowFallback;
}

if (!('history' in context.window)) {
  context.window.history = {};
}

if (!('pushState' in context.window.history)) {
  context.window.history.pushState = () => { };
}

if (!('back' in context.window.history)) {
  context.window.history.back = () => { };
}

raf.polyfill(context.window);

if (!('document' in context)) {
  context.document = documentFallback;
}

export default context;

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

raf.polyfill(context.window);

if (!('document' in context)) {
  context.document = documentFallback;
}

if (!('console' in context)) {
  context.console = {};
}

if (typeof context.console.log !== 'function') {
  context.console.log = () => { };
}

if (typeof context.console.error !== 'function') {
  context.console.error = () => { };
}

export default context;

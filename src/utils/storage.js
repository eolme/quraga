import bridge from './bridge';

const shouldUseVKStorage =
  process.env.NODE_ENV === 'production' &&
  bridge.supports('VKWebAppStorageGet') &&
  bridge.supports('VKWebAppStorageSet');

const VKStorage = {
  get() {
    return bridge.sendPromise('VKWebAppStorageGet', {
      keys: ['persist']
    }).then((storage) => {
      const { value } = storage.keys[0];
      return value ? JSON.parse(value) : {};
    }).catch(() => {
      return {};
    });
  },
  set(value) {
    return bridge.sendPromise('VKWebAppStorageSet', {
      key: 'persist',
      value: JSON.stringify(value)
    }).then((state) => {
      return state.result;
    }).catch(() => {
      return false;
    });
  }
};

const devStorage = {
  get() {
    const value = localStorage.getItem('persist');
    return Promise.resolve(value ? JSON.parse(value) : {});
  },
  set(value) {
    return Promise.resolve(localStorage.setItem('persist', JSON.stringify(value)));
  }
};

export default shouldUseVKStorage ? VKStorage : devStorage;

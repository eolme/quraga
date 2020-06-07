import bridge from '@vkontakte/vk-bridge';

const USER_DENIED = Object.freeze({
  error_type: 'client_error',
  error_data: {
    error_code: 4,
    error_reason: 'user denied'
  }
});

const send = bridge.send.bind(bridge);
bridge.send = bridge.sendPromise = (name, params) => {
  return send(name, params || {}).then((data) => {
    if (name === 'VKWebAppGetAuthToken' && 'scope' in params) {
      if (params.scope !== data.scope) {
        throw USER_DENIED;
      }
    }

    if (!('result' in data)) {
      data.result = true;
    }

    return data;
  }).catch((error) => {
    if (error && error.error_data) {
      const code = Number(error.error_data.error_code ?? error.error_data.error);

      if (code === 4) {
        return { result: false };
      }

      if (code === 9) {
        return { result: false };
      }
    }

    throw error;
  });
};

const supports = bridge.supports.bind(bridge);
bridge.supports = (method) => {
  if (!bridge.isWebView() && (window.parent === window)) {
    return false;
  }
  return supports(method);
};

export default bridge;

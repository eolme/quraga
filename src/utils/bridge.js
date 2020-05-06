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
    if (error.error_type === 'client_error') {
      const code = Number(error.error_data.error_code);
      const reason = String(error.error_data.error_reason).toLowerCase();

      if (code === 4 || reason === 'user denied') {
        return { result: false };
      }
    }

    throw error;
  });
};

export default bridge;

import global from './global';

const isVKBrdigeError = (morph) => {
  return Boolean(morph && (morph.error_type || morph.error_data));
};

const parseVKBridgeError = (error) => {
  return `${
    error.error_type ?? 'bridge_error'
  }\r\n${
    error.error_data?.error_description ?? error.error_data?.error_msg ?? error.error_data?.error_reason
  }`;
};

export default (morph = window.event, raw, source) => {
  const send = {
    payload: null,
    type: null
  };

  if (source === 'join:error') {
    send.type = 'join';
    return Promise.resolve(send);
  }

  if (typeof morph?.code === 'number') {
    send.type = 'game';
    send.payload = morph.code;
    return Promise.resolve(send);
  }

  let payload = null;

  if (isVKBrdigeError(raw)) {
    payload = parseVKBridgeError(raw);
  }

  if (isVKBrdigeError(morph.error)) {
    payload = parseVKBridgeError(morph.error);
  }

  if (isVKBrdigeError(morph.reason)) {
    payload = parseVKBridgeError(morph.reason);
  }

  if (isVKBrdigeError(morph)) {
    payload = parseVKBridgeError(morph);
  }

  if (payload) {
    send.type = 'bridge';
    send.payload = payload;
  } else {
    let msg = null;
    let err = null;

    if (morph instanceof Event) {
      msg = (morph.error ?? morph.reason)?.message ?? morph.message ?? morph.type;
      const stack = raw?.stack ?? morph.error?.stack;
      if (stack) {
        err = stack;
      } else {
        err = source ?? morph.filename;
      }
    } else {
      msg = String(morph);
    }

    if (msg === 'Network Error') {
      send.type = 'network';
      return Promise.resolve(send);
    } else {
      send.payload = `${msg}\r\n${err}`;
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return global.axios.post('/vk-user/error-log', { payload: send.payload }).then(() => {
      return send;
    });
  } else {
    console.error(send.payload);
    return Promise.resolve(send);
  }
};

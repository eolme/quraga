import global from './global';
import pkg from '../../package.json';

const createErrorMessage = (arr) => arr.filter((value) => value).join('\r\n');

const getVKBrdigeError = (list) => {
  return list.find((where) => {
    return where && (where.error_type || where.error_data);
  });
};

const BaseBridgeError = {
  error_type: 'bridge_error',
  error_data: {
    error_code: 1,
    error_reason: 'Unknown error'
  }
};

const parseVKBridgeError = (error = BaseBridgeError, nested) => {
  const type = error.error_type ?? BaseBridgeError.error_type;
  const data = error.error_data ?? BaseBridgeError.error_data;
  const code = data.error_code ?? data.error ?? '';
  const desc = data.error_description ?? data.error_msg ?? '';

  let reason = '';
  if (!nested) {
    if (typeof data.error_reason === 'object') {
      reason = parseVKBridgeError(data.error_reason, true);
    } else {
      reason = data.error_reason ?? reason;
    }
  }

  return createErrorMessage([type, code, desc, reason]);
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

  const payload = getVKBrdigeError([raw, morph.error, morph.reason, morph]);
  if (payload) {
    send.type = 'bridge';
    send.payload = parseVKBridgeError(payload, false);
  } else {
    let reason;
    if (morph instanceof Event) {
      reason = morph.error ?? morph.reason ?? morph;
    } else {
      reason = morph ?? {};
    }

    raw = raw ?? {};
    const msg = [morph.message, morph.type, reason.message, reason.type, raw.message, raw.type];
    if (msg.includes('NetworkError')) {
      send.type = 'network';
      return Promise.resolve(send);
    } else {
      msg.push(raw.stack, reason.stack, reason.description, source, raw.fileName);
      send.payload = createErrorMessage(msg);
    }
  }

  if (process.env.NODE_ENV === 'production') {
    return global.axios.post('/vk-user/error-log', { payload: `${pkg.version}\r\n${send.payload}` }).then(() => {
      return send;
    });
  } else {
    console.error(send.payload);
    return Promise.resolve(send);
  }
};

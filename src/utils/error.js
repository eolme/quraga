import global from './global';
import pkg from '../../package.json';

const getVKBrdigeError = (list) => {
  return list.find((where) => {
    return where && (where.error_type || where.error_data);
  });
};

const parseVKBridgeError = (error) => {
  return `${
    error.error_type ?? 'bridge_error'
  }\r\n${
    error.error_data?.error_description
  }\r\n${
    error.error_data?.error_msg
  }\r\n${
    error.error_data?.error_reason
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

  const payload = getVKBrdigeError([raw, morph.error, morph.reason, morph]);
  if (payload) {
    send.type = 'bridge';
    send.payload = parseVKBridgeError(payload);
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
      send.payload = msg.filter((value) => value).join('\r\n');
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

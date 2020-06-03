import Bus from 'js-event-bus';
import axios from './axios';
import io from 'socket.io-client';
import bridge from './bridge';
import storage from './storage';
import * as effects from './effects';

import context from '../utils/context';
import { parseQuery } from '../utils/uri';
import { getUTCOffset } from '../utils/date';

import { URL_SOCKET, URL_API } from '../utils/constants';

const bus = new Bus();

const VKParams = window.btoa(JSON.stringify({
  ...parseQuery(window.location.search),
  utc_offset: getUTCOffset()
}));

const socket = io(URL_SOCKET, {
  autoConnect: false,
  transports: ['websocket'],
  query: {
    'vk-params': VKParams
  }
});

const axiosInstance = axios.create({
  baseURL: URL_API,
  timeout: 6E4, // 1m
  headers: {
    'Vk-Params': VKParams,
    'Accept': 'application/json'
  }
});

const global = {
  store: {
    isOffline: !window.navigator.onLine,
    persist: {},
    user: {},
    game: {},
    modal: { state: false, content: null },
    popout: { state: false, content: null },
    mode: null,
    join: -1,
    tab: 0
  },
  storage,
  axios: axiosInstance,
  socket,
  bridge,
  bus,
  effects
};

if (process.env.NODE_ENV !== 'production') {
  context.$global = global;
}

export default global;

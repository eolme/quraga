import Bus from 'js-event-bus';
import axios from './axios';
import io from 'socket.io-client';
import bridge from '@vkontakte/vk-bridge';
import storage from './storage';
import * as effects from './effects';

import context from '../utils/context';
import { parseQuery } from '../utils/uri';
import { getUTCOffset } from '../utils/date';

const bus = new Bus();

const VKParams = window.btoa(JSON.stringify({
  ...parseQuery(window.location.search),
  utc_offset: getUTCOffset()
}));

const socket = io('wss://vk-battle.ezavalishin.ru', {
  autoConnect: false,
  transports: ['websocket'],
  query: {
    'vk-params': VKParams
  }
});

const axiosInstance = axios.create({
  baseURL: 'https://vk-battle.ezavalishin.ru',
  headers: {
    'Vk-Params': VKParams,
    'Accept': 'application/json'
  }
});

context.$store = {
  isOffline: !window.navigator.onLine,
  persist: {},
  user: {},
  game: {},
  modal: null,
  mode: null,
  join: -1
};
context.$storage = storage;
context.$axios = axiosInstance;
context.$socket = socket;
context.$bridge = bridge;
context.$bus = bus;
context.$effects = effects;

export default {
  store: context.$store,
  storage: context.$storage,
  axios: context.$axios,
  socket: context.$socket,
  bridge: context.$bridge,
  bus: context.$bus,
  effects: context.$effects
};

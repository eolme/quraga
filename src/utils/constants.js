export const URL_SOCKET = process.env.REACT_APP_SOCKET_URL;
export const URL_API = process.env.REACT_APP_API_URL;

export const APP_LINK = process.env.REACT_APP_APP_LINK;
export const APP_ID = +process.env.REACT_APP_APP_ID;
export const APP_SUPPORT = 'https://vk.me/petrov.engineer';

export const SHARE_MESSAGE = `Заходи в QURAGU, поиграем!\r\n\r\n#quraga #умнейдома #лучшедома`;
export const SHARE_IMAGE = {
  wall: {
    url: {
      male: '/share/wall-male.svg',
      female: '/share/wall-female.svg'
    },
    width: 1200,
    height: 650,
    x: 925,
    y: 374,
    size: 228
  },
  story: {
    url: '/share/story.svg',
    width: 1080,
    height: 1920,
    x: 310,
    y: 890,
    size: 460,
    overlay: {
      x: 540,
      y: 1690
    }
  }
};

export const EMOTION_SIZE = 40;
export const EMOTION_COUNT = 10;

export const VIEW_SETTINGS_BASE = {
  status_bar_style: 'light',
  action_bar_color: '#355FDE'
};
export const VIEW_SETTINGS_EXTENDED = {
  status_bar_style: 'light',
  action_bar_color: '#355FDE',
  navigation_bar_color: '#537EF9'
};

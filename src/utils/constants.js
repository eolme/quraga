import {appId, appLink} from '../config';

export const APP_LINK = appLink;
export const APP_ID = appId;
export const APP_SUPPORT = 'https://vk.me/petrov.engineer';


export const SHARE_MESSAGE = `Заходи в QURAGU, поиграем!\r\n\r\n#quraga #умнейдома #лучшедома`;
export const SHARE_IMAGE = {
  wall: {
    url: '/share/wall.svg',
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

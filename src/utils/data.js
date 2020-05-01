import global from '../utils/global';
import { APP_LINK, SHARE_MESSAGE } from './constants';

export const interpretResponse = (response) => {
  while (response.data) {
    response = response.data;
  }
  return response;
};

export const shuffle = (arr) => {
  const array = Array.from(arr);
  let counter = array.length;
  let index;
  let temp;

  while (counter > 0) {
    index = Math.floor(Math.random() * counter);
    counter--;
    temp = array[counter];
    array[counter] = array[index];
    array[index] = temp;
  }

  return array;
};

export const shareLink = (link = APP_LINK) => {
  if (global.bridge.supports('VKWebAppShare')) {
    global.bridge.send('VKWebAppShare', { link });
  } else if ('share' in window.navigator) {
    window.navigator.share({
      title: document.title,
      text: link
    });
  } else {
    window.open(`https://vk.com/share.php?url=${link}`, '_blank');
  }
};

export const shareMessage = (message = SHARE_MESSAGE) => {
  if (global.bridge.supports('VKWebAppShowWallPostBox')) {
    global.bridge.send('VKWebAppShowWallPostBox', { message });
  } else if ('share' in window.navigator) {
    window.navigator.share({
      title: document.title,
      text: message
    });
  } else {
    window.open(`https://vk.com/share.php?url=${APP_LINK}`, '_blank');
  }
};

import { APP_ID, APP_LINK, SHARE_MESSAGE, SHARE_IMAGE } from './constants';
import { interpretResponse, declOfNum } from './data';
import global from '../utils/global';

const loadImage = (src, width, height) => {
  return new Promise((resolve, reject) => {
    const img = new Image(width, height);
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      reject();
    };
    img.crossOrigin = 'Anonymous';
    img.src = src;
  });
};

const getTemplateRender = (width, height) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    resolve({
      canvas,
      ctx
    });
  });
};

const getImage = (type, raw) => {
  return new Promise((resolve) => {
    const model = SHARE_IMAGE[type];
    return Promise.all([
      loadImage(model.url, model.width, model.height),
      loadImage(global.store.user.avatar, model.size, model.size),
      getTemplateRender(model.width, model.height)
    ]).then(([background, avatar, renderer]) => {
      renderer.ctx.drawImage(background, 0, 0);
      renderer.ctx.beginPath();
      const radius = model.size / 2;
      renderer.ctx.arc(
        model.x + radius,
        model.y + radius,
        radius,
        0,
        Math.PI * 2,
        true
      );
      renderer.ctx.clip();
      renderer.ctx.drawImage(
        avatar,
        model.x,
        model.y,
        model.size,
        model.size
      );
      if (raw) {
        renderer.canvas.toBlob(resolve, 'image/png', 1);
      } else {
        resolve(renderer.canvas.toDataURL('image/png', 1));
      }
    });
  });
};

const renderOverlayText = (background, overlay) => {
  return Promise.all([
    getTemplateRender(background.width, background.height),
    loadImage(background.url, background.width, background.height)
  ]).then(([renderer, image]) => {
    renderer.ctx.drawImage(image, 0, 0);

    renderer.ctx.textAlign = 'center';
    renderer.ctx.textBaseline = 'middle';
    renderer.ctx.font = '700 75px/75px "Montserrat", "Avenir Black", "Verdana", "Century Gothic", "Arial Black", monospace';
    renderer.ctx.fillStyle = '#004BA1';
    renderer.ctx.fillText(overlay.text, overlay.x, overlay.y);

    return renderer.canvas.toDataURL('image/png', 1);
  });
};

const getWallUpload = () => {
  return global.bridge.send('VKWebAppGetAuthToken', {
    app_id: APP_ID,
    scope: 'photos'
  }).then((data) => {
    const { access_token } = data;

    return global.bridge.send('VKWebAppCallAPIMethod', {
      method: 'photos.getWallUploadServer',
      params: {
        access_token,
        v: '5.103'
      }
    }).then((data) => {
      return {
        url: data.response.upload_url,
        token: access_token
      };
    });
  });
};

const saveWallImage = (model, token) => {
  return global.bridge.send('VKWebAppCallAPIMethod', {
    method: 'photos.saveWallPhoto',
    params: {
      access_token: token,
      v: '5.103',
      ...model
    }
  }).then((data) => {
    const [photo] = data.response;
    return `photo${photo.owner_id}_${photo.id}`;
  });
};

const shareWall = () => {
  return Promise.all([
    getWallUpload(),
    getImage('wall', true)
  ]).then(([upload, image]) => {
    const data = new FormData();
    data.append('photo', image, 'photo.png');
    return global.axios({
      method: 'post',
      url: `https://cors-anywhere.herokuapp.com/${upload.url}`,
      data,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }).then((response) => {
      return saveWallImage(interpretResponse(response), upload.token);
    });
  }).then((attachment) => {
    return global.bridge.send('VKWebAppShowWallPostBox', {
      message: SHARE_MESSAGE,
      attachments: `${attachment},${APP_LINK}`,
      copyright: APP_LINK
    });
  });
};

const shareStory = (points) => {
  return getImage('story').then((image) => {
    return renderOverlayText({
      url: image,
      width: SHARE_IMAGE.story.width,
      height: SHARE_IMAGE.story.height
    }, {
      text: `${points} ${declOfNum(points, ['очко', 'очка', 'очков'])}`,
      x: SHARE_IMAGE.story.overlay.x,
      y: SHARE_IMAGE.story.overlay.y,
    });
  }).then((image) => {
    return global.bridge.send('VKWebAppShowStoryBox', {
      background_type: 'image',
      blob: image,
      locked: true,
      attachment: {
        text: 'go_to',
        type: 'url',
        url: APP_LINK
      }
    });
  });
};

const shareLink = (link = APP_LINK) => {
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

const shareMessage = (message = SHARE_MESSAGE) => {
  const linkedMessage = `${message}\r\n\r\n${APP_LINK}`;

  if (global.bridge.supports('VKWebAppShowWallPostBox')) {
    global.bridge.send('VKWebAppShowWallPostBox', {
      message: linkedMessage
    });
  } else if ('share' in window.navigator) {
    window.navigator.share({
      title: document.title,
      text: linkedMessage
    });
  } else {
    window.open(`https://vk.com/share.php?url=${APP_LINK}`, '_blank');
  }
};

window.share = {
  shareWall,
  shareStory,
  shareLink,
  shareMessage
};

export { shareWall, shareStory, shareLink, shareMessage };

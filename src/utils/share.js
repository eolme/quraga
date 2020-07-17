import { APP_ID, APP_LINK, SHARE_MESSAGE, SHARE_IMAGE } from './constants';
import { interpretResponse, declOfNum } from './data';
import global from './global';
import context from './context';

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

const getWallImage = () => {
  return new Promise((resolve) => {
    const model = SHARE_IMAGE.wall;
    global.bridge.send('VKWebAppGetUserInfo').then(({ sex }) => {
      return sex === 1 ? 'female' : 'male';
    }).catch(() => {
      return 'male';
    }).then((sex) => {
      return Promise.all([
        loadImage(model.url[sex], model.width, model.height),
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
        renderer.canvas.toBlob(resolve, 'image/png', 1);
      });
    });
  });
};

const getStoryImage = (points) => {
  const model = SHARE_IMAGE.story;
  return Promise.all([
    loadImage(model.url, model.width, model.height),
    loadImage(global.store.user.avatar, model.size, model.size),
    getTemplateRender(model.width, model.height)
  ]).then(([background, avatar, renderer]) => {
    renderer.ctx.drawImage(background, 0, 0);

    renderer.ctx.textAlign = 'center';
    renderer.ctx.textBaseline = 'middle';
    renderer.ctx.font = '700 75px/75px "Montserrat", "Avenir Black", "Verdana", "Century Gothic", "Arial Black", monospace';
    renderer.ctx.fillStyle = '#004BA1';

    const text = `${points} ${declOfNum(points, ['балл', 'балла', 'баллов'])}`;
    renderer.ctx.fillText(text, model.overlay.x, model.overlay.y);

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

    return renderer.canvas.toDataURL('image/png', 1);
  });
};

const getWallUpload = () => {
  return global.bridge.send('VKWebAppGetAuthToken', {
    app_id: APP_ID,
    scope: 'photos'
  }).then(({ result, access_token }) => {
    if (result) {
      return global.bridge.send('VKWebAppCallAPIMethod', {
        method: 'photos.getWallUploadServer',
        params: {
          access_token,
          v: '5.120'
        }
      }).then((data) => {
        return {
          uri: data.response.upload_url,
          token: access_token
        };
      });
    } else {
      throw { reason: 'no image' };
    }
  });
};

const saveWallImage = (model, token) => {
  return global.bridge.send('VKWebAppCallAPIMethod', {
    method: 'photos.saveWallPhoto',
    params: {
      access_token: token,
      v: '5.120',
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
    getWallImage()
  ]).then(([upload, image]) => {
    const data = new FormData();
    data.append('photo', image, 'photo.png');
    return global.axios({
      method: 'post',
      url: `/vk-user/cors?url=${encodeURIComponent(upload.uri)}`,
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
  }).catch((e) => {
    if (e.reason === 'no image') {
      return shareMessage();
    }
    throw e;
  });
};

const shareStory = (points) => {
  return getStoryImage(points).then((image) => {
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

if (process.env.NODE_ENV !== 'production') {
  context.$share = {
    shareLink,
    shareMessage,
    shareWall,
    shareStory
  };
}

export { shareWall, shareStory, shareLink, shareMessage };

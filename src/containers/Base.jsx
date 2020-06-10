import React, { useState, useEffect } from 'react';

import App from './App';
import Offline from '../components/Offline';

import CommonError from '../components/CommonError';
import JoinError from '../components/JoinError';
import GameError from '../components/GameError';

import useGlobal from '../hooks/use-global';
import useRouter from '../hooks/use-router';

import sendError from '../utils/error';
import { interpretResponse } from '../utils/data';
import { VIEW_SETTINGS_BASE, VIEW_SETTINGS_EXTENDED } from '../utils/constants';

const Base = () => {
  const global = useGlobal();
  const router = useRouter();
  const [loaded, updateLoadState] = useState(false);
  const [showOffline, setShowOffline] = useState(false);

  useEffect(() => {
    const handleOnlineStatus = () => {
      global.store.isOffline =
        !window.navigator.onLine;

      window.requestAnimationFrame(() => {
        setShowOffline(global.store.isOffline);
      });
    };

    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);

    global.bridge.subscribe((event) => {
      if (!event || !event.detail) {
        return;
      }

      switch (event.detail.type) {
        case 'VKWebAppViewRestore':
        case 'VKWebAppLocationChanged':
          handleOnlineStatus();
          break;
      }
    });

    global.socket.on('connect', handleOnlineStatus);
    global.socket.on('disconnect', handleOnlineStatus);

    const handleError = (error, source, lineno, colno, raw) => {
      const send = () => {
        return sendError(error, raw, source).then((send) => {
          switch (send.type) {
            case 'bridge':
            case 'network':
              return false;
            case 'join':
              global.store.modal.content = (
                <JoinError />
              );
              return true;
            case 'game':
              global.store.modal.content = (
                <GameError code={send.payload} />
              );
              return true;
            default:
              global.store.modal.content = (
                <CommonError />
              );
              return true;
          }
        }).catch((e) => {
          console.error(e);
          return false;
        });
      };

      const prepare = () => {
        return new Promise((resolve) => {
          switch (router.state) {
            case 'modal':
              global.bus.once('modal:closed', resolve);
              global.bus.emit('modal:close');
              return;
            case 'popout':
              global.bus.emit('popout:close');
              resolve();
              return;
            default:
              window.requestAnimationFrame(() => {
                setTimeout(() => {
                  window.requestAnimationFrame(() => {
                    resolve();
                  });
                }, 1200);
              });
              return;
          }
        });
      };

      send().then((result) => {
        if (result) {
          return prepare().then(() => {
            global.bus.once('modal:updated', () => {
              global.bus.emit('modal:open');
            });
            global.bus.emit('modal:update');
          });
        }
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('abort', handleError);
    window.addEventListener('unhandledrejection', handleError);
    global.socket.on('exception', handleError);
    global.bus.on('join:error', handleError);
  }, []);

  useEffect(() => {
    const fetchUser = () => {
      return global.axios.post('/vk-user/auth').then((response) => {
        const user = interpretResponse(response);
        user.created = response.status === 200;

        global.store.user = {
          ...global.store.user,
          ...user
        };
        global.bus.emit('app:auth');
      });
    };

    global.bus.on('app:update', fetchUser);

    const windowLoad = new Promise((resolve) => {
      if (document.readyState === 'complete') {
        resolve();
      } else {
        // event
        window.onload = resolve;

        // fallback
        setTimeout(resolve, 1E4); // 10s
      }
    });

    const fontLoad = 'fonts' in document &&
      new Promise((resolve) => {
        if (document.fonts.status === 'loaded') {
          resolve();
        } else {
        // event
          document.fonts.onloadingdone = resolve;
          document.fonts.onloadingerror = resolve;

          // promise
          let { ready } = document.fonts;
          if (typeof ready === 'function') {
            ready = ready(); // vendor/old specific
          }
          Promise.resolve(ready).then(() => {
            const { status = 'error' } = document.fonts;
            if (status === 'loaded' || status === 'error') {
              resolve();
            } else {
              setTimeout(resolve, 1E3); // 1s
            }
          });

          // fallback
          setTimeout(resolve, 1E4);  // 10s
        }
      });

    const storageLoad = global.storage.get().then((persist) => {
      global.store.persist = {
        ...global.store.persist,
        ...persist
      };
    });

    const updateView = () => {
      if (global.bridge.supports('VKWebAppSetViewSettings')) {
        global.bridge.send('VKWebAppSetViewSettings', VIEW_SETTINGS_BASE).catch(() => {
          // See: https://github.com/VKCOM/vk-bridge/issues/103
        });
      }
    };

    global.bridge.subscribe((event) => {
      if (!event || !event.detail) {
        return;
      }

      switch (event.detail.type) {
        case 'VKWebAppViewRestore':
        case 'VKWebAppLocationChanged':
          updateView();
          break;
      }
    });

    Promise.all([
      fetchUser(),
      storageLoad,
      fontLoad,
      windowLoad
    ]).then(() => {
      global.socket.open();
      updateLoadState(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      setTimeout(() => {
        window.requestAnimationFrame(() => {
          // app seems ready

          // Plaform bug: flash WebView
          // Workaround: send before WebAppInit
          if (global.bridge.supports('VKWebAppSetViewSettings')) {
            global.bridge.send('VKWebAppSetViewSettings', VIEW_SETTINGS_EXTENDED).catch(() => {
              // See: https://github.com/VKCOM/vk-bridge/issues/103
            });
          }

          global.bridge.send('VKWebAppInit');
        });
      }, 600);
    }
  }, [loaded]);

  return (
    <React.StrictMode>
      {
        loaded ? (
          <App />
        ): (
          <div className="Root" />
        )
      }
      <Offline visible={showOffline} />
    </React.StrictMode>
  );
};

export default Base;

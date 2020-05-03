import React, { useState, useEffect } from 'react';

import App from './App';
import Offline from '../components/Offline';

import useGlobal from '../hooks/use-global';
import { interpretResponse } from '../utils/data';

const Base = () => {
  const [loaded, updateLoadState] = useState(false);
  const [showOffline, setShowOffline] = useState(false);
  const global = useGlobal();

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

    global.socket.on('connect', handleOnlineStatus);
    global.socket.on('disconnect', handleOnlineStatus);
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
        global.bus.emit('app:auth', global.store.user);
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
        global.bridge.send('VKWebAppSetViewSettings', {
          status_bar_style: 'light',
          action_bar_color: '#355FDE',
          navigation_bar_color: '#537EF9'
        });
      }
    };

    global.bridge.subscribe((event) => {
      if (!event || !event.detail) {
        return;
      }

      switch (event.detail.type) {
        case 'VKWebAppInitResult':
        case 'VKWebAppViewRestore':
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
    }).catch((e) => {
      console.log(e);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      setTimeout(() => {
        window.requestAnimationFrame(() => {
          // app seems ready
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

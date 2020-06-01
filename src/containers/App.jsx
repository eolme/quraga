import React, { useEffect, useState } from 'react';
import { ConfigProvider, Root } from '@vkontakte/vkui';

import Home from '../views/Home';
import Game from '../views/Game';

import useGlobal from '../hooks/use-global';

const App = () => {
  const global = useGlobal();
  const [view, setView] = useState('home');

  useEffect(() => {
    global.bus.on('game:start', () => {
      window.requestAnimationFrame(() => {
        setView('game');
      });
    });

    global.bus.on('game:end', () => {
      window.requestAnimationFrame(() => {
        setView('home');
      });
    });

    const join = () => {
      global.store.mode = 'join';
      global.bus.emit('game:start');
    };

    const checkJoinOrFetch = (location) => {
      // uuid v4
      const hash = /join-([0-9a-f]{8}-[0-9a-f]{4}-[4][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/.exec(location);
      if (hash && hash[1]) {
        if (global.bridge.supports('VKWebAppSetLocation')) {
          global.bridge.send('VKWebAppSetLocation', {
            location: ''
          });
        } else {
          window.location.hash = '';
        }

        global.store.join = hash[1];

        if (global.store.user.id) {
          join();
        } else {
          global.bus.once('app:auth', join);
        }
      } else {
        global.bus.emit('app:update');
      }
    };

    global.bridge.subscribe((event) => {
      if (!event || !event.detail) {
        return;
      }

      switch (event.detail.type) {
        case 'VKWebAppLocationChanged':
          checkJoinOrFetch(event.detail.data.location);
          break;
        case 'VKWebAppViewRestore':
          checkJoinOrFetch(window.location.hash);
          break;
        case 'VKWebAppOpenCodeReaderResult':
          checkJoinOrFetch(event.detail.data.code_data);
          break;
      }
    });

    checkJoinOrFetch(window.location.hash);
  }, []);

  return (
    <ConfigProvider>
      <Root activeView={view}>
        <Home id="home" />
        <Game id="game" />
      </Root>
    </ConfigProvider>
  );
};

export default App;

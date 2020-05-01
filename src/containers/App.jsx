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
      global.bus.emit('app:update');

      window.requestAnimationFrame(() => {
        setView('home');
      });
    });

    const join = () => {
      global.store.mode = 'join';
      global.bus.emit('game:start');
    };

    const checkJoin = (location) => {
      const hash = /join-([0-9]+)/.exec(location);
      if (hash && hash[1]) {
        if (global.bridge.supports('VKWebAppSetLocation')) {
          global.bridge.send('VKWebAppSetLocation', {
            location: ''
          });
        } else {
          window.location.hash = '';
        }

        global.store.join = hash[1];

        if (global.store.user) {
          join();
        } else {
          global.bus.once('app:auth', join);
        }
      }
    };

    global.bridge.subscribe((e) => {
      if (!e || !e.detail) {
        return;
      }

      switch (e.detail.type) {
        case 'VKWebAppLocationChanged':
          checkJoin(e.detail.data.location);
          break;
        case 'VKWebAppViewRestore':
          checkJoin(window.location.hash);
          break;
        case 'VKWebAppOpenCodeReaderResult':
          checkJoin(e.detail.data.code_data);
          break;
      }
    });

    checkJoin(window.location.hash);
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

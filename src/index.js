import '@vkontakte/vkui/dist/vkui.css';
import './styles/style.css';

import './utils/context';
import './utils/safe';
import './utils/egg';
import './utils/timers';
import './utils/global';

import React from 'react';
import ReactDOM from 'react-dom';
import Base from './containers/Base';

((fn) => {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
})(() => {
  const root = document.getElementById('root');
  root.addEventListener('touchstart', () => true, { passive: true });
  ReactDOM.render(<Base />, root);
});

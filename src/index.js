import '@vkontakte/vkui/dist/vkui.css';
import './styles/style.css';

import './utils/context';
import './utils/global';

import React from 'react';
import ReactDOM from 'react-dom';
import Base from './containers/Base';

(function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
})(() => {
  ReactDOM.render(<Base />, document.getElementById('root'));
});

import React, { useEffect } from 'react';
import PropTypes from 'prop-types';

import { Group, Header, Cell } from '@vkontakte/vkui';
import Button from '../components/Button';

import useGlobal from '../hooks/use-global';

const GameError = ({ code }) => {
  const global = useGlobal();
  let content = null;
  let action = null;

  useEffect(() => {
    const end = () => {
      global.bus.emit('game:end');
    };

    global.bus.once('modal:closed', end);

    return () => {
      global.bus.detach('modal:closed', end);
    };
  }, []);

  if (code === 1 || code === 2 || code === 3 || code === 5) {
    let message = null;

    switch (code) {
      case 1:
        message = 'Похоже игра уже началась...';
        break;
      case 2:
      case 3:
        message = 'Похоже игра уже завершилась...';
        break;
      case 5:
        message = 'Похоже такой игры не существует...';
        break;
    }

    content = `${message} Это вовсе не проблема! Просто создай новую игру или присоединись к другой.`;

    const createGame = () => {
      global.bus.once('modal:closed', () => {
        global.store.mode = 'multi';
        global.store.game = {};
        global.store.join = -1;

        window.requestAnimationFrame(() => {
          global.bus.emit('game:start');
        });
      });
      global.bus.emit('modal:close');
    };
    action = (<Button onClick={createGame} className="Button--blue">Создать новую игру</Button>);
  } else if (code === 4 || code === 6) {
    content = 'Пользователь еще не зашел в игру';
  }

  return (
    <Group header={<Header mode="secondary">Что-то пошло не так</Header>}>
      <Cell multiline={true}>
        {content}
      </Cell>
      {
        action ? (
          <Cell>
            {action}
          </Cell>
        ) : null
      }
    </Group>
  );
};

GameError.propTypes = {
  code: PropTypes.number
};

export default GameError;

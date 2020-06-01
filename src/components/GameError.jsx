import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { Group, Header, Cell } from '@vkontakte/vkui';
import Button from '../components/Button';

import useGlobal from '../hooks/use-global';

const GameError = ({ code }) => {
  const global = useGlobal();
  const prevent = useRef(false);

  let content = null;
  let action = null;

  useEffect(() => {
    const reset = () => {
      window.requestAnimationFrame(() => {
        if (!prevent.current) {
          global.bus.emit('game:end');
        }
      });
    };

    global.bus.once('modal:closed', reset);
    return () => {
      global.bus.detach('modal:closed', reset);
    };
  }, []);

  const startGame = () => {
    window.requestAnimationFrame(() => {
      global.bus.emit('game:end');
      window.requestAnimationFrame(() => {
        setTimeout(() => {
          window.requestAnimationFrame(() => {
            global.bus.emit('game:start');
          });
        }, 600);
      });
    });
  };

  if (code === 1 || code === 2 || code === 3 || code === 5 || code === 8) {
    let message = null;

    switch (code) {
      case 1:
      case 8:
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
      prevent.current = true;
      global.store.modal.state = true;
      global.bus.once('modal:closed', () => {
        if (!global.store.modal.state) {
          return;
        }
        global.store.modal.state = false;
        global.store.mode = 'multi';
        global.store.game = {};
        global.store.join = -1;
        startGame();
      });
      global.bus.emit('modal:close');
    };
    action = (<Button onClick={createGame} className="Button--blue">Создать новую игру</Button>);
  } else if (code === 7) {
    content = 'Тебе одиноко? Это вовсе не проблема! Ты всегда можешь начать одиночную игру.';

    const createGame = () => {
      prevent.current = true;
      global.store.modal.state = true;
      global.bus.once('modal:closed', () => {
        if (!global.store.modal.state) {
          return;
        }
        global.store.modal.state = false;
        global.store.mode = 'single';
        global.store.game = {};
        global.store.join = -1;
        startGame();
      });
      global.bus.emit('modal:close');
    };
    action = (<Button onClick={createGame} className="Button--blue">Начать одиночную игру</Button>);
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

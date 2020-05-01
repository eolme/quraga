import React, { useState, useEffect, useMemo } from 'react';
import { CSSTransition } from 'react-transition-group';
import { usePlatform, ANDROID } from '@vkontakte/vkui';

import useGlobal from '../hooks/use-global';

const History = () => {
  const global = useGlobal();
  const platform = usePlatform();
  const [history, updateHistory] = useState(global.store.user && global.store.user.history || null);

  useEffect(() => {
    const prettyUpdateHistory = () => {
      window.requestAnimationFrame(() => {
        updateHistory(global.store.user.history);
      });
    };

    global.bus.on('app:history', prettyUpdateHistory);
    return () => {
      global.bus.detach('app:history', prettyUpdateHistory);
    };
  }, []);

  const list = useMemo(() => {
    if (history) {
      return history.map((item) => {
        const creator =
          item.creator.user.id === global.store.user.id ?
            item.creator : item.opponent;

        const opponent =
          item.opponent.user.id === global.store.user.id ?
            item.creator : item.opponent;

        return (
          <div className="History__item" key={item.id}>
            <div className="History__item--left">
              <img src={creator.user.avatar} alt={creator.user.id} className="History__item-avatar" />
              <div className="History__item-info">
                <div>{creator.points}</div>
                <div>{creator.user.first_name}</div>
              </div>
            </div>
            {
              creator.points === opponent.points ? (
                <div className="History__item-badge History__item-badge--draw">draw</div>
              ) : (
                creator.points > opponent.points ? (
                  <div className="History__item-badge History__item-badge--win">win</div>
                ) : (
                  <div className="History__item-badge History__item-badge--lose">lose</div>
                )
              )
            }
            <div className="History__item--right">
              <div className="History__item-info">
                <div>{opponent.points}</div>
                <div>{opponent.user.first_name}</div>
              </div>
              <img src={opponent.user.avatar} alt={opponent.user.id} className="History__item-avatar" />
            </div>
          </div>
        );
      });
    }
    return null;
  }, [history]);

  return (
    <CSSTransition in={Boolean(history)} appear={true} classNames="fade" timeout={platform === ANDROID ? 300 : 600}>
      {
        history && history.length ? (
          <div className="History">
            <div className="History-in">
              <div className="History__caption">
                Последние игры
              </div>
              <div className="History__content">
                {list}
              </div>
            </div>
          </div>
        ) : (
          <div className="History" />
        )
      }
    </CSSTransition>
  );
};

export default History;

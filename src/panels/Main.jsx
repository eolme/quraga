import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Panel, Div, usePlatform, ANDROID, Tappable } from '@vkontakte/vkui';
import { CSSTransition } from 'react-transition-group';

import Header from '../components/Header';
import Social from '../components/Social';
import History from '../components/History';
import QrScanner from '../components/QrScanner';

import useGlobal from '../hooks/use-global';
import { interpretResponse } from '../utils/data';

const Main = ({ id, callback }) => {
  const global = useGlobal();
  const platform = usePlatform();
  const [loaded, updateLoadState] = useState(false);
  const [stats, updateStats] = useState({
    games_count: '00',
    wins_count: '00',
    rating: '00'
  });
  const [history, updateHistory] = useState(global.store.user && global.store.user.history || null);

  const forceShowCallback = useCallback(() => {
    window.requestAnimationFrame(() => {
      updateLoadState(true);
    });
  }, []);

  const forceUpdateHistory = useCallback(() => {
    window.requestAnimationFrame(() => {
      updateHistory(global.store.user.history);
    });
  }, []);

  const startGame = useCallback((mode) => {
    global.store.mode = mode;
    global.bus.emit('game:start');
  }, []);

  useEffect(() => {
    const fetchHistory = () => {
      return global.axios.get('/vk-user/my-games').then((response) => {
        const history = interpretResponse(response);

        if (global.store.user) {
          global.store.user.history = history;
          global.bus.emit('app:history', global.store.user.history);
        } else {
          global.bus.once('app:auth', () => {
            global.store.user.history = history;
            global.bus.emit('app:history', global.store.user.history);
          });
        }
      });
    };

    const checkHistory = () => {
      if (global.store.user.history && global.store.user.history.length) {
        forceUpdateHistory();
      }
    };

    const checkShowCallback = () => {
      if (global.store.user) {
        updateStats({
          games_count: `${global.store.user.games_count}`.padStart(2, '0'),
          wins_count: `${global.store.user.wins_count}`.padStart(2, '0'),
          rating: `${global.store.user.rating}`.padStart(2, '0'),
        });
        forceShowCallback();
      }
    };

    checkShowCallback();
    fetchHistory();

    global.bus.on('app:update', fetchHistory);
    global.bus.on('app:auth', checkShowCallback);
    global.bus.on('app:history', checkHistory);
    return () => {
      global.bus.detach('app:update', fetchHistory);
      global.bus.detach('app:auth', checkShowCallback);
      global.bus.detach('app:history', checkHistory);
    };
  }, []);

  return (
    <Panel id={id} separator={false} className="Panel--flex">
      <Header />
      <CSSTransition in={loaded} appear={true} classNames="fade" timeout={platform === ANDROID ? 300 : 600}>
        {
          loaded ? (
            <Div>
              <h1 className="PanelTitle">
                #умнейдома
                <QrScanner className="PanelTitle--after" />
              </h1>
              <div className="RatingInline" data-to="rating" onClick={callback}>
                <div className="RatingInline-in">
                  <div className="RatingInline__item">
                    <div className="RatingInline__item-caption">Игр</div>
                    <div className="RatingInline__item-content">{stats.games_count}</div>
                  </div>
                  <div className="RatingInline__item">
                    <div className="RatingInline__item-caption">Побед</div>
                    <div className="RatingInline__item-content">{stats.wins_count}</div>
                  </div>
                  <div className="RatingInline__item">
                    <div className="RatingInline__item-caption">Рейтинг</div>
                    <div className="RatingInline__item-content">{stats.rating}</div>
                  </div>
                  <div className="RatingInline__item">
                    <div className="RatingInline__item-caption">&nbsp;</div>
                    <div className="RatingInline__item-content">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 22" fill="none" className="Arrow">
                        <path stroke="#fff" strokeLinecap="round" strokeWidth="2" d="M1 1l11 9.2a1 1 0 010 1.6L1 21"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className="Play">
                <div className="Play-in">
                  <Tappable className="Play__item Play__item--single" onClick={startGame.bind(null, 'single')}>
                    <div className="Play__item-caption">
                      vs
                    </div>
                    <div className="Play__item-content">
                      Одиночная игра
                    </div>
                  </Tappable>
                  <Tappable className="Play__item Play__item--multi"  onClick={startGame.bind(null, 'multi')}>
                    <div className="Play__item-caption">
                      vs
                    </div>
                    <div className="Play__item-content">
                      Игра для друзей
                    </div>
                  </Tappable>
                </div>
              </div>
              {
                history === null ? null : (
                  history && history.length ? (
                    <History />
                  ) : (
                    <Social />
                  )
                )
              }
            </Div>
          ) : (
            <Div />
          )
        }
      </CSSTransition>
    </Panel>
  );
};

Main.propTypes = {
  id: PropTypes.string.isRequired,
  callback: PropTypes.func.isRequired
};

export default Main;

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Panel, Div, FixedLayout, PanelHeaderClose, usePlatform, ANDROID, classNames as cn } from '@vkontakte/vkui';
import transitionEvents from '@vkontakte/vkui/dist/lib/transitionEvents';
import { SwitchTransition, CSSTransition } from 'react-transition-group';
import useGlobal from '../hooks/use-global';
import qr from '@vkontakte/vk-qr';

import Countdown from 'react-countdown';
import Timer from '../components/Timer';
import Clock from '../components/Clock';
import Button from '../components/Button';

import { APP_LINK } from '../utils/constants';
import { shareLink, shareMessage, shuffle } from '../utils/data';

const Unknown = {
  avatar: require(/* webpackPreload: true */ '../assets/unknown.png'),
  first_name: 'Незнакомец',
  id: -1
};

const Sleeper = {
  avatar: require(/* webpackPreload: true */ '../assets/sleeper.png'),
  first_name: 'Соня',
  id: -1
};

const Quiz = ({ id }) => {
  const global = useGlobal();
  const platform = usePlatform();
  const [type, setType] = useState(null);
  const [view, setView] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [answered, setState] = useState(false);
  const [percent, setPercent] = useState(50);
  const [points, setPoints] = useState({ creator: 0, opponent: 0 });

  const exit = useCallback(() => {
    global.store.mode = null;
    global.store.game = null;
    global.store.join = -1;

    global.bus.emit('game:end');
  }, []);

  const recreate = useCallback(() => {
    global.store.mode = 'recreate';
    global.socket.emit('create-online-game');
  }, []);

  const referrer = useCallback(() => {
    shareMessage();
  }, []);

  useEffect(() => {
    if (global.store.game) {
      const totalPoints = points.creator + points.opponent;
      let nextPercent = 50;
      if (totalPoints !== 0) {
        const userPoints = points[global.store.game.is];
        nextPercent = Math.round(userPoints / totalPoints * 100);
      }

      setPercent(nextPercent);
    }
  }, [points]);

  useEffect(() => {
    if (answer) {
      const creator = parseInt(answer.points.creator, 10);
      const opponent = parseInt(answer.points.opponent, 10);

      if (global.store.game.is === 'creator') {
        if (creator !== 0) {
          global.store.game.success += 1;
        }
      } else {
        if (opponent !== 0) {
          global.store.game.success += 1;
        }
      }

      setPoints({
        creator: points.creator + creator,
        opponent: points.opponent + opponent
      });
    }
  }, [answer]);

  const answers = useMemo(() => {
    if (question) {
      const onAnswerClick = (id) => {
        if (answered) {
          return;
        }
        setState(true);

        global.effects.vibrate.touch();

        global.socket.emit('answer', {
          game_id: global.store.game.id,
          answer_id: id
        });
      };

      return question.answers.map((item) => {
        return (
          <Button
            key={item.id}
            disabled={answered}
            onClick={onAnswerClick.bind(null, item.id)}
            className={cn({
              'Button--green':
                answer &&
                answer.correct_answer_id === item.id,
              'Button--red':
                answer &&
                answer.correct_answer_id !== item.id &&
                answer.game_answers.find((model) => {
                  return model.user.id === global.store.game[global.store.game.is].id &&
                    model.answer_id === item.id;
                })
            })}
            after={
              answer && answer.game_answers.filter((model) => {
                return model.answer_id === item.id;
              }).map(({ user }) => {
                return (
                  <img src={user.avatar} key={user.id} alt={user.id} className="AnswerAvatar" />
                );
              })
            }
          >
            {item.title}
          </Button>
        );
      });
    }
    return null;
  }, [question, answer, answered]);

  useEffect(() => {
    window.requestAnimationFrame(() => {
      switch (type) {
        case 'prepare':
          setView(
            <div className="Stage">
              <div className="GameResult__title">Ждем твоего противника</div>
              <div className="Clock">?</div>
              <div className="GameResult">
                <div className="GameResult__item">
                  <img
                    src={global.store.user.avatar}
                    alt={global.store.user.id}
                    className="GameResult__avatar"
                  />
                  <div className="GameResult__caption">{global.store.user.first_name}</div>
                </div>
                <div className="GameResult__item">
                  <img
                    src={Sleeper.avatar}
                    alt={Sleeper.id}
                    className="GameResult__avatar"
                  />
                  <div className="GameResult__caption">{Sleeper.first_name}</div>
                </div>
                <div className="GameResult__versus">vs</div>
              </div>
              <FixedLayout vertical="bottom">
                <Div>
                  <div className="GameResult__content">
                    <Button onClick={() => global.bus.emit('modal:show')} className="GameResult__button">Показать QR-код</Button>
                  </div>
                </Div>
              </FixedLayout>
            </div>
          );
          return;
        case 'preview':
          setView(
            <div className="Stage">
              <div className="GameResult__title">Битва умов начнется через</div>
              <Countdown
                key={global.store.game.id}
                renderer={Clock}
                date={Date.now() + global.store.game.ttw * 1000}
              />
              <div className="GameResult">
                <div className="GameResult__item">
                  <img
                    src={global.store.game[global.store.game.is].avatar}
                    alt={global.store.game[global.store.game.is].id}
                    className="GameResult__avatar"
                  />
                  <div className="GameResult__caption">{global.store.game[global.store.game.is].first_name}</div>
                </div>
                <div className="GameResult__item">
                  <img
                    src={global.store.game[global.store.game.vs].avatar}
                    alt={global.store.game[global.store.game.vs].id}
                    className="GameResult__avatar"
                  />
                  <div className="GameResult__caption">{global.store.game[global.store.game.vs].first_name}</div>
                </div>
                <div className="GameResult__versus">vs</div>
              </div>
            </div>
          );
          return;
        case 'question':
          setView(
            <div className="Stage">
              <div className="StageTitle">
                <Countdown
                  key={question.id}
                  renderer={Timer}
                  date={question.ttw}
                />
                <img src={require(/* webpackPreload: true */ '../assets/alarm.svg')} alt="Время" className="StageTitle__icon" />
                <CSSTransition
                  in={Boolean(global.store.game.badge)}
                  appear={true}
                  classNames="fade"
                  timeout={platform === ANDROID ? 300 : 600}
                >
                  {
                    global.store.game.badge ? (
                      <div className="PanelTitle--after StageTitle__badge">{global.store.game.badge}</div>
                    ) : (
                      <div className="PanelTitle--after" />
                    )
                  }
                </CSSTransition>
              </div>
              <div className="Stage__caption">Вопрос {question.order} из {global.store.game.questions_count}</div>
              <div className="Stage__content">{question.title}</div>
              <div className="Stage__answers">{answers}</div>
            </div>
          );
          return;
        case 'result':
          setView(
            <div className="Stage">
              {
                global.store.game[global.store.game.vs].id === -1 ? (
                  <>
                    <img
                      src={require(/* webpackPreload: true */ '../assets/win.png')}
                      alt="Молодец"
                      className="GameResult__image"
                    />
                    <div className="GameResult__title">Молодец!</div>
                  </>
                ) : (
                  points[global.store.game.is] === points[global.store.game.vs] ? (
                    <>
                      <img
                        src={require(/* webpackPreload: true */ '../assets/win.png')}
                        alt="Ничья"
                        className="GameResult__image"
                      />
                      <div className="GameResult__title">Ничья!</div>
                    </>
                  ) : (
                    points[global.store.game.is] > points[global.store.game.vs] ? (
                      <>
                        <img
                          src={require(/* webpackPreload: true */ '../assets/win.png')}
                          alt="Победа"
                          className="GameResult__image"
                        />
                        <div className="GameResult__title">Победа!</div>
                      </>
                    ) : (
                      <>
                        <img
                          src={require(/* webpackPreload: true */ '../assets/lose.png')}
                          alt="Поражение"
                          className="GameResult__image"
                        />
                        <div className="GameResult__title">Поражение!</div>
                      </>
                    )
                  )
                )
              }
              <div className="GameResult__caption">Верных ответов: {global.store.game.success}</div>
              <div className="GameResult">
                <div className="GameResult__item">
                  <img
                    src={global.store.game[global.store.game.is].avatar}
                    alt={global.store.game[global.store.game.is].id}
                    className="GameResult__avatar"
                  />
                  <div className="GameResult__caption">{global.store.game[global.store.game.is].first_name}</div>
                  <div className="GameResult__title">{points[global.store.game.is]}</div>
                </div>
                {
                  global.store.game[global.store.game.vs].id !== -1 && (
                    <>
                      <div className="GameResult__item">
                        <img
                          src={global.store.game[global.store.game.vs].avatar}
                          alt={global.store.game[global.store.game.vs].id}
                          className="GameResult__avatar"
                        />
                        <div className="GameResult__caption">{global.store.game[global.store.game.vs].first_name}</div>
                        <div className="GameResult__title">{points[global.store.game.vs]}</div>
                      </div>
                      <div className="GameResult__versus">vs</div>
                    </>
                  )
                }
              </div>
              <FixedLayout vertical="bottom">
                <Div>
                  <div className="GameResult__content">
                    {
                      global.store.mode !== 'single' && (
                        <Button onClick={recreate} className="GameResult__button">Реванш!</Button>
                      )
                    }
                    <Button onClick={referrer} className="GameResult__button">Поделиться</Button>
                  </div>
                </Div>
              </FixedLayout>
            </div>
          );
          return;
        default:
          setView(null);
          return;
      }
    });
  }, [type, question, answers]);

  useEffect(() => {
    let timeout = null;

    global.socket.on('game-invite', (game) => {
      if (global.store.mode !== 'recreate') {
        if (game.creator.id === global.store.game[global.store.game.vs].id) {
          global.socket.emit('connect-to-online-game', game);
        }
      }
    });

    global.socket.on('game-created', (game) => {
      global.store.game = {
        ...global.store.game,
        ...game
      };

      if (global.store.mode === 'multi') {
        const link = `${APP_LINK}#join-${global.store.game.id}`;
        const __html = qr.createQR(link, {
          qrSize: 272,
          isShowLogo: true,
          foregroundColor: '#004ba1',
          logoColor: '#004ba1'
        });
        const share = () => shareLink(link);

        global.store.modal = (
          <Div>
            <div className="QrCode" dangerouslySetInnerHTML={{ __html }} />
            <div className="QrCode__info">
              Покажи этот QR-код другу или поделись с ним ссылкой
            </div>
            <Button onClick={share} className="Button--blue">Поделиться ссылкой</Button>
          </Div>
        );

        global.bus.emit('modal:update');
        timeout = setTimeout(() => {
          global.bus.emit('modal:show');
        }, 600);
      }

      if (global.store.mode === 'recreate') {
        global.socket.emit('send-invite', {
          game_id: global.store.game.id,
          user_id: global.store.game[global.store.game.vs].id
        });
      }

      setType('prepare');
    });

    global.socket.on('game-ready', () => {
      global.store.game = {
        ...global.store.game,
        current: 0,
        success: 0,
        badge: null
      };
    });

    global.socket.on('game-preview', (game) => {
      global.store.game = {
        ...global.store.game,
        ...game
      };

      global.store.game.is =
        global.store.game.creator.id === global.store.user.id ?
          'creator' :
          'opponent';

      global.store.game.vs =
        global.store.game.creator.id === global.store.user.id ?
          'opponent':
          'creator';

      if (global.store.game.opponent === null) {
        global.store.game.opponent = Unknown;
      }

      if (global.store.mode === 'multi') {
        global.bus.emit('modal:close');
      }

      setPoints({ creator: 0, opponent: 0 });
      setType('preview');
    });

    global.socket.on('badge', (badge) => {
      global.store.game.badge = badge.message;
    });

    global.socket.on('new-question', (ask) => {
      global.store.game.badge = null;

      ask.ttw = Date.now() + ask.ttw * 1000;
      ask.order = global.store.game.current += 1;
      ask.answers = shuffle(ask.answers);

      setState(false);
      setQuestion(ask);
      setType('question');
    });

    global.socket.on('question-closed', (answer) => {
      global.effects.vibrate.result();

      setState(true);
      setAnswer(answer);
      setType('question');
    });

    global.socket.on('game-closed', (result) => {
      global.store.game = {
        ...global.store.game,
        ...result
      };

      setType('result');
    });

    switch (global.store.mode) {
      case 'single':
        global.socket.emit('start-offline-game');
        break;
      case 'multi':
        global.socket.emit('create-online-game');
        break;
      case 'join': {
        const game_id = +global.store.join;
        if (game_id === -1) {
          global.bus.emit('game:end');
          return;
        }
        global.store.join = -1;
        global.socket.emit('connect-to-online-game', { game_id });
        break;
      }
      default:
        global.bus.emit('game:end');
        return;
    }

    return () => {
      clearTimeout(timeout);
      global.bus.emit('modal:close');
      global.store.modal = null;

      global.socket.off('game-invite');
      global.socket.off('game-created');
      global.socket.off('game-preview');
      global.socket.off('badge');
      global.socket.off('new-question');
      global.socket.off('question-closed');
      global.socket.off('game-closed');
    };
  }, []);

  const memoType = useMemo(() => {
    if (type === 'question') {
      return `${type}-${question.order}`;
    } else {
      return type;
    }
  }, [type, question]);

  return (
    <Panel id={id} separator={false} className="Panel--flex Panel--clear">
      <SwitchTransition mode="out-in">
        <CSSTransition
          key={memoType}
          addEndListener={(node, done) => {
            if (transitionEvents.supported) {
              node.addEventListener(transitionEvents.transitionEndEventName, done, false);
            } else {
              setTimeout(done, 300);
            }
          }}
          classNames="switch"
        >
          <Div>{view}</Div>
        </CSSTransition>
      </SwitchTransition>
      {
        type === 'question' &&
        global.store.game &&
        global.store.game[global.store.game.vs].id !== -1 &&
        (
          <FixedLayout vertical="bottom" className="GameOverlay">
            <div className="GamePlayers">
              <div className="GamePlayers--left">
                <img
                  src={global.store.game[global.store.game.is].avatar}
                  alt={global.store.game[global.store.game.is].id}
                  className="GamePlayers__avatar"
                />
                <div>{global.store.game[global.store.game.is].first_name}</div>
              </div>
              <div className="GamePlayers--right">
                <div>{global.store.game[global.store.game.vs].first_name}</div>
                <img
                  src={global.store.game[global.store.game.vs].avatar}
                  alt={global.store.game[global.store.game.vs].id}
                  className="GamePlayers__avatar"
                />
              </div>
            </div>
            <div className="GamePercent">
              <div className="GamePercent-in" style={{ transform: `translateX(${percent - 100}%)` }} />
            </div>
          </FixedLayout>
        )
      }
      {
        (type === 'prepare' || type === 'result') &&
        (
          <PanelHeaderClose className="GameClose" onClick={exit}>Закрыть</PanelHeaderClose>
        )
      }
    </Panel>
  );
};

Quiz.propTypes = {
  id: PropTypes.string.isRequired
};

export default Quiz;

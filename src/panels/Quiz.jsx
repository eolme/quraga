import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import PropTypes from 'prop-types';
import {
  ANDROID,
  classNames as cn,
  Div,
  FixedLayout,
  Gallery,
  Panel,
  PanelHeaderClose,
  usePlatform
} from '@vkontakte/vkui';
import transitionEvents from '@vkontakte/vkui/dist/lib/transitionEvents';
import {CSSTransition, SwitchTransition} from 'react-transition-group';
import useGlobal from '../hooks/use-global';
import qr from '@vkontakte/vk-qr';

import Countdown from 'react-countdown';
import Timer from '../components/Timer';
import Clock from '../components/Clock';
import Button from '../components/Button';

import {APP_LINK} from '../utils/constants';
import {shareLink, shareMessage, shuffle} from '../utils/data';


const EMOTION_SIZE = 40;

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

const emojiCount = 10;

const Quiz = ({id}) => {
  const global = useGlobal();
  const platform = usePlatform();
  const [type, setType] = useState(null);
  const [view, setView] = useState(null);
  const [badge, setBadge] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState(null);
  const [percent, setPercent] = useState(50);
  const [points, setPoints] = useState({creator: 0, opponent: 0});

  let particles = [];
  let looped = false;

  let canvas = null;
  let ctx = null;
  const images = {};

  const canvasRef = useRef();

  const getImage = (emoji) => {
    if (!images[emoji]) {
      images[emoji] = new Image(EMOTION_SIZE, EMOTION_SIZE);
      images[emoji].src = emoji;
    }

    return images[emoji];
  };

  const createParticle = (emoji, fromId) => {

    const fromElement = document.querySelector(`[data-user-id="${fromId}"]`);

    if (!fromElement) {
      return;
    }

    const size = 50;
    const speedHorz = Math.random() * 10;
    const speedUp = Math.random() * 25;
    const spinVal = Math.random() * 360;
    const spinSpeed = ((Math.random() * 35)) * (Math.random() <= .5 ? -1 : 1);
    const top = fromElement.getBoundingClientRect().y;
    const left = fromElement.getBoundingClientRect().x;
    const direction = Math.random() <= .5 ? -1 : 1;

    const image = getImage(emoji);

    ctx.drawImage(image, left, top, EMOTION_SIZE, EMOTION_SIZE);

    particles.push({
      image,
      size,
      speedHorz,
      speedUp,
      spinVal,
      spinSpeed,
      top,
      left,
      direction,
    });
  };

  const updateParticles = () => {

    const height = canvas.height;
    ctx.clearRect(0,0, canvas.width, canvas.height);


    particles.forEach((p) => {
      ctx.save();

      p.spinVal = p.spinVal + p.spinSpeed;
      p.left = p.left - (p.speedHorz * p.direction);
      p.top = p.top - p.speedUp;
      p.speedUp = Math.min(p.size, p.speedUp - 1);


      ctx.translate(p.left, p.top);
      ctx.rotate(p.spinVal * Math.PI / 180);
      ctx.translate((-p.image.width)/2, (-p.image.height)/2);


      ctx.drawImage(p.image, 0, 0, EMOTION_SIZE, EMOTION_SIZE);

      ctx.restore();


      if (p.top >= height + EMOTION_SIZE) {
        particles = particles.filter((o) => o !== p);
        particles.slice(p, 1);
      }
    });
  };

  const loop = () => {
    if (particles.length === 0) {
      looped = false;
      return;
    }
    looped = true;

    updateParticles();

    requestAnimationFrame(loop);
  };


  const runFountain = (imageUrl, fromId) => {
    for (let i = 0; i < emojiCount; i++) {
      createParticle(imageUrl, fromId);
    }

    if (!looped) {
      loop();
    }
  };

  let immediateAnswered = false;
  const [renderAnswered, setRenderAnswered] = useState(false);

  const setState = useCallback((state) => {
    immediateAnswered = state;
    setRenderAnswered(state);
  }, [setRenderAnswered]);

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

  const emotions = useMemo(() => {

    const onEmotionClick = (id) => {
      global.socket.emit('react', {
        game_id: global.store.game.id,
        emotion_id: id
      });
    };

    return (
      <Gallery
        slideWidth="90%"
        style={{height: 60}}
        bullets={false}
        align="center"
      >
        {global.store.user.emotionPacks.map((emotionPack) => {
          return (<div key={emotionPack.id} className="Emotions">
            {emotionPack.emotions.map((emotion) => {
              return (
                <button className="Emotions__button" onClick={onEmotionClick.bind(null, emotion.id)} key={emotion.id}>
                  <img
                    alt={emotion.title}
                    className="Emotions__image"
                    src={emotion.url}/>
                </button>);
            })}
          </div>);}
        )}
      </Gallery>
    );
  }, []);

  const answers = useMemo(() => {
    if (question) {
      const onAnswerClick = (id) => {
        if (renderAnswered || immediateAnswered) {
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
            disabled={renderAnswered}
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
  }, [question, answer, renderAnswered]);

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
                  in={Boolean(badge)}
                  appear={true}
                  classNames="fade"
                  timeout={platform === ANDROID ? 300 : 600}
                >
                  {
                    badge ? (
                      <div className="PanelTitle--after StageTitle__badge">{badge}</div>
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
  }, [type, badge, question, answers]);

  useEffect(() => {
    let timeout = null;

    global.socket.on('game-invite', (game) => {
      if (global.store.mode !== 'recreate') {
        if (game.creator.id === global.store.game[global.store.game.vs].id) {
          const deny = () => {
            global.bus.emit('modal:close');
          };

          const accept = () => {
            global.socket.emit('connect-to-online-game', game);
          };

          global.store.modal = (
            <Div className="Recreate">
              <div className="RecreateMessage">
                <img
                  src={global.store.game[global.store.game.vs].avatar}
                  alt={global.store.game[global.store.game.vs].id}
                  className="RecreateMessage__avatar"
                />
                <div className="RecreateMessage__content">
                  <span>Йо, может реванш?</span>
                  <img
                    src={require(/* webpackPreload: true */ '../assets/vs.png')}
                    alt=""
                    className="RecreateMessage__icon"
                  />
                </div>
              </div>
              <div className="GameResult__content">
                <Button onClick={deny} className="GameResult__button">Отклонить</Button>
                <Button onClick={accept} className="GameResult__button Button--blue">Принять</Button>
              </div>
            </Div>
          );

          global.bus.emit('modal:update');

          clearTimeout(timeout);
          timeout = setTimeout(() => {
            global.bus.emit('modal:show');
          }, 600);
        }
      }
    });

    global.socket.on('game-created', (game) => {
      global.store.game = {
        ...global.store.game,
        ...game
      };

      if (global.store.mode === 'multi' || global.store.mode === 'recreate') {
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

        if (global.store.mode === 'multi') {
          clearTimeout(timeout);
          timeout = setTimeout(() => {
            global.bus.emit('modal:show');
          }, 600);
        } else {
          global.socket.emit('send-invite', {
            game_id: global.store.game.id,
            user_id: global.store.game[global.store.game.vs].id
          });
        }
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

      global.bus.emit('modal:close');

      setPoints({ creator: 0, opponent: 0 });
      setType('preview');
    });

    global.socket.on('badge', (badge) => {
      setBadge(badge.message);
    });

    global.socket.on('new-question', (ask) => {
      ++global.store.game.current;

      ask.ttw = Date.now() + ask.ttw * 1000;
      ask.order = global.store.game.current;
      ask.answers = shuffle(ask.answers);

      setState(false);
      setQuestion(ask);
      setBadge(null);
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

    global.socket.on('got-react', (data) => {
      const emotionUrl = data.emotion_url;
      const fromId = data.from_id;

      runFountain(emotionUrl, fromId);
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

    canvas = canvasRef.current;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');

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
      <canvas className="emotion-bg-canvas" ref={canvasRef}></canvas>
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
          <FixedLayout vertical="bottom">
            {emotions}

            <div className="GamePlayers">
              <div className="GamePlayers--left">
                <div data-user-id={global.store.game[global.store.game.is].id}>
                  <img
                    src={global.store.game[global.store.game.is].avatar}
                    alt={global.store.game[global.store.game.is].id}
                    className="GamePlayers__avatar"
                  />
                </div>
                <div>{global.store.game[global.store.game.is].first_name}</div>
              </div>
              <div className="GamePlayers--right">
                <div>{global.store.game[global.store.game.vs].first_name}</div>
                <div data-user-id={global.store.game[global.store.game.vs].id}>
                  <img
                    src={global.store.game[global.store.game.vs].avatar}
                    alt={global.store.game[global.store.game.vs].id}
                    className="GamePlayers__avatar"
                  />
                </div>
              </div>
            </div>
            <div className="GamePercent">
              <div className="GamePercent-in" style={{transform: `translateX(${percent - 100}%)`}}/>
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

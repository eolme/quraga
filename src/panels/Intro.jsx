import React, { useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { Panel, Div, Gallery, usePlatform, ANDROID, classNames as cn } from '@vkontakte/vkui';
import { CSSTransition } from 'react-transition-group';

import Header from '../components/Header';
import Button from '../components/Button';
import Logo from '../components/Logo';

const Intro = ({ id, callback }) => {
  const platform = usePlatform();
  const [tab, setTab] = useState(0);

  const tabOnClick = useCallback((index) => {
    window.requestAnimationFrame(() => {
      setTab(index);
    });
  }, []);

  return (
    <Panel id={id} separator={false} className="Panel--flex">
      <Header />
      <CSSTransition in={true} appear={true} classNames="fade" timeout={platform === ANDROID ? 300 : 600}>
        <Gallery
          slideWidth="100%"
          align="right"
          slideIndex={tab}
          onChange={tabOnClick}
          className="Gallery--fill"
        >
          <Div>
            <div className="IntroPreview">
              <Logo className="IntroPreview--image" />
            </div>
            <h1 className="PanelTitle">Привет, друг!</h1>
            <div>
              Это QURAGA - интеллектуальная
              игра, в которой можно бросить
              вызов своим друзьям и
              посоревноваться за место
              в рейтинге со случайными
              пользователями, попутно узнавая
              новые интересные факты!
            </div>
          </Div>
          <Div>
            <div className="IntroPreview">
              <img
                src={require(/* webpackPreload: true */ '../assets/smile.png')}
                alt="Друзья"
                className="IntroPreview--image"
              />
            </div>
            <h1 className="PanelTitle">
              Соревнуйся с друзьями или же
              просто бросай вызов незнакомцам
            </h1>
          </Div>
          <Div>
            <div className="IntroPreview">
              <img
                src={require(/* webpackPreload: true */ '../assets/categories.png')}
                alt="Категории"
                className="IntroPreview--image"
              />
            </div>
            <h1 className="PanelTitle">
              Отвечай на вопросы из десятка
              различных категорий
            </h1>
          </Div>
        </Gallery>
      </CSSTransition>
      <CSSTransition in={true} appear={true} classNames="fade" timeout={platform === ANDROID ? 300 : 600}>
        <div className="IntroOverlay">
          <div className="IntroOverlay__pagination">
            <div className={cn('IntroOverlay__pagination-bullet', tab === 0 && 'IntroOverlay__pagination-bullet--active')}></div>
            <div className={cn('IntroOverlay__pagination-bullet', tab === 1 && 'IntroOverlay__pagination-bullet--active')}></div>
            <div className={cn('IntroOverlay__pagination-bullet', tab === 2 && 'IntroOverlay__pagination-bullet--active')}></div>
          </div>
          {tab === 0 && (<Button onClick={tabOnClick.bind(null, 1)} className="Layout--bottom">Отлично</Button>)}
          {tab === 1 && (<Button onClick={tabOnClick.bind(null, 2)} className="Layout--bottom">Вперёд</Button>)}
          {tab === 2 && (<Button onClick={callback} data-to="home" className="Layout--bottom">Поехали</Button>)}
        </div>
      </CSSTransition>
    </Panel>
  );
};

Intro.propTypes = {
  id: PropTypes.string.isRequired,
  callback: PropTypes.func.isRequired
};

export default memo(Intro);

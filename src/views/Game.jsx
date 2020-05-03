import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { View } from '@vkontakte/vkui';

import Quiz from '../panels/Quiz';

import PopoutProvider from '../components/PopoutProvider';
import ModalProvider from '../components/ModalProvider';

import { swipe } from '../utils/events';

const Game = ({ id }) => {
  useEffect(() => {
    if (swipe.state) {
      swipe.disable();

      return () => {
        swipe.enable();
      };
    }
  }, []);

  return (
    <View
      activePanel="quiz"
      id={id}
      modal={<ModalProvider />}
      popout={<PopoutProvider />}
      header={false}
    >
      <Quiz id="quiz" />
    </View>
  );
};

Game.propTypes = {
  id: PropTypes.string.isRequired
};

export default Game;

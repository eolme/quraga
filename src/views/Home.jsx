import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { View } from '@vkontakte/vkui';
import usePanels from '../hooks/use-panels';
import useGlobal from '../hooks/use-global';

import Intro from '../panels/Intro';
import Main from '../panels/Main';
import Rating from '../panels/Rating';

import PopoutProvider from '../components/PopoutProvider';
import ModalProvider from '../components/ModalProvider';

const getCurrentPanel = (accept) => accept ? 'main' : 'intro';

const Home = ({ id }) => {
  const global = useGlobal();
  const panels = usePanels(getCurrentPanel(global.store.user.created && global.store.persist.accept));

  const reset = useCallback(() => {
    panels.setHistory(() => {
      const resetInitialPanel = getCurrentPanel(global.store.user.created && global.store.persist.accept);
      panels.setActivePanel(resetInitialPanel, true);
      return [resetInitialPanel];
    });
  }, []);

  const accept = useCallback(() => {
    global.store.user.created = true;
    global.store.persist.accept = true;

    global.storage.set(global.store.persist).then(() => {
      reset();
    });
  }, []);

  return (
    <View
      activePanel={panels.activePanel}
      history={panels.history}
      onSwipeBack={panels.goBack}
      id={id}
      modal={<ModalProvider />}
      popout={<PopoutProvider />}
      header={false}
    >
      <Intro id="intro" callback={accept} />
      <Main id="main" callback={panels.goForward} />
      <Rating id="rating" callback={panels.goBack} />
    </View>
  );
};

Home.propTypes = {
  id: PropTypes.string.isRequired
};

export default Home;

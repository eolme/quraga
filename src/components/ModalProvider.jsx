import React, { useState, useCallback, useEffect } from 'react';
import { ModalRoot, ModalPage, ModalPageHeader, withModalRootContext } from '@vkontakte/vkui';
import useGlobal from '../hooks/use-global';

const ModalConsumer = withModalRootContext(({ by, updateModalHeight }) => {
  const global = useGlobal();

  useEffect(() => {
    window.requestAnimationFrame(() => {
      updateModalHeight();
    });
  }, [by]);

  return (<>{global.store.modal}</>);
});

const ModalProvider = () => {
  const global = useGlobal();
  const [updateCounter, setUpdateCounter] = useState(0);
  const [activeModal, setActiveModal] = useState(null);

  const show = useCallback(() => {
    window.requestAnimationFrame(() => {
      setActiveModal('modal');
    });
  }, []);

  const close = useCallback(() => {
    window.requestAnimationFrame(() => {
      setActiveModal(null);
    });
  }, []);

  useEffect(() => {
    const update = () => {
      window.requestAnimationFrame(() => {
        setUpdateCounter(updateCounter + 1);
      });
    };

    global.bus.on('modal:update', update);

    return () => {
      global.bus.detach('modal:update', update);
    };
  }, [updateCounter]);

  useEffect(() => {
    global.bus.on('modal:show', show);
    global.bus.on('modal:close', close);

    return () => {
      global.bus.detach('modal:show', show);
      global.bus.detach('modal:close', close);
    };
  }, []);

  return (
    <ModalRoot activeModal={activeModal} onClose={close}>
      <ModalPage
        id="modal"
        onClose={close}
        header={<ModalPageHeader left={null} right={null} />}
      >
        <ModalConsumer by={updateCounter} />
      </ModalPage>
    </ModalRoot>
  );
};

export default ModalProvider;

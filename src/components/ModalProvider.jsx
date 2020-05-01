import React, { useState, useCallback, useEffect } from 'react';
import { ModalRoot, ModalPage, ModalPageHeader, withModalRootContext } from '@vkontakte/vkui';
import useGlobal from '../hooks/use-global';

const ModalConsumer = withModalRootContext(({ modal, updateModalHeight }) => {
  useEffect(() => {
    window.requestAnimationFrame(() => {
      updateModalHeight();
    });
  }, [modal]);

  return (<>{modal}</>);
});

const ModalProvider = () => {
  const global = useGlobal();
  const [modal, updateModal] = useState(global.store.modal);
  const [activeModal, setActiveModal] = useState(null);

  const show = useCallback(() => {
    window.requestAnimationFrame(() => {
      setActiveModal('modal');
    });
  }, []);

  const update = useCallback(() => {
    window.requestAnimationFrame(() => {
      updateModal(global.store.modal);
    });
  }, []);

  const close = useCallback(() => {
    window.requestAnimationFrame(() => {
      setActiveModal(null);
    });
  }, []);

  useEffect(() => {
    global.bus.on('modal:update', update);
    global.bus.on('modal:show', show);
    global.bus.on('modal:close', close);

    return () => {
      global.bus.detach('modal:update', update);
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
        <ModalConsumer modal={modal} />
      </ModalPage>
    </ModalRoot>
  );
};

export default ModalProvider;

import React, { useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { ModalRoot, ModalPage, ModalPageHeader, withModalRootContext } from '@vkontakte/vkui';
import useGlobal from '../hooks/use-global';
import useRouter from '../hooks/use-router';

const ModalConsumer = withModalRootContext(({ by, updateModalHeight }) => {
  const global = useGlobal();

  useEffect(() => {
    window.requestAnimationFrame(() => {
      updateModalHeight();
    });
  }, [by]);

  return (<>{global.store.modal.content}</>);
});

ModalConsumer.propTypes = {
  by: PropTypes.number.isRequired,
  updateModalHeight: PropTypes.func
};

const ModalProvider = () => {
  const global = useGlobal();
  const router = useRouter();
  const [updateCounter, setUpdateCounter] = useState(0);
  const [activeModal, setActiveModal] = useState(null);
  const mountedRef = useRef();

  const closeByRouter = useCallback((name) => {
    if (name === 'modal') {
      window.requestAnimationFrame(() => {
        setActiveModal(null);
      });
    }
  }, []);

  const open = useCallback(() => {
    window.requestAnimationFrame(() => {
      setActiveModal('modal');
      global.bus.once('router:popstate', closeByRouter);
      router.push('modal');
    });
  }, []);

  const close = useCallback(() => {
    window.requestAnimationFrame(() => {
      setActiveModal(null);
      global.bus.detach('router:popstate', closeByRouter);
      if (router.state === 'modal') {
        router.back();
      }
    });
  }, []);

  useEffect(() => {
    if (mountedRef.current) {
      if (activeModal) {
        window.requestAnimationFrame(() => {
          global.bus.emit('modal:opened');
        });
      } else {
        window.requestAnimationFrame(() => {
          global.bus.emit('modal:closed');
        });
      }
    }
  }, [activeModal]);

  useEffect(() => {
    if (mountedRef.current) {
      global.bus.emit('modal:updated');
    }
  }, [updateCounter]);

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
    mountedRef.current = true;

    global.bus.on('modal:open', open);
    global.bus.on('modal:close', close);

    return () => {
      mountedRef.current = false;

      global.bus.detach('modal:open', open);
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

export default React.memo(ModalProvider, () => true);

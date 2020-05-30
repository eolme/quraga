import React, { useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { ActionSheet, ActionSheetItem, usePlatform, IOS } from '@vkontakte/vkui';
import useGlobal from '../hooks/use-global';
import useRouter from '../hooks/use-router';

const PopoutConsumer = ({ by, onClose }) => {
  const global = useGlobal();
  const platform = usePlatform();

  const popout = useMemo(() => {
    if (global.store.popout && global.store.popout.length) {
      return global.store.popout.map((item, i) => {
        return (
          <ActionSheetItem
            key={i}
            autoclose={true}
            before={item.icon}
            onClick={item.onClick}
          >{item.label}</ActionSheetItem>
        );
      });
    } else {
      return [];
    }
  }, [by]);

  return global.store.popout ? (
    <ActionSheet onClose={onClose}>
      {popout}
      {platform === IOS && (
        <ActionSheetItem
          autoclose={true}
          mode="cancel"
        >Отменить</ActionSheetItem>
      )}
    </ActionSheet>
  ) : null;
};

PopoutConsumer.propTypes = {
  by: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired
};

const PopoutProvider = () => {
  const global = useGlobal();
  const router = useRouter();
  const [updateCounter, setUpdateCounter] = useState(0);
  const [showed, setShowedState] = useState(false);

  const closeByRouter = useCallback((name) => {
    if (name === 'popout') {
      window.requestAnimationFrame(() => {
        setShowedState(false);
      });
    }
  }, []);


  const show = useCallback(() => {
    window.requestAnimationFrame(() => {
      setShowedState(true);

      if (router.state !== 'popout') {
        global.bus.once('router:popstate', closeByRouter);
        router.push('popout');
      }
    });
  }, []);

  const close = useCallback(() => {
    window.requestAnimationFrame(() => {
      setShowedState(false);

      if (router.state === 'popout') {
        global.bus.detach('router:popstate', closeByRouter);
        router.back();
      }
    });
  }, []);

  useEffect(() => {
    const update = () => {
      window.requestAnimationFrame(() => {
        setUpdateCounter(updateCounter + 1);
      });
    };

    global.bus.on('popout:update', update);

    return () => {
      global.bus.detach('popout:update', update);
    };
  }, [updateCounter]);

  useEffect(() => {
    global.bus.on('popout:show', show);
    global.bus.on('popout:close', close);

    return () => {
      global.bus.detach('popout:show', show);
      global.bus.detach('popout:close', close);
    };
  }, []);

  return showed ? (
    <PopoutConsumer by={updateCounter} onClose={close} />
  ) : null;
};

export default React.memo(PopoutProvider, () => true);

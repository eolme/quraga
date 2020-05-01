import React, { useState, useCallback, useEffect, memo } from 'react';
import PropTypes from 'prop-types';

import useLockBody from '../hooks/use-lock-body';
import { usePlatform, Group, Header, List, Cell, classNames as cn } from '@vkontakte/vkui';

const Offline = ({ visible = false }) => {
  const [show, setShow] = useState(visible);
  const [animationType, setAnimationType] = useState('leave');

  const platform = usePlatform();

  useLockBody(visible);

  const handleAnimnationEnd = useCallback(() => {
    if (animationType === 'leave') {
      setShow(false);
    }
  }, [animationType]);

  useEffect(() => {
    if (visible && !show) {
      setShow(true);
      window.requestAnimationFrame(() => {
        setAnimationType('enter');
      });
    } else if (show && !visible) {
      window.requestAnimationFrame(() => {
        setAnimationType('leave');
      });
    }
  }, [visible, show]);

  if (!show) {
    return null;
  }

  return (
    <div
      className={cn(
        'Offline',
        `Offline--${animationType}`,
        'ModalPage',
        `ModalPage--${platform}`
      )}
      onAnimationEnd={handleAnimnationEnd}
    >
      <div className="Offline__mask ModalRoot__mask" />
      <div className="Offline__group ModalPage__in">
        <Group header={<Header mode="secondary">Интернет пропал</Header>}>
          <List>
            <Cell multiline={true}>Без доступа в Интернет мы не сможем работать</Cell>
          </List>
        </Group>
      </div>
    </div>
  );
};

Offline.propTypes = {
  visible: PropTypes.bool
};

export default memo(Offline);

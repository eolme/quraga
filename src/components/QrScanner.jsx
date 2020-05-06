import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { classNames as cn } from '@vkontakte/vkui';

import { ReactComponent as QrScannerIcon } from '../assets/qr-scannner-btn.svg';
import useGlobal from '../hooks/use-global';

const QrScanner = ({ className }) => {
  const global = useGlobal();

  const openScanner = useCallback(() => {
    global.bridge.send('VKWebAppOpenCodeReader');
  }, []);

  if (global.bridge.supports('VKWebAppOpenCodeReader')) {
    return (
      <button onClick={openScanner} className={cn(className, 'QrScanner')}>
        <QrScannerIcon />
      </button>
    );
  }

  return null;
};

QrScanner.propTypes = {
  className: PropTypes.string
};

export default QrScanner;

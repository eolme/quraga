import React, { useCallback } from 'react';
import PropTypes from 'prop-types';
import { classNames as cn } from '@vkontakte/vkui';

import { ReactComponent as QrScannerIcon } from '../assets/qr-scannner-btn.svg';
import useGlobal from '../hooks/use-global';

const QrScanner = ({ className }) => {
  const global = useGlobal();

  const openScanner = useCallback(() => {
    if (global.bridge.supports('VKWebAppOpenCodeReader')) {
      global.bridge.send('VKWebAppOpenCodeReader', {});
    }
  }, []);

  return (
    <button onClick={openScanner} className={cn(className, 'QrScanner')}>
      <QrScannerIcon />
    </button>
  );
};

QrScanner.propTypes = {
  className: PropTypes.string
};

export default QrScanner;

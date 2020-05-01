import React from 'react';
import PropTypes from 'prop-types';
import { PanelHeaderSimple, PanelHeaderBack, PanelHeaderClose } from '@vkontakte/vkui';

const Header = ({ onClose, onBack, title = 'QURAGA' }) => {
  const icon =
    onClose && (<PanelHeaderClose onClick={onClose}>Закрыть</PanelHeaderClose>) ||
    onBack && (<PanelHeaderBack onClick={onBack} />);

  return (
    <PanelHeaderSimple left={icon} separator={false}>
      {title}
    </PanelHeaderSimple>
  );
};

Header.propTypes = {
  onClose: PropTypes.func,
  onBack: PropTypes.func,
  title: PropTypes.string
};

export default Header;

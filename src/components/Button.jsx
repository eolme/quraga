import React from 'react';
import PropTypes from 'prop-types';
import { Button as NativeButton, classNames as cn } from '@vkontakte/vkui';

const Button = (props) => {
  return (
    <NativeButton {...props} size="xl" className={cn('Button--round', props.className)}>
      {props.children}
    </NativeButton>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  className: PropTypes.any,
  onClick: PropTypes.func
};

export default Button;

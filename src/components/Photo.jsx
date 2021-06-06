import React from 'react';
import PropTypes from 'prop-types';

import { DEFAULT_IMAGE } from '../utils/constants';

export const Photo = (props) => {
  const parsedSrc = (!props.src || props.src.indexOf('https://vk.com/images/') === 0) ? DEFAULT_IMAGE : props.src;
  const parsedImportance = props.importance || 'high';

  return (
    <img
      {...props}
      src={parsedSrc}
      importance={parsedImportance}
      loading={parsedImportance === 'high' ? 'eager' : 'lazy'}
    />
  );
};

Photo.propTypes = {
  src: PropTypes.string,
  importance: PropTypes.string
};


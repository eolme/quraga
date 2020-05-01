import React from 'react';
import PropTypes from 'prop-types';

const Timer = ({ seconds, completed }) => {
  if (completed) {
    return (
      <div className="Timer">00</div>
    );
  } else {
    return (
      <div className="Timer">{`${seconds}`.padStart(2, '0')}</div>
    );
  }
};

Timer.propTypes = {
  seconds: PropTypes.number,
  completed: PropTypes.bool
};

export default Timer;

import React from 'react';
import PropTypes from 'prop-types';

const Clock = ({ minutes, seconds, completed }) => {
  if (completed) {
    return (
      <div className="Clock">0:00</div>
    );
  } else {
    return (
      <div className="Clock">{minutes}:{`${seconds}`.padStart(2, '0')}</div>
    );
  }
};

Clock.propTypes = {
  minutes: PropTypes.number,
  seconds: PropTypes.number,
  completed: PropTypes.bool
};

export default Clock;

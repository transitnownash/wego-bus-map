import React from 'react';
import PropTypes from 'prop-types';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

function StopTimeSequence({ stopTime }) {
  if (stopTime.timepoint !== '1') {
    return (
      <span className={'badge bg-secondary'} style={{ width: '2rem' }}>{stopTime.stop_sequence}</span>
    );
  }

  return (
    <OverlayTrigger placement='top' overlay={<Tooltip>Timing Stop</Tooltip>}>
      <span className={'badge bg-primary'} style={{ width: '2rem' }}>{stopTime.stop_sequence}</span>
    </OverlayTrigger>
  );
}

StopTimeSequence.propTypes = {
  stopTime: PropTypes.object.isRequired,
};

export default StopTimeSequence;

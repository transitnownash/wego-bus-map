import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import './StopCode.scss';

function StopCode({ stop }) {
  return (
    <span className="stop-code badge bg-white text-black border border-secondary"><Link to={`/stops/${stop.stop_code}`}>{stop.stop_code}</Link></span>
  );
}

StopCode.propTypes = {
  stop: PropTypes.object.isRequired,
};

export default StopCode;

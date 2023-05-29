import React from 'react';
import PropTypes from 'prop-types';

function Headsign({ headsign }) {
  const matches = headsign.match(/^(\w{1,2})\s?-\s?(.*)/i);
  if (matches) {
    return (<span className="trip-headsign"><span className="badge text-bg-secondary">{matches[1]}</span> {matches[2]}</span>);
  }
  return (
    <span className="trip-headsign">{headsign}</span>
  );
}

Headsign.propTypes = {
  headsign: PropTypes.string.isRequired,
};

export default Headsign;

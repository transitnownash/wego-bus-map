import React from 'react';
import PropTypes from 'prop-types';

function HidePastTripsToggle({hidePastTrips, onChange}) {
  return(
    <div className="my-2">
      <div className="form-check form-switch">
        <input className="form-check-input" type="checkbox" id="flexSwitchCheckChecked" checked={hidePastTrips} onChange={onChange} />
        <label className="form-check-label" htmlFor="flexSwitchCheckChecked">Hide Past Trips</label>
      </div>
    </div>
  );
}

HidePastTripsToggle.propTypes = {
  hidePastTrips: PropTypes.bool,
  onChange: PropTypes.func.isRequired
};

HidePastTripsToggle.defaults = {
  hidePastTrips: true
};

export default HidePastTripsToggle;

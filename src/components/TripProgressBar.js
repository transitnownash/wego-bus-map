import React from 'react';
import PropTypes from 'prop-types';
import { ProgressBar } from 'react-bootstrap';
import { formatDistanceTraveled, isTimeLaterThanNow } from '../util';

function TripProgressBar({ trip, tripUpdates }) {
  function renderEmptyProgressBar() {
    return (
      <div className="trip-progress-bar trip-progress-bar-empty my-4">
        <ProgressBar min={0} max={100} label={''} now={0}></ProgressBar>
      </div>
    );
  }

  function renderCompleteProgressBar() {
    return (
      <div className="trip-progress-bar trip-progress-bar-completed my-4">
        <ProgressBar min={0} max={totalTripDistance} label={formatDistanceTraveled(totalTripDistance)} now={totalTripDistance}></ProgressBar>
      </div>
    );
  }

  let currentStopDistance = 0;
  let totalTripDistance = trip.stop_times[trip.stop_times.length - 1].shape_dist_traveled;

  // If no updates provided, render either empty or completed bar based on static schedule
  if (tripUpdates.length === 0 || typeof tripUpdates[0].trip_update === 'undefined') {
    if (!isTimeLaterThanNow(trip.stop_times[trip.stop_times.length - 1].arrival_time)) {
      return renderCompleteProgressBar();
    }
    // Trip hasn't completed and there's no updates; Assume it's before tracking picks it up
    return renderEmptyProgressBar();
  }

  const currentStopUpdate = tripUpdates[0].trip_update.stop_time_update.find((item) => {
    if (typeof item.departure !== 'undefined' && item.departure.time * 1000 > Date.now()) {
      return true;
    }
    if (typeof item.arrival !== 'undefined' && item.arrival.time * 1000 > Date.now()) {
      return true;
    }
    return false;
  });
  if (typeof currentStopUpdate === 'undefined') {
    return renderCompleteProgressBar();
  }
  const currentStop = trip.stop_times.find((i) => i.stop_sequence == currentStopUpdate.stop_sequence);

  // Start of trip
  if (!currentStop.shape_dist_traveled) {
    return renderEmptyProgressBar();
  }

  currentStopDistance = parseFloat(currentStop.shape_dist_traveled);

  return (
    <div className="trip-progress-bar my-4">
      <ProgressBar min={0} max={totalTripDistance} label={formatDistanceTraveled(currentStopDistance)} now={currentStopDistance}></ProgressBar>
    </div>
  );
}

TripProgressBar.propTypes = {
  trip: PropTypes.object.isRequired,
  tripUpdates: PropTypes.any,
};

TripProgressBar.defaultProps = {
  tripUpdates: [],
};

export default TripProgressBar;

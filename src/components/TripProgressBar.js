import React from 'react';
import PropTypes from 'prop-types';
import { ProgressBar } from 'react-bootstrap';
import { formatDistanceTraveled } from '../util';

function TripProgressBar({trip, tripUpdates}) {
  // Do not render if no updates provided
  if (tripUpdates.length === 0) {
    return(<></>);
  }

  let currentStopDistance = 0;
  let totalTripDistance = trip.stop_times[trip.stop_times.length - 1].shape_dist_traveled;
  const currentStopUpdate = tripUpdates[0].trip_update.stop_time_update.find((item) => item.departure.time * 1000 > Date.now());
  const currentStop = trip.stop_times.find(i => i.stop_sequence == currentStopUpdate.stop_sequence);

  // Start of trip
  if (!currentStop.shape_dist_traveled) {
    return(<></>);
  }

  currentStopDistance = parseFloat(currentStop.shape_dist_traveled);

  return(
    <div className="my-4">
      <ProgressBar min={0} max={totalTripDistance} label={formatDistanceTraveled(currentStopDistance)} now={currentStopDistance}></ProgressBar>
    </div>
  );
}

TripProgressBar.propTypes = {
  trip: PropTypes.object.isRequired,
  tripUpdates: PropTypes.any
};

TripProgressBar.defaultProps = {
  tripUpdates: []
};

export default TripProgressBar;


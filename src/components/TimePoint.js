import React from 'react';
import { formatStopTimeUpdate, formatTripTime } from '../util';
import PropTypes from 'prop-types';

function TimePoint({scheduleData, updateData}) {
  // Determine which time point to use for trip update, or none.
  let updateTime = false;
  if (updateData && typeof updateData.departure !== 'undefined' && typeof updateData.departure.time === 'number') {
    updateTime = updateData.departure.time;
  } else if (updateData && typeof updateData.arrival !== 'undefined' && typeof updateData.arrival.time === 'number') {
    updateTime = updateData.arrival.time;
  }

  // Grab the relevant pieces for the scheduled time
  let scheduleTime = formatTripTime(scheduleData.departure_time);

  // Handle case where departure and arrival time are mismatched
  let scheduleDepartNote = '';
  if (scheduleData.arrival_time !== scheduleData.departure_time) {
    scheduleTime = formatTripTime(scheduleData.arrival_time);
    scheduleDepartNote = (<> (Departs {formatTripTime(scheduleData.departure_time)})</>);
  }

  // If no update provided (e.g. past or far-future trip), return scheduled
  if (!updateTime) {
    return(<>{scheduleTime}{scheduleDepartNote}</>);
  }

  updateTime = formatStopTimeUpdate(updateData);

  return(
    <>
      {scheduleTime !== updateTime && (
        <small><strike className="text-muted">{scheduleTime}{scheduleDepartNote}</strike><br /></small>
      )}
      <strong className="text-primary">{updateTime}</strong>
      {scheduleTime === updateTime && (
        <><br /><small>(On Time)</small></>
      )}
    </>
  );
}

TimePoint.propTypes = {
  scheduleData: PropTypes.object.isRequired,
  updateData: PropTypes.object
};

TimePoint.defaultProps = {
  updateData: {}
};

export default TimePoint;

import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay } from '@fortawesome/free-solid-svg-icons';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { formatStopTimeUpdate } from '../util';
import './TimePoint.scss';

function TimePoint({ scheduleData, updateData }) {
  function formatTripTime(time) {
    const date = new Date();
    const [hour, minute, second] = time.split(':');
    date.setHours(hour);
    date.setMinutes(minute);
    date.setSeconds(second);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }

  function renderNextDayIcon(isNextDay) {
    if (!isNextDay) {
      return;
    }
    return (
      <OverlayTrigger placement={'top'} overlay={<Tooltip>Next Day</Tooltip>}>
        <FontAwesomeIcon icon={faCalendarDay} fixedWidth={true} />
      </OverlayTrigger>
    );
  }

  // Determine which time point to use for trip update, or none.
  let updateTime = false;
  if (updateData && typeof updateData.departure !== 'undefined' && typeof updateData.departure.time === 'number') {
    updateTime = updateData.departure.time;
  } else if (updateData && typeof updateData.arrival !== 'undefined' && typeof updateData.arrival.time === 'number') {
    updateTime = updateData.arrival.time;
  }

  // Grab the relevant pieces for the scheduled time
  let scheduleTime = formatTripTime(scheduleData.departure_time);
  const isNextDay = /^2[4-9]:/.test(scheduleData.departure_time);

  // Handle case where departure and arrival time are mismatched
  let scheduleDepartNote = '';
  if (scheduleData.arrival_time !== scheduleData.departure_time) {
    scheduleTime = formatTripTime(scheduleData.arrival_time);
    scheduleDepartNote = (<> (Departs {formatTripTime(scheduleData.departure_time)})</>);
  }

  // If no update provided (e.g. past or far-future trip), return scheduled
  if (!updateTime) {
    return (
      <div className="time-point" title="Scheduled Time">
        {renderNextDayIcon(isNextDay)}
        {scheduleTime}{scheduleDepartNote}
      </div>
    );
  }
  updateTime = formatStopTimeUpdate(updateData);

  return (
    <div className="time-point">
      <div>
        <strong className="text-dark" title="Updated Time">
          {renderNextDayIcon(isNextDay)}
          {updateTime}
        </strong>
      </div>
      {scheduleTime !== updateTime && (
        <div className="small">
          <strike className="text-muted" title="Scheduled Time">
            {renderNextDayIcon(isNextDay)}
            {scheduleTime}
            {scheduleDepartNote}
          </strike>
        </div>
      )}
      {scheduleTime === updateTime && (
        <div className="small">
          (On Time)
        </div>
      )}
    </div>
  );
}

TimePoint.propTypes = {
  scheduleData: PropTypes.object.isRequired,
  updateData: PropTypes.object,
};

TimePoint.defaultProps = {
  updateData: {},
};

export default TimePoint;

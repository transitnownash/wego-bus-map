import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarDay, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
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

  // Guard against undefined scheduleData or missing time properties
  if (!scheduleData || (!scheduleData.departure_time && !scheduleData.arrival_time)) {
    return null;
  }

  // Determine which time point to use for trip update, or none.
  // StopTimeUpdate.schedule_relationship: SCHEDULED, SKIPPED, NO_DATA, UNSCHEDULED
  const stopScheduleRel = updateData?.schedule_relationship;

  let updateTime = false;
  if (updateData && typeof updateData.departure !== 'undefined' && typeof updateData.departure.time === 'number') {
    updateTime = updateData.departure.time;
  } else if (updateData && typeof updateData.arrival !== 'undefined' && typeof updateData.arrival.time === 'number') {
    updateTime = updateData.arrival.time;
  }

  // Grab the relevant pieces for the scheduled time
  let scheduleTime = formatTripTime(scheduleData.departure_time || scheduleData.arrival_time);
  const isNextDay = /^2[4-9]:/.test(scheduleData.departure_time || scheduleData.arrival_time);

  // Handle case where departure and arrival time are mismatched
  let scheduleDepartNote = '';
  if (scheduleData.arrival_time && scheduleData.departure_time && scheduleData.arrival_time !== scheduleData.departure_time) {
    scheduleTime = formatTripTime(scheduleData.arrival_time);
    scheduleDepartNote = (<> (Departs {formatTripTime(scheduleData.departure_time)})</>);
  }

  if (stopScheduleRel === 'Skipped') {
    return (
      <div className="time-point">
        <div>
          <span className="badge bg-danger text-white" title="Skipped Stop">
            <FontAwesomeIcon icon={faExclamationTriangle} fixedWidth={true} /> Skipped
          </span>
        </div>
        <div className="small">
          <strike className="text-muted" title="Scheduled Time">
            {renderNextDayIcon(isNextDay)}
            {scheduleTime}
            {scheduleDepartNote}
          </strike>
        </div>
      </div>
    );
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

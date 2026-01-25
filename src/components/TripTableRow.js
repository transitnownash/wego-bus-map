import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBicycle, faWheelchair, faBan, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { isTimeRangeIncludesNow, isStopTimeUpdateLaterThanNow, isTimeLaterThanNow } from '../util';
import TimePoint from './TimePoint';
import Headsign from './Headsign';
import './TripTableRow.scss';

function TripTableRow({
  trip, route, tripUpdate, hidePastTrips,
}) {
  const bikes_allowed_icon = (trip.bikes_allowed !== '1')
    ? (<span className="text-danger"><FontAwesomeIcon icon={faBan} fixedWidth={true}></FontAwesomeIcon></span>)
    : (<></>);
  const wheelchair_accessible_icon = (trip.wheelchair_accessible !== '1')
    ? (<span className="text-danger"><FontAwesomeIcon icon={faBan} fixedWidth={true}></FontAwesomeIcon></span>)
    : (<></>);

  const bikes_allowed_tooltip = (trip.bikes_allowed === '1')
    ? 'Vehicle being used on this particular trip can accommodate at least one bicycle.'
    : 'No bicycles are allowed on this trip.';

  const wheelchair_accessible_tooltip = (trip.wheelchair_accessible === '1')
    ? 'Vehicle being used on this particular trip can accommodate at least one rider in a wheelchair.'
    : 'No riders in wheelchairs can be accommodated on this trip.';

  let updateStart = {};
  let updateEnd = {};
  let scheduleStatus = null; // Will store: 'canceled', 'unscheduled', 'skipped', 'no-data', or null

  if (typeof tripUpdate.trip_update !== 'undefined' && Array.isArray(tripUpdate.trip_update.stop_time_update)) {
    updateStart = tripUpdate.trip_update.stop_time_update.find((i) => i.stop_sequence === 1) || {};
    updateEnd = tripUpdate.trip_update.stop_time_update.find((i) => i.stop_sequence === trip.stop_times[trip.stop_times.length - 1].stop_sequence) || {};

    // Check trip-level schedule_relationship first (takes precedence)
    const tripScheduleRel = tripUpdate.trip_update.trip?.schedule_relationship;
    if (tripScheduleRel === 4 || tripScheduleRel === "Canceled" || tripScheduleRel === "Cancelled") {
      scheduleStatus = 'canceled';
    } else if (tripScheduleRel === 3 || tripScheduleRel === "Unscheduled") {
      scheduleStatus = 'unscheduled';
    } else if (tripScheduleRel === 1 || tripScheduleRel === "Skipped") {
      scheduleStatus = 'skipped';
    } else if (tripScheduleRel === 2 || tripScheduleRel === "No Data") {
      scheduleStatus = 'no-data';
    } else {
      // Check stop-level schedule_relationship values
      const hasCanceled = tripUpdate.trip_update.stop_time_update.some((i) => i.schedule_relationship === 4 || i.schedule_relationship === "Canceled" || i.schedule_relationship === "Cancelled");
      const hasUnscheduled = tripUpdate.trip_update.stop_time_update.some((i) => i.schedule_relationship === 3 || i.schedule_relationship === "Unscheduled");
      const hasSkipped = tripUpdate.trip_update.stop_time_update.some((i) => i.schedule_relationship === 1 || i.schedule_relationship === "Skipped");
      const allNoData = tripUpdate.trip_update.stop_time_update.every((i) => i.schedule_relationship === 2 || i.schedule_relationship === "No Data");

      if (hasCanceled) {
        scheduleStatus = 'canceled';
      } else if (hasUnscheduled) {
        scheduleStatus = 'unscheduled';
      } else if (hasSkipped) {
        scheduleStatus = 'skipped';
      } else if (allNoData) {
        scheduleStatus = 'no-data';
      }
    }
  }

  let rowClasses = '';
  const isActive = trip.start_time && trip.end_time && isTimeRangeIncludesNow(trip.start_time, trip.end_time);
  const hasFutureEnd = isStopTimeUpdateLaterThanNow(trip.stop_times[trip.stop_times.length - 1], updateEnd);
  const hasFutureStart = trip.start_time ? isTimeLaterThanNow(trip.start_time) : false;

  if (isActive) {
    rowClasses = 'tr-active-trip';
  } else if (!hasFutureEnd && !hasFutureStart) {
    if (hidePastTrips) {
      return;
    }
    rowClasses = 'tr-past-trip';
  }

  return (
    <tr className={rowClasses}>
      <td>
        <a href={`/trips/${trip.trip_gid}`}>{trip.trip_gid}</a>
        {scheduleStatus === 'canceled' && (
          <OverlayTrigger placement='top' overlay={<Tooltip>This trip has been canceled</Tooltip>}>
            <span className="badge bg-danger text-white ms-1">
              <FontAwesomeIcon icon={faExclamationTriangle} fixedWidth={true} /> Canceled
            </span>
          </OverlayTrigger>
        )}
        {scheduleStatus === 'unscheduled' && (
          <OverlayTrigger placement='top' overlay={<Tooltip>This trip was not in the original schedule - it&apos;s an extra trip added</Tooltip>}>
            <span className="badge bg-warning text-dark ms-1">
              <FontAwesomeIcon icon={faExclamationTriangle} fixedWidth={true} /> Unscheduled
            </span>
          </OverlayTrigger>
        )}
        {scheduleStatus === 'skipped' && (
          <OverlayTrigger placement='top' overlay={<Tooltip>This trip has been canceled or skipped</Tooltip>}>
            <span className="badge bg-danger text-white ms-1">
              <FontAwesomeIcon icon={faExclamationTriangle} fixedWidth={true} /> Skipped
            </span>
          </OverlayTrigger>
        )}
        {scheduleStatus === 'no-data' && (
          <OverlayTrigger placement='top' overlay={<Tooltip>No real-time tracking data available for this trip</Tooltip>}>
            <span className="badge bg-secondary text-white ms-1">
              <FontAwesomeIcon icon={faExclamationTriangle} fixedWidth={true} /> No Data
            </span>
          </OverlayTrigger>
        )}
      </td>
      <td className="text-center text-nowrap">
        <TimePoint scheduleData={trip.stop_times[0]} updateData={updateStart}></TimePoint>
      </td>
      <td className="text-center text-nowrap">
        <TimePoint scheduleData={trip.stop_times[trip.stop_times.length - 1]} updateData={updateEnd}></TimePoint>
      </td>
      <td>
        {trip.route_gid !== route.route_gid && (
          <span className="badge bg-secondary me-1">{trip.route_gid}</span>
        )}
        <Headsign headsign={trip.trip_headsign} />
      </td>
      <td>
        <OverlayTrigger placement='top' overlay={<Tooltip>{wheelchair_accessible_tooltip}</Tooltip>}>
          <div className="fa-layers fa-fw me-1">
            <FontAwesomeIcon icon={faWheelchair} fixedWidth={true}></FontAwesomeIcon>
            {wheelchair_accessible_icon}
          </div>
        </OverlayTrigger>
        <OverlayTrigger placement='top' overlay={<Tooltip>{bikes_allowed_tooltip}</Tooltip>}>
          <div className="fa-layers fa-fw">
            <FontAwesomeIcon icon={faBicycle} fixedWidth={true}></FontAwesomeIcon>
            {bikes_allowed_icon}
          </div>
        </OverlayTrigger>
      </td>
    </tr>
  );
}

TripTableRow.propTypes = {
  trip: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
  tripUpdate: PropTypes.object,
  hidePastTrips: PropTypes.bool,
};

TripTableRow.defaultProps = {
  trip: {},
  route: {},
  tripUpdate: {},
  hidePastTrips: false,
};

export default TripTableRow;

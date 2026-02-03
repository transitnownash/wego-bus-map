import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLandmark, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import StopTimeSequence from './StopTimeSequence';
import TimePoint from './TimePoint';
import { formatDistanceTraveled } from '../util';
import StopCode from './StopCode';

function StopTimeTableRow({ stopTime, stopTimeUpdate }) {
  let stopStatus = null;
  // StopTimeUpdate.schedule_relationship: SCHEDULED, SKIPPED, NO_DATA, UNSCHEDULED
  const stopScheduleRel = stopTimeUpdate?.schedule_relationship;
  if (stopScheduleRel === 'Canceled' || stopScheduleRel === 'Cancelled') {
    stopStatus = 'canceled';
  } else if (stopScheduleRel === 'Unscheduled') {
    stopStatus = 'unscheduled';
  } else if (stopScheduleRel === 'Skipped') {
    stopStatus = 'skipped';
  } else if (stopScheduleRel === 'No Data') {
    stopStatus = 'no-data';
  }

  return (
    <tr>
      <td className="text-center">
        <StopTimeSequence stopTime={stopTime}></StopTimeSequence>
      </td>
      <td>{formatDistanceTraveled(stopTime.shape_dist_traveled)}</td>
      <td>
        <strong><Link to={`/stops/${stopTime.stop.stop_code}`}>{stopTime.stop.stop_name}</Link></strong>
        {stopStatus === 'canceled' && (
          <OverlayTrigger placement='top' overlay={<Tooltip>Stop canceled</Tooltip>}>
            <span className="badge bg-danger text-white ms-2">
              <FontAwesomeIcon icon={faExclamationTriangle} fixedWidth={true} /> Canceled
            </span>
          </OverlayTrigger>
        )}
        {stopStatus === 'unscheduled' && (
          <OverlayTrigger placement='top' overlay={<Tooltip>Unscheduled stop</Tooltip>}>
            <span className="badge bg-warning text-dark ms-2">
              <FontAwesomeIcon icon={faExclamationTriangle} fixedWidth={true} /> Unscheduled
            </span>
          </OverlayTrigger>
        )}
        {stopStatus === 'no-data' && (
          <OverlayTrigger placement='top' overlay={<Tooltip>No real-time data for this stop</Tooltip>}>
            <span className="badge bg-secondary text-white ms-2">
              <FontAwesomeIcon icon={faExclamationTriangle} fixedWidth={true} /> No Data
            </span>
          </OverlayTrigger>
        )}
        <br />
        <small><StopCode stop={stopTime.stop}/> {stopTime.stop.stop_desc}</small>
        {stopTime.stop.parent_station_gid
          && (<div><FontAwesomeIcon icon={faLandmark} fixedWidth={true}></FontAwesomeIcon> Inside <Link to={`/stops/${stopTime.stop.parent_station_gid}`}>{stopTime.stop.parent_station_gid}</Link></div>)
        }
      </td>
      <td className="text-center text-nowrap">
        <TimePoint scheduleData={stopTime} updateData={stopTimeUpdate}></TimePoint>
      </td>
    </tr>
  );
}

StopTimeTableRow.propTypes = {
  stopTime: PropTypes.object.isRequired,
  stopTimeUpdate: PropTypes.any,
};

StopTimeTableRow.defaultProps = {
  stopTimeUpdate: {},
};

export default StopTimeTableRow;

import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLandmark } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import StopTimeSequence from './StopTimeSequence';
import TimePoint from './TimePoint';
import { formatDistanceTraveled, isStopTimeUpdateLaterThanNow } from '../util';
import StopCode from './StopCode';

function StopTimeTableRow({ stopTime, stopTimeUpdate }) {
  let rowStyle = { opacity: 1.0 };
  if (!isStopTimeUpdateLaterThanNow(stopTime, stopTimeUpdate)) {
    rowStyle = {
      opacity: 0.3,
    };
  }

  return (
    <tr style={rowStyle}>
      <td className="text-center">
        <StopTimeSequence stopTime={stopTime}></StopTimeSequence>
      </td>
      <td>{formatDistanceTraveled(stopTime.shape_dist_traveled)}</td>
      <td>
        <strong><Link to={`/stops/${stopTime.stop.stop_code}`}>{stopTime.stop.stop_name}</Link></strong><br />
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

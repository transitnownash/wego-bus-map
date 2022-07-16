import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLandmark } from "@fortawesome/free-solid-svg-icons";
import StopTimeSequence from './StopTimeSequence';
import { formatTripTime, isTimeLaterThanNow, formatDistanceTraveled, formatStopTimeUpdate } from "../util";
import { Link } from 'react-router-dom';

function StopTimeTableRow({stopTime, stopTimeUpdate}) {
  let rowStyle = {opacity: 1.0};

  if (!isTimeLaterThanNow(stopTime.departure_time)) {
    rowStyle = {opacity: 0.3};
  }

  // If updated time
  if (
      (stopTimeUpdate.departure && stopTimeUpdate.departure.time * 1000 > Date.now())
      || (stopTimeUpdate.arrival && stopTimeUpdate.arrival.time * 1000 > Date.now())
    ) {
    rowStyle = {
      opacity: 1.0
    };
  }

  return(
    <tr style={rowStyle}>
      <td className="text-center">
        <StopTimeSequence stopTime={stopTime}></StopTimeSequence>
      </td>
      <td>{formatDistanceTraveled(stopTime.shape_dist_traveled)}</td>
      <td>
        <strong><Link to={'/stops/' + stopTime.stop.stop_code}>{stopTime.stop.stop_name}</Link></strong><br />
        <small>{stopTime.stop.stop_code} {stopTime.stop.stop_desc}</small>
        {stopTime.stop.parent_station &&
          (<em><br /><FontAwesomeIcon icon={faLandmark} fixedWidth={true}></FontAwesomeIcon> Inside {stopTime.stop.parent_station}</em>)
        }
      </td>
      <td className="text-center">
        {formatTripTime(stopTime.arrival_time)}
        {stopTime.arrival_time !== stopTime.departure_time &&
          (<> (Departs {formatTripTime(stopTime.departure_time)})</>)

        }
      </td>
      <td className="text-center">{formatStopTimeUpdate(stopTimeUpdate)}</td>
    </tr>
  );
}

StopTimeTableRow.propTypes = {
  stopTime: PropTypes.object.isRequired,
  stopTimeUpdate: PropTypes.any
};

StopTimeTableRow.defaultProps = {
  stopTimeUpdate: {}
};

export default StopTimeTableRow;

import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faLandmark } from "@fortawesome/free-solid-svg-icons"
import StopTimeSequence from './StopTimeSequence'
import { format_trip_time, time_is_later_than_now, format_distance_traveled, format_stop_time_update } from "../util"

function StopTimeTableRow({stopTime, stopTimeUpdate}) {
  let rowStyle = {opacity: 1.0}

  if (!time_is_later_than_now(stopTime.departure_time)) {
    rowStyle = {opacity: 0.3}
  }

  // If updated time
  if (
      (stopTimeUpdate.departure && stopTimeUpdate.departure.time * 1000 > Date.now())
      || (stopTimeUpdate.arrival && stopTimeUpdate.arrival.time * 1000 > Date.now())
    ) {
    rowStyle = {
      opacity: 1.0
    }
  }

  return(
    <tr style={rowStyle}>
      <td className="text-center">
        <StopTimeSequence stopTime={stopTime}></StopTimeSequence>
      </td>
      <td>{format_distance_traveled(stopTime.shape_dist_traveled)}</td>
      <td>
        <strong>{stopTime.stop.stop_name}</strong><br />
        <small>{stopTime.stop.stop_code} {stopTime.stop.stop_desc}</small>
        {stopTime.stop.parent_station &&
          (<em><br /><FontAwesomeIcon icon={faLandmark} fixedWidth={true}></FontAwesomeIcon> Inside {stopTime.stop.parent_station}</em>)
        }
      </td>
      <td className="text-center">
        {format_trip_time(stopTime.arrival_time)}
        {stopTime.arrival_time !== stopTime.departure_time &&
          (<> (Departs {format_trip_time(stopTime.departure_time)})</>)

        }
      </td>
      <td className="text-center">{stopTimeUpdate !== false
        ? (
          <>{format_stop_time_update(stopTimeUpdate)}</>
        ) : (
          <>--</>
        )
      }</td>
    </tr>
  )
}

StopTimeTableRow.propTypes = {
  stopTime: PropTypes.object,
  stopTimeUpdate: PropTypes.object
}

StopTimeTableRow.defaultProps = {
  stopTime: {},
  stopTimeUpdate: {}
}

export default StopTimeTableRow

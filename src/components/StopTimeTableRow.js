import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Tooltip, OverlayTrigger } from "react-bootstrap"
import { faLandmark } from "@fortawesome/free-solid-svg-icons"
import { format_trip_time, time_is_later_than_now, format_distance_traveled, format_stop_time_update } from "../util"

function StopTimeTableRow({stop_time, stop_time_update}) {
  let rowStyle = {opacity: 1.0}

  if (!time_is_later_than_now(stop_time.departure_time)) {
    rowStyle = {opacity: 0.3}
  }

  // If updated time
  if (
      (stop_time_update.departure && stop_time_update.departure.time * 1000 > Date.now())
      || (stop_time_update.arrival && stop_time_update.arrival.time * 1000 > Date.now())
    ) {
    rowStyle = {
      opacity: 1.0
    }
  }

  const sequenceBadge = (stop_time.timepoint === "1")
    ?
      (
        <OverlayTrigger placement='top' overlay={<Tooltip>Timing Stop</Tooltip>}>
          <span className={'badge bg-primary'}>{stop_time.stop_sequence}</span>
        </OverlayTrigger>
      ) :
      (
        <span className={'badge bg-secondary'}>{stop_time.stop_sequence}</span>
      )

  return(
    <tr style={rowStyle}>
      <td className="text-center">{sequenceBadge}</td>
      <td>{format_distance_traveled(stop_time.shape_dist_traveled)}</td>
      <td>
        <strong>{stop_time.stop.stop_name}</strong><br />
        <small>{stop_time.stop.stop_code} {stop_time.stop.stop_desc}</small>
        {stop_time.stop.parent_station &&
          (<em><br /><FontAwesomeIcon icon={faLandmark} fixedWidth={true}></FontAwesomeIcon> Inside {stop_time.stop.parent_station}</em>)
        }
      </td>
      <td className="text-center">
        {format_trip_time(stop_time.arrival_time)}
        {stop_time.arrival_time !== stop_time.departure_time &&
          (<> (Departs {format_trip_time(stop_time.departure_time)})</>)

        }
      </td>
      <td className="text-center">{stop_time_update !== false
        ? (
          <>{format_stop_time_update(stop_time_update)}</>
        ) : (
          <>--</>
        )
      }</td>
    </tr>
  )
}

export default StopTimeTableRow

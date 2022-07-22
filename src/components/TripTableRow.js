import React from 'react';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBicycle, faWheelchair, faBan } from "@fortawesome/free-solid-svg-icons";
import { formatTripTime, isTimeLaterThanNow, isTimeRangeIncludesNow } from "../util";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

function TripTableRow({trip, route, hidePastTrips}) {
  if (!isTimeLaterThanNow(trip.end_time) && hidePastTrips) {
    return(<></>);
  }

  const bikes_allowed_icon = (trip.bikes_allowed !== "1")
    ? (<span className="text-danger"><FontAwesomeIcon icon={faBan} fixedWidth={true}></FontAwesomeIcon></span>)
    : (<></>);
  const wheelchair_accessible_icon = (trip.wheelchair_accessible !== "1")
  ? (<span className="text-danger"><FontAwesomeIcon icon={faBan} fixedWidth={true}></FontAwesomeIcon></span>)
  : (<></>);

  const bikes_allowed_tooltip = (trip.bikes_allowed === '1')
    ? 'Vehicle being used on this particular trip can accommodate at least one bicycle.'
    : 'No bicycles are allowed on this trip.';

  const wheelchair_accessible_tooltip = (trip.wheelchair_accessible === '1')
    ? 'Vehicle being used on this particular trip can accommodate at least one rider in a wheelchair.'
    : 'No riders in wheelchairs can be accommodated on this trip.';

  const rowStyle = !isTimeLaterThanNow(trip.end_time)
    ? {
      opacity: 0.3
    }
    : {};

  return(
    <tr className={isTimeRangeIncludesNow(trip.start_time, trip.end_time) ? 'bg-secondary text-light' : ''} style={rowStyle}>
      <td><a href={'/trips/' + trip.trip_gid} className={isTimeRangeIncludesNow(trip.start_time, trip.end_time) ? 'text-light' : ''}>{trip.trip_gid}</a></td>
      <td>{formatTripTime(trip.start_time)}</td>
      <td>{formatTripTime(trip.end_time)}</td>
      <td>
        {trip.route_gid !== route.route_gid &&
          (<OverlayTrigger placement='top' overlay={<Tooltip>Vehicle continues on to Route {trip.route_gid}</Tooltip>}><span className="badge bg-secondary me-1">&raquo;</span></OverlayTrigger>)
        }
        {trip.route_gid} - {trip.trip_headsign}
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
  trip: PropTypes.object,
  route: PropTypes.object,
  hidePastTrips: PropTypes.bool
};

TripTableRow.defaultProps = {
  trip: {},
  route: {},
  hidePastTrips: false
};

export default TripTableRow;

import React from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'react-leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBus, faMap, faMapSigns, faCompass, faTachometer, faClock, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { formatBearing, formatSpeed, formatTimestamp } from './../util.js';
import { Link } from 'react-router-dom';
import TransitRouteHeader from './TransitRouteHeader.js';

function VehicleMarkerPopup({trip, route, bearing, speed, timestamp, metadata, agency, tripId, alerts}) {
  const trip_headsign = (trip.trip_headsign)
    ? trip.trip_headsign
    : (<FontAwesomeIcon icon={faSpinner} spin={true}></FontAwesomeIcon>)
  ;

  return(
    <Popup>
      <div className="popup-content">
        <TransitRouteHeader route={route} alerts={alerts} showRouteType={false}></TransitRouteHeader>
        <table className="table table-borderless table-sm" style={{minWidth: '250px'}}>
          <tbody>
            <tr>
              <th><FontAwesomeIcon icon={faMapSigns} fixedWidth/> Headsign</th>
              <td>{trip_headsign}</td>
            </tr>
            <tr>
              <th><FontAwesomeIcon icon={faBus} fixedWidth/> Vehicle</th>
              <td>{metadata.vehicle.label}</td>
            </tr>
            <tr>
              <th><FontAwesomeIcon icon={faMap} fixedWidth/> Trip</th>
              <td><Link to={'/trips/' + tripId}>{tripId}</Link></td>
            </tr>
            <tr>
              <th><FontAwesomeIcon icon={faCompass} fixedWidth/> Heading</th>
              <td>{formatBearing(bearing)}</td>
            </tr>
            <tr>
              <th><FontAwesomeIcon icon={faTachometer} fixedWidth/> Speed</th>
              <td>{formatSpeed(speed)}</td>
            </tr>
            <tr>
              <th><FontAwesomeIcon icon={faClock} fixedWidth/> Updated</th>
              <td>{formatTimestamp(timestamp)}</td>
            </tr>
          </tbody>
        </table>
        <div className="text-end"><a href={agency.agency_url} className="text-muted" target="_blank" rel="noreferrer">{agency.agency_name}</a></div>
      </div>
    </Popup>
  );
}

VehicleMarkerPopup.propTypes = {
  trip: PropTypes.object,
  route: PropTypes.object,
  bearing: PropTypes.number,
  speed: PropTypes.number,
  timestamp: PropTypes.number,
  metadata: PropTypes.object,
  agency: PropTypes.object,
  tripId: PropTypes.string,
  alerts: PropTypes.array
};

VehicleMarkerPopup.defaultProps = {
  trip: {},
  route: {},
  bearing: null,
  speed: null,
  timestamp: null,
  metadata: {},
  agency: {},
  tripId: null,
  alerts: []
};

export default VehicleMarkerPopup;

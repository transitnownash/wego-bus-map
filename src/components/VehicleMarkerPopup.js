import React from 'react';
import PropTypes from 'prop-types';
import { Popup } from 'react-leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBus, faMap, faMapSigns, faCompass, faTachometer, faClock, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { renderBearing, renderSpeed, renderTimestamp } from './../util.js';
import { Link } from 'react-router-dom';
import TransitRouteHeader from './TransitRouteHeader.js';

function VehicleMarkerPopup({vehiclePositionData, trip, route, agency, alerts}) {
  const trip_headsign = (trip.trip_headsign)
    ? trip.trip_headsign
    : (<FontAwesomeIcon icon={faSpinner} spin={true}></FontAwesomeIcon>)
  ;

  return(
    <Popup>
      <div className="popup-content">
        <TransitRouteHeader route={route} alerts={alerts} showRouteType={false}></TransitRouteHeader>
        <table className="table table-borderless table table-sm small" style={{minWidth: '250px'}}>
          <tbody>
            <tr>
              <th className="text-nowrap"><FontAwesomeIcon icon={faMapSigns} fixedWidth/> Headsign</th>
              <td>{trip_headsign}</td>
            </tr>
            <tr>
              <th><FontAwesomeIcon icon={faBus} fixedWidth/> Vehicle</th>
              <td>{vehiclePositionData.vehicle.vehicle.label}</td>
            </tr>
            <tr>
              <th><FontAwesomeIcon icon={faMap} fixedWidth/> Trip</th>
              <td><Link to={'/trips/' + trip.trip_gid}>{trip.trip_gid}</Link></td>
            </tr>
            <tr>
              <th><FontAwesomeIcon icon={faCompass} fixedWidth/> Heading</th>
              <td>{renderBearing(vehiclePositionData.vehicle.position.bearing)}</td>
            </tr>
            <tr>
              <th><FontAwesomeIcon icon={faTachometer} fixedWidth/> Speed</th>
              <td>{renderSpeed(vehiclePositionData.vehicle.position.speed)}</td>
            </tr>
            <tr>
              <th><FontAwesomeIcon icon={faClock} fixedWidth/> Updated</th>
              <td>{renderTimestamp(vehiclePositionData.vehicle.timestamp)}</td>
            </tr>
          </tbody>
        </table>
        <div className="text-end"><a href={agency.agency_url} className="text-muted" target="_blank" rel="noreferrer">{agency.agency_name}</a></div>
      </div>
    </Popup>
  );
}

VehicleMarkerPopup.propTypes = {
  vehiclePositionData: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
  trip: PropTypes.object.isRequired,
  agency: PropTypes.object.isRequired,
  alerts: PropTypes.array
};

VehicleMarkerPopup.defaultProps = {
  alerts: []
};

export default VehicleMarkerPopup;

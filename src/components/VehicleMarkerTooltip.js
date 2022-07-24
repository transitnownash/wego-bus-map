import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'react-leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBus, faMap } from '@fortawesome/free-solid-svg-icons';
import L from 'leaflet';
import TransitRouteHeader from './TransitRouteHeader';

function VehicleMarkerTooltip({vehiclePositionData, route, alerts}) {
  if (L.Browser.mobile) {
    return;
  }

  return(
    <Tooltip>
      <div className="tooltip-content">
        <TransitRouteHeader route={route} alerts={alerts} showRouteType={false}></TransitRouteHeader>
        <table className="table table table-sm table-borderless small mb-0">
          <tbody>
            <tr>
              <th><FontAwesomeIcon icon={faBus}/> Vehicle</th>
              <td>{vehiclePositionData.vehicle.vehicle.label}</td>
            </tr>
            <tr>
              <th><FontAwesomeIcon icon={faMap}/> Trip</th>
              <td>{vehiclePositionData.vehicle.trip.trip_id}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Tooltip>
  );
}

VehicleMarkerTooltip.propTypes = {
  vehiclePositionData: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
  alerts: PropTypes.array
};

VehicleMarkerTooltip.defaultProps = {
  alerts: []
};

export default VehicleMarkerTooltip;

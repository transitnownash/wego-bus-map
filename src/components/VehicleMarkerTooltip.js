import React from 'react'
import PropTypes from 'prop-types'
import { Tooltip } from 'react-leaflet'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBus, faMap } from '@fortawesome/free-solid-svg-icons'
import L from 'leaflet'
import TransitRouteHeader from './TransitRouteHeader'

function VehicleMarkerTooltip({route, metadata, alerts}) {
  if (L.Browser.mobile) {
    return
  }

  return(
    <Tooltip>
      <div className="tooltip-content">
        <TransitRouteHeader route={route} alerts={alerts} showRouteType={false}></TransitRouteHeader>
        <table className="table table-borderless table-sm mb-0">
          <tbody>
            <tr>
              <th><FontAwesomeIcon icon={faBus}/> Vehicle</th>
              <td>{metadata.vehicle.label}</td>
            </tr>
            <tr>
              <th><FontAwesomeIcon icon={faMap}/> Trip</th>
              <td>{metadata.trip.trip_id}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Tooltip>
  )
}

VehicleMarkerTooltip.propTypes = {
  route: PropTypes.object,
  metadata: PropTypes.object,
  alerts: PropTypes.array
}

VehicleMarkerTooltip.defaultProps = {
  route: {},
  metadata: {},
  alerts: []
}

export default VehicleMarkerTooltip;

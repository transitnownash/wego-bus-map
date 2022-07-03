import React from 'react'
import PropTypes from 'prop-types'
import { Tooltip } from 'react-leaflet'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBus, faMap, faWarning } from '@fortawesome/free-solid-svg-icons'
import L from 'leaflet'

function VehicleMarkerTooltip({route, metadata, alerts}) {
  if (L.Browser.mobile) {
    return
  }

  const routeHeaderStyle = {
    'backgroundColor': '#' + route.route_color,
    'color': 'white'
  }

  return(
    <Tooltip>
      <div className="tooltip-content">
        <div className="route-name mb-1 d-flex" style={routeHeaderStyle}>
          {route.route_short_name} - {route.route_long_name}
          {(typeof alerts !== 'undefined') &&
            (
              <div className="ms-2">
                <FontAwesomeIcon icon={faWarning}></FontAwesomeIcon>
              </div>
            )
          }
        </div>
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

export default VehicleMarkerTooltip;

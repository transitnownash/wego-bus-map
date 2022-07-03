import { Popup } from 'react-leaflet'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBus, faMap, faMapSigns, faCompass, faTachometer, faClock, faSpinner, faWarning } from '@fortawesome/free-solid-svg-icons'
import { format_bearing, format_speed, format_timestamp } from './../util.js'
import { Link } from 'react-router-dom'

function VehicleMarkerPopup({trip, route, bearing, speed, timestamp, metadata, agency, trip_id, alerts}) {
    const routeHeaderStyle = {
      'backgroundColor': '#' + route.route_color,
      'color': 'white'
    }

    const trip_headsign = (trip.trip_headsign)
      ? trip.trip_headsign
      : (<FontAwesomeIcon icon={faSpinner} spin={true}></FontAwesomeIcon>)
    ;

  return(
    <Popup>
      <div className="popup-content">
        <div className="route-name mb-1 d-flex" style={routeHeaderStyle}>
          <div className="flex-grow-1">
            <Link to={'/routes/' + route.route_short_name}>
              {route.route_short_name} - {route.route_long_name}
            </Link>
          </div>
          {(typeof alerts !== 'undefined') &&
              (
                <div className="ms-2">
                  <FontAwesomeIcon icon={faWarning}></FontAwesomeIcon>
                </div>
              )
            }
        </div>
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
              <td><Link to={'/trips/' + trip_id}>{trip_id}</Link></td>
            </tr>
            <tr>
              <th><FontAwesomeIcon icon={faCompass} fixedWidth/> Heading</th>
              <td>{format_bearing(bearing)}</td>
            </tr>
            <tr>
              <th><FontAwesomeIcon icon={faTachometer} fixedWidth/> Speed</th>
              <td>{format_speed(speed)}</td>
            </tr>
            <tr>
              <th><FontAwesomeIcon icon={faClock} fixedWidth/> Updated</th>
              <td>{format_timestamp(timestamp)}</td>
            </tr>
          </tbody>
        </table>
        <div className="text-end"><a href={agency.agency_url} className="text-muted" target="_blank" rel="noreferrer">{agency.agency_name}</a></div>
      </div>
    </Popup>
  )
}

export default VehicleMarkerPopup;

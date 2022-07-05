import React from 'react'
import PropTypes from 'prop-types'
import { faBicycle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Marker, Popup, Tooltip } from "react-leaflet"
import { format_timestamp } from "../util"
import L from 'leaflet'

function BCycleMarker({icon, station}) {
  // Ignore if station does not have status loaded
  if (typeof station.status === 'undefined') {
    return
  }

  return(
    <Marker icon={icon} position={[station.lat, station.lon]}>
      {L.Browser.mobile === false &&
        <Tooltip>
          <div style={{width: '300px'}}>
            <div className="stop-name">{station.name}</div>
            <div className="row my-3">
              <div className="col-sm-6 text-center">
                <div className="h1"><FontAwesomeIcon icon={faBicycle} fixedWidth={true}></FontAwesomeIcon> {station.status.num_bikes_available}</div>
                <div>Bikes Available</div>
              </div>
              <div className="col-sm-6 text-center">
                <div className="h1">{station.status.num_docks_available}</div>
                <div>Docks Available</div>
              </div>
            </div>
          </div>
        </Tooltip>
      }
      <Popup>
        <div style={{width: '300px'}}>
          <div className="stop-name">{station.name}</div>
          <div className="row my-3">
            <div className="col-sm-6 text-center">
              <div className="h1"><FontAwesomeIcon icon={faBicycle} fixedWidth={true}></FontAwesomeIcon> {station.status.num_bikes_available}</div>
              <div>Bikes Available</div>
            </div>
            <div className="col-sm-6 text-center">
              <div className="h1">{station.status.num_docks_available}</div>
              <div>Docks Available</div>
            </div>
          </div>
          <hr />
          <dl className="row">
            <dt className="col-5"><i className="fas fa-map-marked-alt fa-fw" aria-hidden="true"></i> Address</dt>
            <dd className="col-7"><a href={'https://www.google.com/maps/dir/?api=1&travelmode=transit&destination=' + station.lat + '%2C' + station.lon} rel='noreferrer' target="_blank">{station.address}</a></dd>
            <dt className="col-5"><i className="fas fa-exchange-alt fa-fw" aria-hidden="true"></i> Renting?</dt>
            <dd className="col-7">{station.status.is_renting ? 'Yes' : 'No'}</dd>
            <dt className="col-5"><i className="fas fa-inbox fa-fw" aria-hidden="true"></i> Returning?</dt>
            <dd className="col-7">{station.status.is_returning ? 'Yes' : 'No'}</dd>
            <dt className="col-5"><i className="fas fa-clock fa-fw" aria-hidden="true"></i> Updated</dt>
            <dd className="col-7">{format_timestamp(station.status.last_reported)}</dd>
          </dl>
        </div>
        <div className="text-end"><a href="https://nashville.bcycle.com" className="text-muted" target="_blank" rel="noreferrer">BCycle Nashville</a></div>
      </Popup>
    </Marker>
  )
}

BCycleMarker.propTypes = {
  icon: PropTypes.instanceOf(L.Icon),
  station: PropTypes.object
}

BCycleMarker.defaultProps = {
  icon: new L.Icon(),
  station: {}
}

export default BCycleMarker

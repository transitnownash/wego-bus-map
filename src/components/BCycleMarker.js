import React from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';
import { Marker, Popup, Tooltip } from 'react-leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBicycle, faClock, faExclamationTriangle, faMapMarkedAlt, faMobile,
} from '@fortawesome/free-solid-svg-icons';
import { renderUnixTimestamp } from '../util';
import bCycleIconImage from '../resources/bcycle.svg';
import './BCycleMarker.scss';

function BCycleMarker({ station }) {
  // Ignore if stations doesn't have status, or if it isn't "installed"
  if (typeof station.status === 'undefined' || !station.status.is_installed) {
    return;
  }

  let warning = '';
  let opacity = 1.0;
  if (!station.status.is_renting || !station.status.is_returning) {
    opacity = 0.3;
    warning = (
      <div className="p-2 mb-2 bg-warning text-bg-warning text-center">
        {!station.status.is_renting && (
          <div><FontAwesomeIcon icon={faExclamationTriangle} fixedWidth={true}></FontAwesomeIcon> Not Renting Bikes</div>
        )}
        {!station.status.is_returning && (
          <div><FontAwesomeIcon icon={faExclamationTriangle} fixedWidth={true}></FontAwesomeIcon> Not Allowing Returns of Bikes</div>
        )}
      </div>
    );
  }

  const bCycleMarkerIcon = L.Icon.extend({
    options: {
      iconUrl: bCycleIconImage,
      iconSize: [24, 24],
      shadowUrl: null,
    },
  });
  const bCycleIcon = new bCycleMarkerIcon();

  // Shared between popup and tooltip
  function renderStationHeader() {
    return (
      <>
        <div className="bcycle-station-name">{station.name}</div>
        {warning}
        <div className="row my-3">
          <div className="col-sm-6 text-center">
            <div className={(!station.status.is_renting || station.status.num_bikes_available === 0) ? 'bcycle-inactive' : ''}>
              <div className="h1"><FontAwesomeIcon icon={faBicycle} fixedWidth={true}></FontAwesomeIcon> {station.status.num_bikes_available}</div>
              <div>Bikes Available</div>
            </div>
          </div>
          <div className="col-sm-6 text-center">
            <div className={(!station.status.is_returning || station.status.num_docks_available === 0) ? 'bcycle-inactive' : ''}>
              <div className="h1">{station.status.num_docks_available}</div>
              <div>Docks Available</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <Marker icon={bCycleIcon} position={[station.lat, station.lon]} opacity={opacity}>
      {L.Browser.mobile === false
        && <Tooltip>
          <div style={{ width: '300px' }}>
            {renderStationHeader()}
          </div>
        </Tooltip>
      }
      <Popup>
        <div style={{ width: '300px' }}>
          {renderStationHeader()}
          <hr />
          <dl className="row">
            <dt className="col-5"><FontAwesomeIcon icon={faMapMarkedAlt} fixedWidth={true}></FontAwesomeIcon> Address</dt>
            <dd className="col-7"><a href={`https://www.google.com/maps/dir/?api=1&travelmode=transit&destination=${station.lat}%2C${station.lon}`} rel='noreferrer' target="_blank">{station.address}</a></dd>
            <dt className="col-5"><FontAwesomeIcon icon={faMobile} fixedWidth={true}></FontAwesomeIcon> Rental Link</dt>
            <dd className="col-7">
              <div className="btn-group" role="group">
                <a href={station.rental_uris.ios} className="btn btn-sm border border-secondary" target={'_blank'} rel={'noreferrer'}>iOS</a>
                <a href={station.rental_uris.android} className="btn btn-sm border border-secondary" target={'_blank'} rel={'noreferrer'}>Android</a>
              </div>
            </dd>
            <dt className="col-5"><FontAwesomeIcon icon={faClock} fixedWidth={true}></FontAwesomeIcon> Updated</dt>
            <dd className="col-7">{renderUnixTimestamp(station.status.last_reported)}</dd>
          </dl>
        </div>
        <div className="text-end"><a href="https://nashville.bcycle.com" className="text-muted" target={'_blank'} rel={'noreferrer'}>BCycle Nashville</a></div>
      </Popup>
    </Marker>
  );
}

BCycleMarker.propTypes = {
  station: PropTypes.object.isRequired,
};

export default BCycleMarker;

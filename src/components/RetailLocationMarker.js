import React from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowsRotate,
  faDirections, faMapMarkedAlt,
  faStore, faCreditCard,
  faConciergeBell,
} from '@fortawesome/free-solid-svg-icons';
import {
  Marker, Popup, Tooltip,
} from 'react-leaflet';
import retailLocationFullServiceIcon from '../resources/retail-full-service.svg';
import retailLocationReloadOnlyIcon from '../resources/retail-reload-only.svg';

function RetailLocationMarker({
  retailLocation,
}) {
  const retailLocationMarkerOptions = {
    iconUrl: retailLocation.can_buy_media ? retailLocationFullServiceIcon : retailLocationReloadOnlyIcon,
    iconSize: retailLocation.can_buy_media ? [20, 20] : [15, 15],
    shadowUrl: null,
  };

  const headerColor = retailLocation.can_buy_media ? 'purple' : '#444444';

  const retailLocationMarkerIcon = L.Icon.extend({ options: retailLocationMarkerOptions });
  const icon = new retailLocationMarkerIcon();

  const content = (
    <div style={{ minWidth: '300px', maxWidth: '500px', overflow: 'hidden' }}>
      <div className="stop-name d-flex" style={{backgroundColor: headerColor}}>
        <div className="flex-grow-1">
          {retailLocation.name}
        </div>
      </div>
      <div>
        <dl className={'row'}>
          {retailLocation.merchant && retailLocation.merchant !== retailLocation.name && (
            <>
              <dt className={'col-5'}><FontAwesomeIcon icon={faStore} fixedWidth={true}></FontAwesomeIcon> Merchant</dt>
              <dd className={'col-7'}>{retailLocation.merchant}</dd>
            </>
          )}
          <dt className={'col-5'}><FontAwesomeIcon icon={faMapMarkedAlt} fixedWidth={true}></FontAwesomeIcon> Address</dt>
          <dd className={'col-7'}>{[retailLocation.address, retailLocation.zip].filter(Boolean).join(' ')}</dd>
          {retailLocation.service_type && (
            <>
              <dt className={'col-5'}><FontAwesomeIcon icon={faConciergeBell} fixedWidth={true}></FontAwesomeIcon>Service</dt>
              <dd className={'col-7'}>{retailLocation.service_type}</dd>
            </>
          )}
          <dt className={'col-5'}><FontAwesomeIcon icon={faCreditCard} fixedWidth={true}></FontAwesomeIcon> Buy Card?</dt>
          <dd className={'col-7'}>{retailLocation.can_buy_media ? 'Yes' : 'No'}</dd>
          <dt className={'col-5'}><FontAwesomeIcon icon={faArrowsRotate} fixedWidth={true}></FontAwesomeIcon> Reload?</dt>
          <dd className={'col-7'}>{retailLocation.can_reload_media ? 'Yes' : 'No'}</dd>
        </dl>
      </div>
    </div>
  );

  return (
    <>
      <Marker position={[retailLocation.latitude, retailLocation.longitude]} icon={icon}>
        {!L.Browser.mobile && (
          <Tooltip>{content}</Tooltip>
        )}
        <Popup>
          {content}
          <div className="text-center my-2"><a href={`https://www.google.com/maps/dir/?api=1&travelmode=transit&destination=${retailLocation.latitude}%2C${retailLocation.longitude}`} className="btn bg-secondary text-light btn-sm" target="_blank" rel="noreferrer"><FontAwesomeIcon icon={faDirections} fixedWidth={true} /> Directions</a></div>
        </Popup>
      </Marker>
    </>
  );
}

RetailLocationMarker.propTypes = {
  retailLocation: PropTypes.object.isRequired,
};

RetailLocationMarker.defaultProps = {
  retailLocation: {},
};

export default RetailLocationMarker;

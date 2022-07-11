import React from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';
import { Circle, Marker, Popup, Tooltip } from "react-leaflet";
import { formatTripTime } from "../util";
import stopIconImage from '../resources/stop.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faWarning } from '@fortawesome/free-solid-svg-icons';
import StopTimeSequence from './StopTimeSequence';

function StopTimeMarker({stopTime, stopAlerts}) {
  const stopMarkerIcon = L.Icon.extend({
    options: {
      iconUrl: stopIconImage,
      iconSize: [24, 24],
      shadowUrl: null
    }
  });
  const stopIcon = new stopMarkerIcon();

  const content = (
    <div>
      <div className="stop-name d-flex">
          <div className="flex-grow-1"><StopTimeSequence stopTime={stopTime}></StopTimeSequence> {stopTime.stop.stop_name}</div>
        </div>
      {stopTime.timepoint === "1" &&
          (<div className="p-2 mb-2 text-center bg-info rounded-bottom" style={{marginTop: '-1em'}}><FontAwesomeIcon icon={faClock} fixedWidth={true}></FontAwesomeIcon> Timing Stop</div>)
      }
      {stopAlerts.length > 0 &&
          (<div className="p-2 mb-2 text-center bg-warning rounded-bottom" style={{marginTop: '-1em'}}><FontAwesomeIcon icon={faWarning} fixedWidth={true}></FontAwesomeIcon> System Alert at Stop</div>)
      }
      <dl>
        <dt>Scheduled Time</dt>
        <dd>{formatTripTime(stopTime.arrival_time)}</dd>
        <dt>Code</dt>
        <dd><tt>{stopTime.stop.stop_code}</tt></dd>
        {stopTime.stop.stop_desc != null &&
        <>
          <dt>Description</dt>
          <dd>{stopTime.stop.stop_desc ? stopTime.stop.stop_desc : 'N/A'}</dd>
        </>
        }
      </dl>
    </div>
  );

  return(
    <>
      <Marker position={[stopTime.stop.stop_lat, stopTime.stop.stop_lon]} icon={stopIcon}>
        {!L.Browser.mobile && (
          <Tooltip>{content}</Tooltip>
        )}
        <Popup>{content}</Popup>
      </Marker>
      {stopTime.timepoint === "1" &&
        (<Circle center={[stopTime.stop.stop_lat, stopTime.stop.stop_lon]} radius={40} pathOptions={{ color: 'purple' }}></Circle>)
      }
      {stopAlerts.length > 0 &&
        (<Circle center={[stopTime.stop.stop_lat, stopTime.stop.stop_lon]} radius={70} pathOptions={{ color: 'orange' }}></Circle>)
      }
    </>
  );
}

StopTimeMarker.propTypes = {
  stopTime: PropTypes.object,
  stopAlerts: PropTypes.array
};

StopTimeMarker.defaultProps = {
  stopTime: {},
  stopAlerts: []
};

export default StopTimeMarker;

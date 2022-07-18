import React from 'react';
import PropTypes from 'prop-types';
import L from 'leaflet';
import { Circle, Marker, Popup, Tooltip } from "react-leaflet";
import stopIconImage from '../resources/stop.svg';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faWarning, faLandmark } from '@fortawesome/free-solid-svg-icons';
import StopTimeSequence from './StopTimeSequence';
import { Link } from 'react-router-dom';
import StopAccessibilityInformation from './StopAccessibilityInformation';
import TimePoint from './TimePoint';

function StopMarker({stop, stopTime, stopUpdate, stopAlerts}) {
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
        <div className="flex-grow-1">
          {stopTime.stop_sequence &&
            (<span className="pe-1"><StopTimeSequence stopTime={stopTime}></StopTimeSequence></span>)
          }
          <Link to={'/stops/' + stop.stop_code}>{stop.stop_name}</Link>
        </div>
      </div>
      {stopTime.timepoint === "1" &&
        (<div className="p-2 mb-2 text-center bg-info rounded-bottom" style={{marginTop: '-1em'}}><FontAwesomeIcon icon={faClock} fixedWidth={true}></FontAwesomeIcon> Timing Stop</div>)
      }
      {stopAlerts.length > 0 &&
        (<div className="p-2 mb-2 text-center bg-warning rounded-bottom" style={{marginTop: '-1em'}}><FontAwesomeIcon icon={faWarning} fixedWidth={true}></FontAwesomeIcon> System Alert at Stop</div>)
      }
      {stop.parent_station_gid != null &&
        (<div className="p-2 mb-2 text-center"><FontAwesomeIcon icon={faLandmark} fixedWidth={true}></FontAwesomeIcon> <em>Inside {stop.parent_station_gid}</em></div>)
      }
      <div className="p-2 mb-2 text-center">
        <StopAccessibilityInformation stop={stop}></StopAccessibilityInformation>
      </div>
      <dl>
        {typeof stopTime.arrival_time !== 'undefined' &&
          (<>
            <dt>Time</dt>
            <dd><TimePoint scheduleData={stopTime} updateData={stopUpdate}></TimePoint></dd>
          </>)
        }
        <dt>Code</dt>
        <dd><tt>{stop.stop_code}</tt></dd>
        {stop.stop_desc != null &&
        <>
          <dt>Description</dt>
          <dd>{stop.stop_desc ? stop.stop_desc : 'N/A'}</dd>
        </>
        }
      </dl>
    </div>
  );

  return(
    <>
      <Marker position={[stop.stop_lat, stop.stop_lon]} icon={stopIcon}>
        {!L.Browser.mobile && (
          <Tooltip>{content}</Tooltip>
        )}
        <Popup>{content}</Popup>
      </Marker>
      {stopTime.timepoint === "1" &&
        (<Circle center={[stop.stop_lat, stop.stop_lon]} radius={40} pathOptions={{ color: 'purple' }}></Circle>)
      }
      {stopAlerts.length > 0 &&
        (<Circle center={[stop.stop_lat, stop.stop_lon]} radius={70} pathOptions={{ color: 'orange' }}></Circle>)
      }
    </>
  );
}

StopMarker.propTypes = {
  stop: PropTypes.object.isRequired,
  stopTime: PropTypes.object,
  stopUpdate: PropTypes.object,
  stopAlerts: PropTypes.array
};

StopMarker.defaultProps = {
  stopTime: {},
  stopUpdate: {},
  stopAlerts: []
};

export default StopMarker;

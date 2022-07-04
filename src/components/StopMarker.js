import React from 'react'
import PropTypes from 'prop-types'
import L from 'leaflet';
import { Circle, Marker, Popup, Tooltip } from "react-leaflet"
import { format_trip_time } from "../util"
import stopIconImage from '../resources/stop.svg'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/free-solid-svg-icons';

function StopMarker({stop_time, stop_alerts}) {

  const stopMarkerIcon = L.Icon.extend({
    options: {
      iconUrl: stopIconImage,
      iconSize: [24, 24],
      shadowUrl: null
    }
  })
  const stopIcon = new stopMarkerIcon()

  const content = (
    <div>
      <div className="stop-name">
        {stop_time.stop.stop_name}
        </div>
      {stop_time.timepoint === "1" &&
          (<div className="p-2 mb-2 text-center bg-info rounded-bottom" style={{marginTop: '-1em'}}><FontAwesomeIcon icon={faClock} fixedWidth={true}></FontAwesomeIcon> Timing Stop</div>)
      }
      <dl>
        <dt>Scheduled Time</dt>
        <dd>{format_trip_time(stop_time.arrival_time)}</dd>
        <dt>Code</dt>
        <dd><tt>{stop_time.stop.stop_code}</tt></dd>
        {stop_time.stop.stop_desc != null &&
        <>
          <dt>Description</dt>
          <dd>{stop_time.stop.stop_desc ? stop_time.stop.stop_desc : 'N/A'}</dd>
        </>
        }
      </dl>
    </div>
  )

  return(
    <>
      <Marker position={[stop_time.stop.stop_lat, stop_time.stop.stop_lon]} icon={stopIcon}>
        {!L.Browser.mobile && (
          <Tooltip>{content}</Tooltip>
        )}
        <Popup>{content}</Popup>
      </Marker>
      {stop_time.timepoint === "1" &&
        (<Circle center={[stop_time.stop.stop_lat, stop_time.stop.stop_lon]} radius={40} pathOptions={{ color: 'purple' }}></Circle>)
      }
      {stop_alerts.length > 0 &&
        (<Circle center={[stop_time.stop.stop_lat, stop_time.stop.stop_lon]} radius={70} pathOptions={{ color: 'orange' }}></Circle>)
      }
    </>
  )
}

StopMarker.propTypes = {
  stop_time: PropTypes.object,
  stop_alerts: PropTypes.array
}

export default StopMarker

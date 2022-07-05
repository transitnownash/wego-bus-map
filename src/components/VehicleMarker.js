import React from 'react'
import PropTypes from 'prop-types'
import { useRef, useState } from 'react'
import ReactLeafletDriftMarker from 'react-leaflet-drift-marker'
import VehicleMarkerPopup from './VehicleMarkerPopup'
import L from 'leaflet'
import '../lib/leaflet-rotated-marker'
import busMarkerImage from '../resources/bus.svg'
import busMarkerImageShadow from '../resources/bus-shadow.svg'
import trainMarkerImage from '../resources/train.svg'
import trainMarkerImageShadow from '../resources/train-shadow.svg'
import './VehicleMarker.scss'
import VehicleMarkerTooltip from './VehicleMarkerTooltip'

const GTFS_BASE_URL = process.env.REACT_APP_GTFS_BASE_URL;

function VehicleMarker({id, position, route, agency, bearing, speed, timestamp, metadata, tripId, shapeSetter, stopSetter, alerts}) {
  const [trip, setTripData] = useState({})
  const marker = useRef()

  if (!route) {
    console.log('[Warning] No matching route found for Trip #' + tripId);
    return(<></>)
  }

  let iconOptions = {
    iconUrl: busMarkerImage,
    iconSize: [32, 32],
    popupAnchor: [0, -14],
    shadowSize: [32, 50],
    shadowAnchor: [16, 16]
  }

  // Set shadow rotation if bearing provided
  if (typeof bearing === 'number') {
    iconOptions['shadowUrl'] = busMarkerImageShadow
  }
  // Swap out images if vehicle is a train
  if (route.route_type === '2') {
    iconOptions['iconUrl'] = trainMarkerImage
    iconOptions['shadowUrl'] = trainMarkerImageShadow
  }
  const markerIcon = L.Icon.extend({options: iconOptions})
  const icon = new markerIcon()

  // Fade stale icons a bit
  let opacity = 1.0
  if ((Date.now()/1000) - timestamp > 120) {
    opacity = 0.25
  }

  // Handle click on marker
  const showTripDetails = function() {
    fetch(GTFS_BASE_URL + '/trips/' + tripId + '.json')
      .then((res) => res.json())
      .then((trip) => {
        // Add shape to map
        trip.shape['route_color'] = route.route_color
        shapeSetter([trip.shape])
        // Add stops to map
        stopSetter(trip.stop_times)
        return trip
      })
      .then((data) => setTripData(data));
  }

  // Rotate the shadow if bearing is set
  if (marker.current) {
    if (typeof bearing === 'number') {
      marker.current.setRotationShadowAngle(bearing)
    }
  }

  return(
    <ReactLeafletDriftMarker ref={marker} duration={1000} eventHandlers={{click: showTripDetails}} key={id} position={position} icon={icon} rotationShadowAngle={bearing} opacity={opacity}>
      <VehicleMarkerPopup speed={speed} bearing={bearing} metadata={metadata} route={route} agency={agency} tripId={tripId} trip={trip} timestamp={timestamp} alerts={alerts}></VehicleMarkerPopup>
      <VehicleMarkerTooltip route={route} metadata={metadata} alerts={alerts}></VehicleMarkerTooltip>
    </ReactLeafletDriftMarker>
  )
}

VehicleMarker.propTypes = {
  id: PropTypes.string,
  position: PropTypes.array,
  route: PropTypes.object,
  agency: PropTypes.object,
  bearing: PropTypes.number,
  speed: PropTypes.number,
  timestamp: PropTypes.number,
  metadata: PropTypes.object,
  tripId: PropTypes.string,
  shapeSetter: PropTypes.func,
  stopSetter: PropTypes.func,
  alerts: PropTypes.array
}

VehicleMarker.defaultProps = {
  id: null,
  position: [],
  route: {},
  agency: {},
  bearing: null,
  speed: null,
  timestamp: null,
  metadata: {},
  tripId: null,
  shapeSetter: () => { console.error('No shapeSetter function set!') },
  stopSetter: () => { console.error('No stopSetter function set!') },
  alerts: []
}

export default VehicleMarker

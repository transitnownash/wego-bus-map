import React from 'react';
import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import ReactLeafletDriftMarker from 'react-leaflet-drift-marker';
import VehicleMarkerPopup from './VehicleMarkerPopup';
import L from 'leaflet';
import '../lib/leaflet-rotated-marker';
import busMarkerImage from '../resources/bus.svg';
import busMarkerImageShadow from '../resources/bus-shadow.svg';
import trainMarkerImage from '../resources/train.svg';
import trainMarkerImageShadow from '../resources/train-shadow.svg';
import './VehicleMarker.scss';
import VehicleMarkerTooltip from './VehicleMarkerTooltip';
import { getJSON } from '../util';

const GTFS_BASE_URL = process.env.REACT_APP_GTFS_BASE_URL;

function VehicleMarker({vehiclePositionData, route, agency, shapeSetter, stopSetter, alerts}) {
  const [trip, setTripData] = useState({});
  const marker = useRef(null);

  if (typeof route.route_gid === 'undefined') {
    console.log('[Warning] No matching route found for Trip #' + vehiclePositionData.metadata.trip.trip_id);
    return(<></>);
  }

  let iconOptions = {
    iconUrl: busMarkerImage,
    iconSize: [32, 32],
    popupAnchor: [0, -14],
    shadowSize: [32, 50],
    shadowAnchor: [16, 16]
  };

  // Set shadow rotation if bearing provided
  if (typeof vehiclePositionData.bearing === 'number') {
    iconOptions['shadowUrl'] = busMarkerImageShadow;
  }
  // Swap out images if vehicle is a train
  if (route.route_type === '2') {
    iconOptions['iconUrl'] = trainMarkerImage;
    iconOptions['shadowUrl'] = trainMarkerImageShadow;
  }
  const markerIcon = L.Icon.extend({options: iconOptions});
  const icon = new markerIcon();

  // Fade stale icons a bit
  let opacity = 1.0;
  if ((Date.now()/1000) - vehiclePositionData.timestamp > 120) {
    opacity = 0.25;
  }

  // Handle click on marker
  const showTripDetails = function() {
    getJSON(GTFS_BASE_URL + '/trips/' + vehiclePositionData.metadata.trip.trip_id + '.json')
      .then((trip) => {
        // Add shape to map
        trip.shape['route_color'] = route.route_color;
        shapeSetter([trip.shape]);
        // Add stops to map
        stopSetter(trip.stop_times);
        return trip;
      })
      .then((data) => setTripData(data));
  };

  // Rotate the shadow if bearing is set
  if (marker.current) {
    if (typeof vehiclePositionData.bearing === 'number') {
      marker.current.setRotationShadowAngle(vehiclePositionData.bearing);
    }
  }

  return(
    <ReactLeafletDriftMarker ref={marker} duration={1000} eventHandlers={{click: showTripDetails}} position={vehiclePositionData.position} icon={icon} rotationShadowAngle={vehiclePositionData.bearing} opacity={opacity}>
      <VehicleMarkerPopup speed={vehiclePositionData.speed} bearing={vehiclePositionData.bearing} metadata={vehiclePositionData.metadata} route={route} agency={agency} tripId={vehiclePositionData.metadata.trip.trip_id} trip={trip} timestamp={vehiclePositionData.timestamp} alerts={alerts}></VehicleMarkerPopup>
      <VehicleMarkerTooltip route={route} metadata={vehiclePositionData.metadata} alerts={alerts}></VehicleMarkerTooltip>
    </ReactLeafletDriftMarker>
  );
}

VehicleMarker.propTypes = {
  vehiclePositionData: PropTypes.object.isRequired,
  route: PropTypes.object,
  agency: PropTypes.object,
  shapeSetter: PropTypes.func,
  stopSetter: PropTypes.func,
  alerts: PropTypes.array
};

VehicleMarker.defaultProps = {
  route: {},
  agency: {},
  shapeSetter: () => { console.error('No shapeSetter function set!'); },
  stopSetter: () => { console.error('No stopSetter function set!'); },
  alerts: []
};

export default VehicleMarker;

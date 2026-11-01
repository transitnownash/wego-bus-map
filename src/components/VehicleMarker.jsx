import React, {
  memo, useEffect, useMemo, useRef, useState,
} from 'react';
import PropTypes from 'prop-types';
import ReactLeafletDriftMarker from 'react-leaflet-drift-marker';
import VehicleMarkerPopup from './VehicleMarkerPopup';
import '../lib/leaflet-rotated-marker';
import busMarkerImage from '../resources/bus.svg';
import busOfflineMarkerImage from '../resources/bus-offline.svg';
import busMarkerImageShadow from '../resources/bus-shadow.svg';
import trainMarkerImage from '../resources/train.svg';
import trainOfflineMarkerImage from '../resources/train-offline.svg';
import trainMarkerImageShadow from '../resources/train-shadow.svg';
import './VehicleMarker.scss';
import VehicleMarkerTooltip from './VehicleMarkerTooltip';
import { getJSON } from '../util';
import cachedIcon from '../lib/iconCache';

const GTFS_BASE_URL = import.meta.env.VITE_GTFS_BASE_URL;

export function isVehiclePositionStale(vehiclePositionData) {
  return (Date.now() / 1000) - vehiclePositionData.vehicle.timestamp > 120;
}

function VehicleMarker({
  vehiclePositionData, route, agency, tripUpdate = {}, shapeSetter, stopSetter, alerts = [], isStale,
}) {
  const [trip, setTripData] = useState({});
  const marker = useRef(null);

  const isOffline = route === undefined || !route.route_gid;

  const iconOptions = {
    iconUrl: isOffline ? busOfflineMarkerImage : busMarkerImage,
    iconSize: [32, 32],
    popupAnchor: [0, -14],
    shadowSize: [32, 50],
    shadowAnchor: [16, 16],
  };

  // Set shadow image if bearing provided
  if (typeof vehiclePositionData.vehicle.position.bearing === 'number') {
    iconOptions.shadowUrl = busMarkerImageShadow;
    // Swap out images if vehicle is a train
    if (route?.route_type === '2') {
      iconOptions.iconUrl = isOffline ? trainOfflineMarkerImage : trainMarkerImage;
      iconOptions.shadowUrl = trainMarkerImageShadow;
    }
  }
  const icon = cachedIcon(iconOptions);

  // Fade stale icons a bit
  const opacity = (isStale ?? isVehiclePositionStale(vehiclePositionData)) ? 0.25 : 1.0;

  // Handle click on marker
  const showTripDetails = function () {
    if (!vehiclePositionData.vehicle.trip) {
      return;
    }
    getJSON(`${GTFS_BASE_URL}/trips/${vehiclePositionData.vehicle.trip?.trip_id}.json`)
      .then((trip) => {
        // Add shape to map
        trip.shape.route_color = route.route_color;
        shapeSetter([trip.shape]);
        // Add stops to map
        stopSetter(trip.stop_times);
        return trip;
      })
      .then((data) => setTripData(data));
  };

  // Stable handler so react-leaflet doesn't rebind the click listener on every render
  const showTripDetailsRef = useRef(showTripDetails);
  useEffect(() => {
    showTripDetailsRef.current = showTripDetails;
  });
  const eventHandlers = useMemo(() => ({ click: () => showTripDetailsRef.current() }), []);

  // Drift marker animates whenever the position array changes identity, so only
  // hand it a new one when the vehicle actually moved
  const { latitude, longitude, bearing } = vehiclePositionData.vehicle.position;
  const position = useMemo(() => [latitude, longitude], [latitude, longitude]);

  // Rotate the shadow if bearing is set
  useEffect(() => {
    if (marker.current && typeof bearing === 'number') {
      marker.current.setRotationShadowAngle(bearing);
    }
  }, [bearing]);

  return (
    <ReactLeafletDriftMarker ref={marker} duration={1000} eventHandlers={eventHandlers} position={position} icon={icon} rotationShadowAngle={vehiclePositionData.vehicle.position.bearing} opacity={opacity} zIndexOffset={100}>
      <VehicleMarkerPopup vehiclePositionData={vehiclePositionData} route={route} agency={agency} trip={trip} tripUpdate={tripUpdate} alerts={alerts}></VehicleMarkerPopup>
      <VehicleMarkerTooltip vehiclePositionData={vehiclePositionData} route={route} alerts={alerts}></VehicleMarkerTooltip>
    </ReactLeafletDriftMarker>
  );
}

VehicleMarker.propTypes = {
  vehiclePositionData: PropTypes.object.isRequired,
  route: PropTypes.object.isRequired,
  agency: PropTypes.object.isRequired,
  shapeSetter: PropTypes.func.isRequired,
  stopSetter: PropTypes.func.isRequired,
  tripUpdate: PropTypes.object,
  alerts: PropTypes.array,
  isStale: PropTypes.bool,
};

// Polls hand back fresh objects for every vehicle, so compare position data by value
function arePropsEqual(prev, next) {
  return Object.keys(next).every((key) => {
    if (key === 'vehiclePositionData') {
      return prev[key] === next[key] || JSON.stringify(prev[key]) === JSON.stringify(next[key]);
    }
    return prev[key] === next[key];
  });
}

export default memo(VehicleMarker, arePropsEqual);

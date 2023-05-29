import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import ReactLeafletDriftMarker from 'react-leaflet-drift-marker';
import L from 'leaflet';
import VehicleMarkerPopup from './VehicleMarkerPopup';
import '../lib/leaflet-rotated-marker';
import busMarkerImage from '../resources/bus.svg';
import busMarkerImageShadow from '../resources/bus-shadow.svg';
import trainMarkerImage from '../resources/train.svg';
import trainMarkerImageShadow from '../resources/train-shadow.svg';
import './VehicleMarker.scss';
import VehicleMarkerTooltip from './VehicleMarkerTooltip';
import { getJSON } from '../util';

const GTFS_BASE_URL = process.env.REACT_APP_GTFS_BASE_URL;

function VehicleMarker({
  vehiclePositionData, route, agency, tripUpdate, shapeSetter, stopSetter, alerts,
}) {
  const [trip, setTripData] = useState({});
  const marker = useRef(null);

  if (typeof route === 'undefined' || typeof route.route_gid === 'undefined') {
    console.warn(`No matching route found for Trip #${vehiclePositionData.vehicle.trip.trip_id}`);
    return (<></>);
  }

  const iconOptions = {
    iconUrl: busMarkerImage,
    iconSize: [32, 32],
    popupAnchor: [0, -14],
    shadowSize: [32, 50],
    shadowAnchor: [16, 16],
  };

  // Set shadow image if bearing provided
  if (typeof vehiclePositionData.vehicle.position.bearing === 'number') {
    iconOptions.shadowUrl = busMarkerImageShadow;
    // Swap out images if vehicle is a train
    if (route.route_type === '2') {
      iconOptions.iconUrl = trainMarkerImage;
      iconOptions.shadowUrl = trainMarkerImageShadow;
    }
  }
  const markerIcon = L.Icon.extend({ options: iconOptions });
  const icon = new markerIcon();

  // Fade stale icons a bit
  let opacity = 1.0;
  if ((Date.now() / 1000) - vehiclePositionData.vehicle.timestamp > 120) {
    opacity = 0.25;
  }

  // Handle click on marker
  const showTripDetails = function () {
    getJSON(`${GTFS_BASE_URL}/trips/${vehiclePositionData.vehicle.trip.trip_id}.json`)
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

  // Rotate the shadow if bearing is set
  if (marker.current) {
    if (typeof vehiclePositionData.vehicle.position.bearing === 'number') {
      marker.current.setRotationShadowAngle(vehiclePositionData.vehicle.position.bearing);
    }
  }

  return (
    <ReactLeafletDriftMarker ref={marker} duration={1000} eventHandlers={{ click: showTripDetails }} position={[vehiclePositionData.vehicle.position.latitude, vehiclePositionData.vehicle.position.longitude]} icon={icon} rotationShadowAngle={vehiclePositionData.vehicle.position.bearing} opacity={opacity} zIndexOffset={100}>
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
};

VehicleMarker.defaultProps = {
  tripUpdate: {},
  alerts: [],
};

export default VehicleMarker;

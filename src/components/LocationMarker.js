import React, { useEffect, useState } from 'react';
import {
  Marker, Popup, Circle, useMapEvents,
} from 'react-leaflet';
import L from 'leaflet';
import userLocationIcon from '../resources/user-location.svg';
import { getJSON } from '../util';
import StopMarker from './StopMarker';

const GTFS_BASE_URL = process.env.REACT_APP_GTFS_BASE_URL;
const SEARCH_DISTANCE_IN_METERS = 1609;

function LocationMarker() {
  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [stops, setStops] = useState([]);

  useEffect(() => {
    if (position === null) {
      return;
    }
    console.log(position);
    getJSON(`${GTFS_BASE_URL}/stops/near/${position.lat.toFixed(4)},${position.lng.toFixed(4)}/${SEARCH_DISTANCE_IN_METERS}.json`)
      .then((s) => setStops(s.data));
  }, [position]);

  const LocationMarkerIcon = L.Icon.extend({
    options: {
      iconUrl: userLocationIcon,
      iconSize: [32, 32],
      popupAnchor: [0, -14],
      shadowUrl: null,
    },
  });
  const icon = new LocationMarkerIcon();

  const map = useMapEvents({
    locationfound(e) {
      if (!map.options.maxBounds.contains(e.latlng)) {
        window.alert('Your location is outside of the bounds of this map.');
        return;
      }
      setPosition(e.latlng);
      setAccuracy(e.accuracy);
      map.flyTo(e.latlng, 14);
    },
    locationerror(e) {
      console.error(e);
      window.alert(`Unable to find your location. (${e.message})`);
    },
  });

  return position === null ? null : (
    <>
      <Marker position={position} icon={icon}>
        <Popup><strong>Your location.</strong><br />Accuracy: {accuracy.toFixed(1)} meters</Popup>
      </Marker>
      {stops.map((item) => (
          <StopMarker key={item.id} stop={item} />
      ))}
      <Circle center={position} radius={accuracy}></Circle>
      <Circle center={position} radius={SEARCH_DISTANCE_IN_METERS} pathOptions={{
        fill: false, color: '#666', weight: '3', dashArray: '20, 20', dashOffset: '20',
      }}></Circle>
    </>
  );
}

export default LocationMarker;

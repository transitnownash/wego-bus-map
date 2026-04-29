import React from 'react';
import { render } from '@testing-library/react';
import { MapContainer } from 'react-leaflet';
import LocationMarker from './LocationMarker';

test('renders LocationMarker', () => {
  render(
    <MapContainer center={[36.1627, -86.7816]} zoom={13}>
      <LocationMarker />
    </MapContainer>,
  );
});

import React from 'react';
import { render } from '@testing-library/react';
import { MapContainer } from 'react-leaflet';
import StopMarker from './StopMarker';
import stopFixture from '../fixtures/stop-DOVDICWF.json';

test('renders StopMarker', () => {
  render(
    <MapContainer center={[36.1627, -86.7816]} zoom={13}>
      <StopMarker stop={stopFixture} />
    </MapContainer>,
  );
});

import React from 'react';
import { createRoot } from 'react-dom/client';
import RetailLocationMarker from './RetailLocationMarker';
import { MapContainer } from 'react-leaflet';

const retailLocations = require('../fixtures/retail_locations.json');

test('renders RetailLocationMarker', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  const retailLocation = retailLocations.data[0];
  root.render(<MapContainer>
    <RetailLocationMarker retailLocation={retailLocation} />
  </MapContainer>);
});

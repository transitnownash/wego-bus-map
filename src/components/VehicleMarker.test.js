/* globals test */

import React from 'react';
import VehicleMarker from './VehicleMarker';
import { createRoot } from 'react-dom/client';
import { MapContainer } from 'react-leaflet';
import { formatPositionData } from '../util';
const vehiclePositionsFixture = require('../fixtures/vehicle_positions.json');
const routeFixture = require('../fixtures/routes-4.json');

test('renders VehicleMarker', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  const vehiclePositionData = formatPositionData(vehiclePositionsFixture).find((i) => i.id === '1703');
  root.render(
    <MapContainer>
      <VehicleMarker vehiclePositionData={vehiclePositionData} route={routeFixture}/>
    </MapContainer>
  );
});

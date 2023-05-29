/* globals test */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { MapContainer } from 'react-leaflet';
import VehicleMarkerTooltip from './VehicleMarkerTooltip';

const vehiclePositionsFixture = require('../fixtures/vehicle_positions.json');
const tripFixture = require('../fixtures/trips-270708.json');
const agenciesFixture = require('../fixtures/agencies.json');
const routeFixture = require('../fixtures/routes-4.json');

test('renders VehicleMarkerTooltip', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  const vehiclePositionData = vehiclePositionsFixture.find((i) => i.id === '1703');
  const agency = agenciesFixture.data[0];
  root.render(
    <MapContainer>
      <VehicleMarkerTooltip vehiclePositionData={vehiclePositionData} route={routeFixture} trip={tripFixture} agency={agency} />
    </MapContainer>,
  );
});

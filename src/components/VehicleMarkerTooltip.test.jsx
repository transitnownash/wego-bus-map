import React from 'react';
import { createRoot } from 'react-dom/client';
import { MapContainer } from 'react-leaflet';
import VehicleMarkerTooltip from './VehicleMarkerTooltip';

import vehiclePositionsFixture from '../fixtures/vehicle_positions.json';
import tripFixture from '../fixtures/trips-270708.json';
import agenciesFixture from '../fixtures/agencies.json';
import routeFixture from '../fixtures/routes-4.json';

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

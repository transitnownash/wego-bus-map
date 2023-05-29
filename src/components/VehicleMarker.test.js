/* globals test */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { MapContainer } from 'react-leaflet';
import VehicleMarker from './VehicleMarker';

const vehiclePositionsFixture = require('../fixtures/vehicle_positions.json');
const tripFixture = require('../fixtures/trips-270708.json');
const agenciesFixture = require('../fixtures/agencies.json');
const routeFixture = require('../fixtures/routes-4.json');

test('renders VehicleMarker', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  const vehiclePositionData = vehiclePositionsFixture.find((i) => i.id === '1703');
  const agency = agenciesFixture.data[0];
  const stopSetterFunc = () => console.log('Stops set!');
  const shapeSetterFunc = () => console.log('Shape set!');
  root.render(
    <MapContainer>
      <VehicleMarker vehiclePositionData={vehiclePositionData} route={routeFixture} trip={tripFixture} agency={agency} stopSetter={stopSetterFunc} shapeSetter={shapeSetterFunc}/>
    </MapContainer>,
  );
});

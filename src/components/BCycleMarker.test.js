/* globals test */

import React from 'react';
import BCycleMarker from './BCycleMarker';
import { createRoot } from 'react-dom/client';
const stationInformationFixture = require('../fixtures/bcycle-station_information.json');
const stationStatusFixture = require('../fixtures/bcycle-station_status.json');

test('renders BCycleMarker', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  const station = stationInformationFixture.data.stations[0];
  station.status = stationStatusFixture.data.stations.find((i) => station.station_id === i.station_id);
  root.render(<BCycleMarker station={station} />);
});

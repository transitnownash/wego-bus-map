import React from 'react';
import { render } from '@testing-library/react';
import { MapContainer } from 'react-leaflet';
import BCycleMarker from './BCycleMarker';

import stationInformationFixture from '../fixtures/bcycle-station_information.json';
import stationStatusFixture from '../fixtures/bcycle-station_status.json';

test('renders BCycleMarker', () => {
  const station = stationInformationFixture.data.stations[0];
  station.status = stationStatusFixture.data.stations.find((i) => station.station_id === i.station_id);
  render(
    <MapContainer center={[36.1627, -86.7816]} zoom={13}>
      <BCycleMarker station={station} />
    </MapContainer>,
  );
});

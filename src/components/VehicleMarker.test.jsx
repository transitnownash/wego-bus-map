import React from 'react';
import PropTypes from 'prop-types';
import { render } from '@testing-library/react';
import { MapContainer, Marker } from 'react-leaflet';
import { vi } from 'vitest';
import VehicleMarker from './VehicleMarker';

import vehiclePositionsFixture from '../fixtures/vehicle_positions.json';
import tripFixture from '../fixtures/trips-270708.json';
import agenciesFixture from '../fixtures/agencies.json';
import routeFixture from '../fixtures/routes-4.json';

vi.mock('react-leaflet-drift-marker', () => ({
  default: (() => {
    const MockDriftMarker = React.forwardRef(function MockDriftMarkerComponent({ children, ...props }, ref) {
      return (
        <Marker ref={ref} {...props}>
          {children}
        </Marker>
      );
    });
    MockDriftMarker.displayName = 'MockDriftMarker';
    MockDriftMarker.propTypes = {
      children: PropTypes.node,
    };
    MockDriftMarker.defaultProps = {
      children: null,
    };
    return MockDriftMarker;
  })(),
}));

test('renders VehicleMarker', () => {
  const vehiclePositionData = vehiclePositionsFixture.find((i) => i.id === '1703');
  const agency = agenciesFixture.data[0];
  const stopSetterFunc = () => console.log('Stops set!');
  const shapeSetterFunc = () => console.log('Shape set!');
  render(
    <MapContainer>
      <VehicleMarker vehiclePositionData={vehiclePositionData} route={routeFixture} trip={tripFixture} agency={agency} stopSetter={stopSetterFunc} shapeSetter={shapeSetterFunc}/>
    </MapContainer>,
  );
});

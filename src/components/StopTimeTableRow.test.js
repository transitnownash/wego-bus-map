import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StopTimeTableRow from './StopTimeTableRow';

const stopTime = {
    id: 5039953,
    trip_gid: '266834',
    trip_id: 153785,
    arrival_time: ' 4:38:00',
    departure_time: ' 4:38:00',
    stop_gid: 'GXOGREEN',
    stop_id: 46034,
    stop_sequence: 1,
    stop_headsign: null,
    pickup_type: '0',
    drop_off_type: '0',
    shape_dist_traveled: null,
    timepoint: '1',
    stop: {
      id: 46034,
      stop_gid: 'GXOGREEN',
      stop_code: 'GXOGREEN',
      stop_name: 'GREENFIELD STATION OUTBOUND',
      stop_desc: '3405 GALLATIN PIKE & HOME RD',
      stop_lat: '36.21007',
      stop_lon: '-86.733544',
      zone_gid: null,
      stop_url: null,
      location_type: null,
      parent_station: null,
      stop_timezone: null,
      wheelchair_boarding: '1',
    },
  };

test('renders StopTimeTableRow', () => {
  render(
    <MemoryRouter>
      <table>
        <tbody>
          <StopTimeTableRow stopTime={stopTime} />
        </tbody>
      </table>
    </MemoryRouter>,
  );
  expect(screen.getByText('GREENFIELD STATION OUTBOUND')).toBeInTheDocument();
});

test('shows skipped badge for stop-level skipped status', () => {
  const stopTimeUpdate = {
    stop_sequence: 4,
    schedule_relationship: 'Skipped',
  };
  render(
    <MemoryRouter>
      <table>
        <tbody>
          <StopTimeTableRow stopTime={stopTime} stopTimeUpdate={stopTimeUpdate} />
        </tbody>
      </table>
    </MemoryRouter>,
  );

  expect(screen.getByText('Skipped')).toBeInTheDocument();
});

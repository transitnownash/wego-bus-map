import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, test, vi } from 'vitest';
import NextDeparturesTable from './NextDeparturesTable';

afterEach(() => {
  vi.restoreAllMocks();
});

// Build a HH:MM:SS time offset from now, so ETA text stays "in the future" regardless of when the test runs
function timeMinutesFromNow(minutes) {
  const date = new Date(Date.now() + minutes * 60000);
  return date.toTimeString().slice(0, 8);
}

function timeMinutesFromNowEpoch(minutes) {
  return Math.round((Date.now() + minutes * 60000) / 1000);
}

function buildFixture() {
  return {
    next_trip: {
      stop_time: { departure_time: timeMinutesFromNow(25) },
      trip: {
        trip_gid: '385815',
        trip_headsign: 'DOWNTOWN',
        route: {
          route_gid: '4',
          route_short_name: '4',
          route_long_name: 'SHELBY',
          route_color: '753CBE',
          route_text_color: 'FFFFFF',
        },
      },
    },
    upcoming_trips: [
      {
        stop_time: { departure_time: timeMinutesFromNow(60) },
        trip: {
          trip_gid: '385816',
          trip_headsign: 'DOWNTOWN',
          route: {
            route_gid: '4',
            route_short_name: '4',
            route_long_name: 'SHELBY',
            route_color: '753CBE',
            route_text_color: 'FFFFFF',
          },
        },
      },
    ],
  };
}

// First trip is running 5 minutes late per the realtime trip_updates feed;
// second trip has no matching stop_time_update, so it should show no delay status.
const tripUpdatesFixture = [
  {
    trip_update: {
      trip: { trip_id: '385815' },
      stop_time_update: [
        { stop_id: '10AHERNN', departure: { time: timeMinutesFromNowEpoch(30) } },
      ],
    },
  },
];

const vehiclePositionsFixture = [
  { vehicle: { trip: { trip_id: '385815' }, vehicle: { id: '2705', label: '1810' } } },
];

function mockFetchOnce(body, status = 200) {
  vi.spyOn(globalThis, 'fetch').mockResolvedValue(
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }),
  );
}

test('renders next departures table', async () => {
  mockFetchOnce(buildFixture());

  const { container } = render(
    <MemoryRouter>
      <NextDeparturesTable
        stopCode="10AHERNN"
        stopGid="10AHERNN"
        tripUpdates={tripUpdatesFixture}
        vehiclePositions={vehiclePositionsFixture}
      />
    </MemoryRouter>,
  );

  await waitFor(() => expect(screen.getByText('Next Departures')).toBeInTheDocument());
  expect(screen.getAllByText('DOWNTOWN').length).toEqual(2);
  expect(screen.getAllByText('4').length).toEqual(2);
  expect(screen.getAllByText('SHELBY', { exact: false }).length).toEqual(2);
  // First trip has a matching stop_time_update, so it gets a relative time plus a delay status
  expect(screen.getByText((_content, el) => el.tagName === 'TD' && el.textContent === 'in 30 minutes (5 minutes late)')).toBeInTheDocument();
  // Second trip has no matching stop_time_update, so it only shows the relative time
  expect(screen.getByText((_content, el) => el.tagName === 'TD' && el.textContent === 'in 1 hour')).toBeInTheDocument();
  // First trip has a vehicle assigned in vehiclePositions
  expect(container.querySelectorAll('.text-success').length).toEqual(1);
  // Time links through to the trip page
  expect(container.querySelector('a[href="/trips/385815"]')).toBeInTheDocument();
});

test('drops a departure once its vehicle has already left the stop', async () => {
  mockFetchOnce({
    next_trip: {
      stop_time: { departure_time: timeMinutesFromNow(-5) },
      trip: {
        trip_gid: '385815',
        trip_headsign: 'DOWNTOWN',
        route: {
          route_gid: '4', route_short_name: '4', route_long_name: 'SHELBY', route_color: '753CBE', route_text_color: 'FFFFFF',
        },
      },
    },
    upcoming_trips: [],
  });

  render(
    <MemoryRouter><NextDeparturesTable stopCode="10AHERNN" /></MemoryRouter>,
  );

  await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
  expect(screen.queryByText('Next Departures')).not.toBeInTheDocument();
});

test('renders nothing when there are no upcoming trips', async () => {
  mockFetchOnce({ next_trip: null, upcoming_trips: [] });

  render(
    <MemoryRouter><NextDeparturesTable stopCode="10AHERNN" /></MemoryRouter>,
  );

  await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
  expect(screen.queryByText('Next Departures')).not.toBeInTheDocument();
});

test('renders nothing on fetch error', async () => {
  vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network error'));

  render(
    <MemoryRouter><NextDeparturesTable stopCode="10AHERNN" /></MemoryRouter>,
  );

  await waitFor(() => expect(globalThis.fetch).toHaveBeenCalled());
  expect(screen.queryByText('Next Departures')).not.toBeInTheDocument();
});

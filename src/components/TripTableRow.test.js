/* globals test, expect, describe */

import React from 'react';
import { render, screen } from '@testing-library/react';
import TripTableRow from './TripTableRow';

const mockTrip = {
  trip_gid: '123456',
  start_time: '10:00:00',
  end_time: '11:00:00',
  bikes_allowed: '1',
  wheelchair_accessible: '1',
  trip_headsign: 'Test Headsign',
  stop_times: [
    { stop_sequence: 1, arrival_time: '10:00:00', departure_time: '10:00:00' },
    { stop_sequence: 2, arrival_time: '11:00:00', departure_time: '11:00:00' },
  ],
};

const mockRoute = {
  route_gid: '1',
  route_short_name: '1',
  route_color: 'FF0000',
  route_text_color: 'FFFFFF',
};

describe('TripTableRow', () => {
  test('renders without crashing', () => {
    const { container } = render(
      <table>
        <tbody>
          <TripTableRow trip={mockTrip} route={mockRoute} tripUpdate={{}} hidePastTrips={false} />
        </tbody>
      </table>,
    );
    expect(container).toBeInTheDocument();
  });

  test('displays canceled badge for trip-level Canceled status', () => {
    const tripUpdate = {
      trip_update: {
        trip: { schedule_relationship: 'Canceled' },
        stop_time_update: [
          { stop_sequence: 1, schedule_relationship: 'Scheduled' },
        ],
      },
    };
    render(
      <table>
        <tbody>
          <TripTableRow trip={mockTrip} route={mockRoute} tripUpdate={tripUpdate} hidePastTrips={false} />
        </tbody>
      </table>,
    );
    expect(screen.getByText('Canceled')).toBeInTheDocument();
  });

  test('displays canceled badge for numeric status 4', () => {
    const tripUpdate = {
      trip_update: {
        trip: { schedule_relationship: 4 },
        stop_time_update: [
          { stop_sequence: 1, schedule_relationship: 0 },
        ],
      },
    };
    render(
      <table>
        <tbody>
          <TripTableRow trip={mockTrip} route={mockRoute} tripUpdate={tripUpdate} hidePastTrips={false} />
        </tbody>
      </table>,
    );
    expect(screen.getByText('Canceled')).toBeInTheDocument();
  });

  test('displays unscheduled badge for trip-level Unscheduled status', () => {
    const tripUpdate = {
      trip_update: {
        trip: { schedule_relationship: 'Unscheduled' },
        stop_time_update: [
          { stop_sequence: 1, schedule_relationship: 'Scheduled' },
        ],
      },
    };
    render(
      <table>
        <tbody>
          <TripTableRow trip={mockTrip} route={mockRoute} tripUpdate={tripUpdate} hidePastTrips={false} />
        </tbody>
      </table>,
    );
    expect(screen.getByText('Unscheduled')).toBeInTheDocument();
  });

  test('displays unscheduled badge for numeric status 3', () => {
    const tripUpdate = {
      trip_update: {
        trip: { schedule_relationship: 3 },
        stop_time_update: [
          { stop_sequence: 1, schedule_relationship: 0 },
        ],
      },
    };
    render(
      <table>
        <tbody>
          <TripTableRow trip={mockTrip} route={mockRoute} tripUpdate={tripUpdate} hidePastTrips={false} />
        </tbody>
      </table>,
    );
    expect(screen.getByText('Unscheduled')).toBeInTheDocument();
  });

  test('displays skipped badge for trip-level Skipped status', () => {
    const tripUpdate = {
      trip_update: {
        trip: { schedule_relationship: 'Skipped' },
        stop_time_update: [
          { stop_sequence: 1, schedule_relationship: 'Scheduled' },
        ],
      },
    };
    render(
      <table>
        <tbody>
          <TripTableRow trip={mockTrip} route={mockRoute} tripUpdate={tripUpdate} hidePastTrips={false} />
        </tbody>
      </table>,
    );
    expect(screen.getByText('Skipped')).toBeInTheDocument();
  });

  test('displays no-data badge when all stops have No Data status', () => {
    const tripUpdate = {
      trip_update: {
        trip: { schedule_relationship: 'Scheduled' },
        stop_time_update: [
          { stop_sequence: 1, schedule_relationship: 'No Data' },
          { stop_sequence: 2, schedule_relationship: 'No Data' },
        ],
      },
    };
    render(
      <table>
        <tbody>
          <TripTableRow trip={mockTrip} route={mockRoute} tripUpdate={tripUpdate} hidePastTrips={false} />
        </tbody>
      </table>,
    );
    expect(screen.getByText('No Data')).toBeInTheDocument();
  });

  test('prioritizes trip-level over stop-level status', () => {
    const tripUpdate = {
      trip_update: {
        trip: { schedule_relationship: 'Canceled' },
        stop_time_update: [
          { stop_sequence: 1, schedule_relationship: 'Unscheduled' },
        ],
      },
    };
    render(
      <table>
        <tbody>
          <TripTableRow trip={mockTrip} route={mockRoute} tripUpdate={tripUpdate} hidePastTrips={false} />
        </tbody>
      </table>,
    );
    expect(screen.getByText('Canceled')).toBeInTheDocument();
    expect(screen.queryByText('Unscheduled')).not.toBeInTheDocument();
  });

  test('detects stop-level canceled when trip-level is normal', () => {
    const tripUpdate = {
      trip_update: {
        trip: { schedule_relationship: 'Scheduled' },
        stop_time_update: [
          { stop_sequence: 1, schedule_relationship: 'Scheduled' },
          { stop_sequence: 2, schedule_relationship: 'Canceled' },
        ],
      },
    };
    render(
      <table>
        <tbody>
          <TripTableRow trip={mockTrip} route={mockRoute} tripUpdate={tripUpdate} hidePastTrips={false} />
        </tbody>
      </table>,
    );
    expect(screen.getByText('Canceled')).toBeInTheDocument();
  });

  test('does not display badge for normal scheduled trip', () => {
    const tripUpdate = {
      trip_update: {
        trip: { schedule_relationship: 'Scheduled' },
        stop_time_update: [
          { stop_sequence: 1, schedule_relationship: 'Scheduled' },
        ],
      },
    };
    render(
      <table>
        <tbody>
          <TripTableRow trip={mockTrip} route={mockRoute} tripUpdate={tripUpdate} hidePastTrips={false} />
        </tbody>
      </table>,
    );
    expect(screen.queryByText('Canceled')).not.toBeInTheDocument();
    expect(screen.queryByText('Unscheduled')).not.toBeInTheDocument();
    expect(screen.queryByText('Skipped')).not.toBeInTheDocument();
    expect(screen.queryByText('No Data')).not.toBeInTheDocument();
  });
});

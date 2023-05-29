/* globals test, expect */

import React from 'react';
import { render, screen } from '@testing-library/react';
import TimePoint from './TimePoint';
import tripFixture from '../fixtures/trips-270708.json';
import tripUpdateFixture from '../fixtures/trip_updates.json';

test('renders TimePoint', () => {
  const { container } = render(
    <TimePoint scheduleData={tripFixture.stop_times[0]} />,
  );
  expect(container.getElementsByClassName('text-muted')).toHaveLength(0);
  expect(screen.getByText('9:55 PM')).toBeInTheDocument();
  expect(container).toMatchSnapshot();
});

test('renders TimePoint with trip update', () => {
  const tripUpdate = tripUpdateFixture.find((i) => i.trip_update.trip.trip_id === '270708');
  const { container } = render(
    <TimePoint scheduleData={tripFixture.stop_times[0]} updateData={tripUpdate.trip_update.stop_time_update[0]} />,
  );
  expect(container.getElementsByClassName('text-muted')).toHaveLength(1);
  expect(screen.getByText('9:55 PM')).toBeInTheDocument();
  expect(screen.getByText('9:59 PM')).toBeInTheDocument();
  expect(container).toMatchSnapshot();
});

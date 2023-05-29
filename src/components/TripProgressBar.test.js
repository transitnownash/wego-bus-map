/* globals test, expect, afterEach */

import React from 'react';
import { render, screen } from '@testing-library/react';
import MockDate from 'mockdate';
import TripProgressBar from './TripProgressBar';

const tripFixture = require('../fixtures/trips-270708.json');
const tripUpdatesFixture = require('../fixtures/trip_updates.json');

afterEach(() => {
  MockDate.reset();
});

test('renders TripProgressBar', () => {
  MockDate.set('Fri Jul 22 2022 22:10:00 GMT-0500');
  const tripUpdates = tripUpdatesFixture.filter((i) => i.trip_update.trip.trip_id === tripFixture.trip_gid);
  const { container } = render(
    <TripProgressBar trip={tripFixture} tripUpdates={tripUpdates} />,
  );
  expect(container.querySelector('.trip-progress-bar > .progress > div')).toHaveStyle({ width: '17.551%' });
  expect(screen.getByText('2.44 mi')).toBeInTheDocument();
  expect(container).toMatchSnapshot();
});

test('renders TripProgressBar for completed trip', () => {
  MockDate.set('Fri Jul 22 2022 23:59:00 GMT-0500');
  const { container } = render(
    <TripProgressBar trip={tripFixture} tripUpdates={[]} />,
  );
  expect(container.querySelector('.trip-progress-bar-completed')).toBeInTheDocument();
  expect(container.querySelector('.trip-progress-bar > .progress > div')).toHaveStyle({ width: '100%' });
  expect(screen.getByText('13.92 mi')).toBeInTheDocument();
  expect(container).toMatchSnapshot();
});

test('renders empty TripProgressBar for trip not yet started', () => {
  MockDate.set('Fri Jul 22 2022 10:45:00 GMT-0500');
  const { container } = render(
    <TripProgressBar trip={tripFixture} tripUpdates={[]} />,
  );
  expect(container.querySelector('.trip-progress-bar-empty')).toBeInTheDocument();
  expect(container).toMatchSnapshot();
});

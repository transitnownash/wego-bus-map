/* globals test, expect, afterEach */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MockDate from 'mockdate';
import TripTable from './TripTable';

const routeTripsFixture = require('../fixtures/routes-4-trips.json');
const routeFixture = require('../fixtures/routes-4.json');

afterEach(() => {
  MockDate.reset();
});

test('renders TripTable', () => {
  MockDate.set('Fri Jul 22 2022 12:10:00 GMT-0500');
  const { container } = render(
    <TripTable routeTrips={routeTripsFixture.data} route={routeFixture} />,
  );
  expect(screen.getAllByText('DOWNTOWN')).toHaveLength(16);
  expect(screen.getAllByText('INGLEWOOD')).toHaveLength(16);
  expect(screen.queryAllByText('266924')).toHaveLength(0);
  expect(screen.queryAllByText('11:26 AM')).toHaveLength(0);
  expect(screen.getByText('266927')).toBeInTheDocument();
  expect(screen.getByText('12:09 PM')).toBeInTheDocument();
  expect(container).toMatchSnapshot();
});

test('renders TripTable with past trips', async () => {
  MockDate.set('Sun Jul 24 2022 12:10:00 GMT-0500');
  const user = userEvent.setup();

  const { container } = render(
    <TripTable routeTrips={routeTripsFixture.data} route={routeFixture} hidePastTrips={false} />,
  );

  await user.click(screen.getByRole('checkbox', { name: /Hide past trips/i }));

  expect(screen.getAllByText('DOWNTOWN')).toHaveLength(26);
  expect(screen.getAllByText('INGLEWOOD')).toHaveLength(25);
  expect(screen.getByText('266924')).toBeInTheDocument();
  expect(screen.getByText('11:26 AM')).toBeInTheDocument();
  expect(screen.getByText('266927')).toBeInTheDocument();
  expect(screen.getByText('12:09 PM')).toBeInTheDocument();
  expect(container).toMatchSnapshot();
});

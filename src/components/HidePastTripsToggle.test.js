/* globals test, expect */

import React from 'react';
import HidePastTripsToggle from './HidePastTripsToggle';
import { render, screen } from '@testing-library/react';

test('renders HidePastTripsToggle', () => {
  const {container} = render(
    <HidePastTripsToggle hidePastTrips={true} onChange={() => console.log('Changed!')} />
  );
  expect(screen.getByRole('checkbox')).toBeChecked();
  expect(screen.getByText('Hide Past Trips')).toBeInTheDocument();
  expect(container).toMatchSnapshot();
});

test('renders HidePastTripsToggle unchecked', () => {
  const {container} = render(
    <HidePastTripsToggle hidePastTrips={false} onChange={() => console.log('Changed!')} />
  );
  expect(screen.getByRole('checkbox')).not.toBeChecked();
  expect(screen.getByText('Hide Past Trips')).toBeInTheDocument();
  expect(container).toMatchSnapshot();
});

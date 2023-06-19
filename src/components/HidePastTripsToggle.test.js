/* globals test, expect */

import React from 'react';
import { render, screen } from '@testing-library/react';
import HidePastTripsToggle from './HidePastTripsToggle';

test('renders HidePastTripsToggle', () => {
  const { container } = render(
    <HidePastTripsToggle hidePastTrips={true} onChange={() => console.log('Changed!')} />,
  );
  expect(screen.getByRole('checkbox')).toBeChecked();
  expect(screen.getByText('Hide past trips')).toBeInTheDocument();
  expect(container).toMatchSnapshot();
});

test('renders HidePastTripsToggle unchecked', () => {
  const { container } = render(
    <HidePastTripsToggle hidePastTrips={false} onChange={() => console.log('Changed!')} />,
  );
  expect(screen.getByRole('checkbox')).not.toBeChecked();
  expect(screen.getByText('Hide past trips')).toBeInTheDocument();
  expect(container).toMatchSnapshot();
});

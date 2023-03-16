/* globals test, expect */

import React from 'react';
import Headsign from './Headsign';
import { render, screen } from '@testing-library/react';

test('renders Headsign', () => {
  const {container} = render(
    <Headsign headsign="DOWNTOWN" />
  );
  expect(screen.getByText('DOWNTOWN')).toBeInTheDocument();
  expect(container).toMatchSnapshot();
});

test('renders Headsign with Letter', () => {
  const {container} = render(
    <Headsign headsign="A - DOWNTOWN" />
  );
  expect(screen.getByText('A')).toBeInTheDocument();
  expect(screen.getByText('DOWNTOWN')).toBeInTheDocument();
  expect(container.firstChild.firstChild.classList.contains('badge')).toBe(true);
  expect(container).toMatchSnapshot();
});

test('renders Headsign with Letter', () => {
  const {container} = render(
    <Headsign headsign="A -WHITE BRIDGE" />
  );
  expect(screen.getByText('A')).toBeInTheDocument();
  expect(screen.getByText('WHITE BRIDGE')).toBeInTheDocument();
  expect(container.firstChild.firstChild.classList.contains('badge')).toBe(true);
  expect(container).toMatchSnapshot();
});


/* globals test, expect */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import TransitRouteHeader from './TransitRouteHeader';

const routeFixture = require('../fixtures/routes-4.json');

test('renders TransitRouteHeader', () => {
  const { container } = render(
    <Router>
      <TransitRouteHeader route={routeFixture} />
    </Router>,
  );
  expect(screen.getByText('SHELBY')).toBeInTheDocument();
  expect(container.querySelector('.transit-route-header')).toHaveStyle({ backgroundColor: 'rgb(117, 60, 190)', color: 'rgb(255, 255, 255)' });
  expect(container).toMatchSnapshot();
});

test('renders TransitRouteHeader', () => {
  const { container } = render(
    <Router>
      <TransitRouteHeader route={routeFixture} />
    </Router>,
  );
  expect(screen.getByText('SHELBY')).toBeInTheDocument();
  expect(container.querySelector('.transit-route-header')).toHaveStyle({ backgroundColor: 'rgb(117, 60, 190)', color: 'rgb(255, 255, 255)' });
  expect(screen.queryByAltText('Icon')).toBeNull();
  expect(container).toMatchSnapshot();
});

test('renders TransitRouteHeader with icon', () => {
  const { container } = render(
    <Router>
      <TransitRouteHeader route={routeFixture} showRouteType={true} />
    </Router>,
  );
  expect(screen.getByText('SHELBY')).toBeInTheDocument();
  expect(container.querySelector('.transit-route-header')).toHaveStyle({ backgroundColor: 'rgb(117, 60, 190)', color: 'rgb(255, 255, 255)' });
  expect(screen.getByAltText('Icon')).toBeInTheDocument();
  expect(container).toMatchSnapshot();
});

test('renders TransitRouteHeader with invalid route.', () => {
  const route = {};
  const { container } = render(
    <Router>
      <TransitRouteHeader route={route} />
    </Router>,
  );
  expect(screen.getByText('Invalid route!')).toBeInTheDocument();
  expect(container).toMatchSnapshot();
});

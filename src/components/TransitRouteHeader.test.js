/* globals test, expect */

import React from 'react';
import TransitRouteHeader from './TransitRouteHeader';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router} from 'react-router-dom';
import * as routeFixture from '../fixtures/routes-4.json';

test('renders TransitRouteHeader', () => {
  const route = routeFixture;
  const {container} = render(
    <Router>
      <TransitRouteHeader route={route} />
    </Router>
  );
  expect(screen.getByText('4 - SHELBY')).toBeInTheDocument();
  expect(container.querySelector('.transit-route-header')).toHaveStyle({backgroundColor: 'rgb(117, 60, 190)', color: 'rgb(255, 255, 255)'});
});

test('renders TransitRouteHeader', () => {
  const route = routeFixture;
  const {container} = render(
    <Router>
      <TransitRouteHeader route={route} />
    </Router>
  );
  expect(screen.getByText('4 - SHELBY')).toBeInTheDocument();
  expect(container.querySelector('.transit-route-header')).toHaveStyle({backgroundColor: 'rgb(117, 60, 190)', color: 'rgb(255, 255, 255)'});
  expect(screen.queryByAltText('Icon')).toBeNull();
});

test('renders TransitRouteHeader with icon', () => {
  const route = routeFixture;
  const {container} = render(
    <Router>
      <TransitRouteHeader route={route} showRouteType={true} />
    </Router>
  );
  expect(screen.getByText('4 - SHELBY')).toBeInTheDocument();
  expect(container.querySelector('.transit-route-header')).toHaveStyle({backgroundColor: 'rgb(117, 60, 190)', color: 'rgb(255, 255, 255)'});
  expect(screen.getByAltText('Icon')).toBeInTheDocument();
});

test('renders TransitRouteHeader with invalid route.', () => {
  render(
    <Router>
      <TransitRouteHeader route={{}} />
    </Router>
  );
  expect(screen.getByText('Invalid route!')).toBeInTheDocument();
});

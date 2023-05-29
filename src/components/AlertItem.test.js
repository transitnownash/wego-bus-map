/* globals test, expect */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import AlertItem from './AlertItem';

const alertsFixture = require('../fixtures/alerts.json');
const routesFixture = require('../fixtures/routes.json');

test('renders AlertItem', () => {
  const route = routesFixture.data.find((i) => i.route_gid === alertsFixture[0].alert.informed_entity[0].route_id);
  const { container } = render(
    <Router>
      <AlertItem alert={alertsFixture[0].alert} route={route} />
    </Router>,
  );
  expect(screen.getByText('79 - SKYLINE')).toBeInTheDocument();
  expect(screen.getByText('4/4/22, 2:24 AM')).toBeInTheDocument();
  expect(container).toMatchSnapshot();
});

test('renders AlertItem with informed stops', () => {
  const route = routesFixture.data.find((i) => i.route_gid === alertsFixture[3].alert.informed_entity[0].route_id);
  const { container } = render(
    <Router>
      <AlertItem alert={alertsFixture[3].alert} route={route} />
    </Router>,
  );
  expect(screen.getByText('14 - WHITES CREEK')).toBeInTheDocument();
  expect(screen.getByText('WHIDICSN')).toBeInTheDocument();
  expect(container).toMatchSnapshot();
});

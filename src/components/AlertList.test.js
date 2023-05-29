/* globals test, expect */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import AlertList from './AlertList';

const alertsFixture = require('../fixtures/alerts.json');
const routesFixture = require('../fixtures/routes.json');

test('renders AlertList', () => {
  const { container } = render(
    <Router>
      <AlertList alerts={alertsFixture} routes={routesFixture.data} />
    </Router>,
  );
  expect(screen.getByText('22 - BORDEAUX')).toBeInTheDocument();
  expect(screen.getByText('6/1/22, 8:30 AM')).toBeInTheDocument();
  expect(container).toMatchSnapshot();
});

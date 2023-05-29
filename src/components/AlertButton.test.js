/* globals test, expect */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import AlertButton from './AlertButton';

const alertsFixture = require('../fixtures/alerts.json');

test('renders AlertButton', () => {
  const { container } = render(
    <Router>
      <AlertButton alerts={alertsFixture} buttonAction={() => undefined} />
    </Router>,
  );
  expect(screen.getByText('Service Alerts')).toBeInTheDocument();
  expect(screen.getByText('8')).toBeInTheDocument();
  expect(container).toMatchSnapshot();
});

test('does not render AlertButton when no alerts', () => {
  const { container } = render(
    <Router>
      <AlertButton alerts={[]} buttonAction={() => undefined} />
    </Router>,
  );
  expect(container).toMatchSnapshot();
});

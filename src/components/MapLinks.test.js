/* globals test, expect */

import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import MapLinks from './MapLinks';

test('renders MapLinks', () => {
  const { container } = render(
    <Router>
      <MapLinks />
    </Router>,
  );
  expect(container).toMatchSnapshot();
});

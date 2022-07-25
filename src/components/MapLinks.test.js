/* globals test, expect */

import React from 'react';
import MapLinks from './MapLinks';
import { render } from '@testing-library/react';
import { BrowserRouter as Router} from 'react-router-dom';

test('renders MapLinks', () => {
  const {container} = render(
    <Router>
      <MapLinks />
    </Router>
  );
  expect(container).toMatchSnapshot();
});

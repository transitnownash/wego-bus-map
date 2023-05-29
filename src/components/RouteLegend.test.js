/* globals test, expect */

import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import RouteLegend from './RouteLegend';

test('renders RouteLegend', () => {
  const { container } = render(
    <Router>
      <RouteLegend />
    </Router>,
  );
  expect(container).toMatchSnapshot();
});

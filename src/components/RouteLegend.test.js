/* globals test, expect */

import React from 'react';
import RouteLegend from './RouteLegend';
import { render } from '@testing-library/react';
import { BrowserRouter as Router} from 'react-router-dom';

test('renders RouteLegend', () => {
  const {container} = render(
    <Router>
      <RouteLegend />
    </Router>
  );
  expect(container).toMatchSnapshot();
});

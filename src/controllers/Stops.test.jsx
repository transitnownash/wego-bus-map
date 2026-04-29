import React from 'react';
import Stops from './Stops';
import { renderWithRouter } from '../test-utils';

test('renders Stops', () => {
  renderWithRouter(<Stops />, { route: '/stops' });
});

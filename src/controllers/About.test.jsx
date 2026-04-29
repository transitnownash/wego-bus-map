import React from 'react';
import About from './About';
import { renderWithRouter } from '../test-utils';

test('renders About', () => {
  renderWithRouter(<About />, { route: '/about' });
});

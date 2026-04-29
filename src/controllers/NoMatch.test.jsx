import React from 'react';
import NoMatch from './NoMatch';
import { renderWithRouter } from '../test-utils';

test('renders NoMatch', () => {
  renderWithRouter(<NoMatch />, { route: '/missing' });
});

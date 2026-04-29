import React from 'react';
import BCycle from './BCycle';
import { renderWithRouter } from '../test-utils';

test('renders BCycle', () => {
  renderWithRouter(<BCycle />, { route: '/bcycle' });
});

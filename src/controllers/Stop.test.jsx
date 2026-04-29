import React from 'react';
import Stop from './Stop';
import { renderWithRoute } from '../test-utils';

test('renders Stop', () => {
  renderWithRoute(<Stop />, { route: '/stops/CENLAFAY', path: '/stops/:stop_code' });
});

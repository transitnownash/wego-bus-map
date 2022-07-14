/* globals test */

import React from 'react';
import MapLinks from './MapLinks';
import { createRoot } from 'react-dom/client';

test('renders MapLinks', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<MapLinks />);
});

/* globals test */

import React from 'react';
import TripTableRow from './TripTableRow';
import { createRoot } from 'react-dom/client';

test('renders TripTableRow', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<TripTableRow />);
});

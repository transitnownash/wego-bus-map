/* globals test */

import React from 'react';
import { createRoot } from 'react-dom/client';
import TripTableRow from './TripTableRow';

test('renders TripTableRow', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<TripTableRow />);
});

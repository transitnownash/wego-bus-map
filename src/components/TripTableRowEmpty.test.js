/* globals test */

import React from 'react';
import TripTableRowEmpty from './TripTableRowEmpty';
import { createRoot } from 'react-dom/client';

test('renders TripTableRowEmpty', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<TripTableRowEmpty />);
});

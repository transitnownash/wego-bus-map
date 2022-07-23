/* globals test */

import React from 'react';
import TripTable from './TripTable';
import { createRoot } from 'react-dom/client';

test('renders TripTable', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<TripTable />);
});

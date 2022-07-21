/* globals test */

import React from 'react';
import TripProgressBar from './TripProgressBar';
import { createRoot } from 'react-dom/client';

test('renders TripProgressBar', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  const trip = {};
  root.render(<TripProgressBar trip={trip} />);
});

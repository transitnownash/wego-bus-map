/* globals test */

import React from 'react';
import HidePastTripsToggle from './HidePastTripsToggle';
import { createRoot } from 'react-dom/client';

test('renders HidePastTripsToggle', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<HidePastTripsToggle onChange={function() {}} />);
});

/* globals test */

import React from 'react';
import VehicleMarkerTooltip from './VehicleMarkerTooltip';
import { createRoot } from 'react-dom/client';

test('renders VehicleMarkerTooltip', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<VehicleMarkerTooltip />);
});

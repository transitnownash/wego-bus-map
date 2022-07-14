/* globals test */

import React from 'react';
import VehicleMarkerPopup from './VehicleMarkerPopup';
import { createRoot } from 'react-dom/client';

test('renders VehicleMarkerPopup', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<VehicleMarkerPopup />);
});

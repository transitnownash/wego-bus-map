/* globals test */

import React from 'react';
import VehicleMarker from './VehicleMarker';
import { createRoot } from 'react-dom/client';

test('renders VehicleMarker', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<VehicleMarker id={'100'} position={[0, 0]} />);
});

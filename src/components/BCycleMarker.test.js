/* globals test */

import React from 'react';
import BCycleMarker from './BCycleMarker';
import { createRoot } from 'react-dom/client';

test('renders BCycleMarker', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<BCycleMarker />);
});

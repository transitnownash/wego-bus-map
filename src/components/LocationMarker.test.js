/* globals test */

import React from 'react';
import LocationMarker from './LocationMarker';
import { createRoot } from 'react-dom/client';

test('renders LocationMarker', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<LocationMarker />);
});

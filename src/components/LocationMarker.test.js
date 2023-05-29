/* globals test */

import React from 'react';
import { createRoot } from 'react-dom/client';
import LocationMarker from './LocationMarker';

test('renders LocationMarker', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<LocationMarker />);
});

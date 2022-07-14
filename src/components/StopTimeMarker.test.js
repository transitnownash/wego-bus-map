/* globals test */

import React from 'react';
import StopTimeMarker from './StopTimeMarker';
import { createRoot } from 'react-dom/client';

test('renders StopTimeMarker', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<StopTimeMarker />);
});

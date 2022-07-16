/* globals test */

import React from 'react';
import StopMap from './StopMap';
import { createRoot } from 'react-dom/client';

test('renders StopMap', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<StopMap map={true} />);
});

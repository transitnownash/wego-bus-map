/* globals test */

import React, { createRef } from 'react';
import { createRoot } from 'react-dom/client';
import TransitMap from './TransitMap';

test('renders TransitMap', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  const map = createRef(null);
  root.render(<TransitMap map={map} />);
});

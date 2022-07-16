/* globals test */

import React, { createRef } from 'react';
import TransitMap from './TransitMap';
import { createRoot } from 'react-dom/client';

test('renders TransitMap', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  const map = createRef();
  root.render(<TransitMap map={map} />);
});

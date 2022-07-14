/* globals test */

import React from 'react';
import TransitMap from './TransitMap';
import { createRoot } from 'react-dom/client';

test('renders TransitMap', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<TransitMap />);
});

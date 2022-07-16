/* globals test */

import React from 'react';
import { createRoot } from 'react-dom/client';
import TransitRoutes from './TransitRoutes';

test('renders TransitRoutes', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<TransitRoutes />);
});

/* globals test */

import React from 'react';
import { createRoot } from 'react-dom/client';
import TransitRoute from './TransitRoute';

test('renders TransitRoute', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<TransitRoute />);
});

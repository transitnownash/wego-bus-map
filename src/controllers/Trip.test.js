/* globals test */

import React from 'react';
import { createRoot } from 'react-dom/client';
import Trip from './Trip';

test('renders Trip', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<Trip />);
});

/* globals test */

import React from 'react';
import { createRoot } from 'react-dom/client';
import Stop from './Stop';

test('renders Stop', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<Stop />);
});

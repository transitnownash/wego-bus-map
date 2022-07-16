/* globals test */

import React from 'react';
import { createRoot } from 'react-dom/client';
import About from './About';

test('renders About', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<About />);
});

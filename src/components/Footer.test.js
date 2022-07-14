/* globals test */

import React from 'react';
import Footer from './Footer';
import { createRoot } from 'react-dom/client';

test('renders Footer', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<Footer />);
});

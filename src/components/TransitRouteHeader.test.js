/* globals test */

import React from 'react';
import AlertButton from './AlertButton';
import { createRoot } from 'react-dom/client';

test('renders AlertButton', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<AlertButton />);
});

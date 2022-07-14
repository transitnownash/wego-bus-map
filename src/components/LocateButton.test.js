/* globals test */

import React from 'react';
import LocateButton from './LocateButton';
import { createRoot } from 'react-dom/client';

test('renders LocateButton', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<LocateButton />);
});

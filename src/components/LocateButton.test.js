/* globals test */

import React from 'react';
import { createRoot } from 'react-dom/client';
import LocateButton from './LocateButton';

test('renders LocateButton', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<LocateButton />);
});

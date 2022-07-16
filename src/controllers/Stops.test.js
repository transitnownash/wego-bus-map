/* globals test */

import React from 'react';
import { createRoot } from 'react-dom/client';
import Stops from './Stops';

test('renders Stops', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<Stops />);
});

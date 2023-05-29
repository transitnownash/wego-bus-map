/* globals test */

import React from 'react';
import { createRoot } from 'react-dom/client';
import BCycle from './BCycle';

test('renders BCycle', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<BCycle />);
});

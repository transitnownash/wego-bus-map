/* globals test */

import React from 'react';
import { createRoot } from 'react-dom/client';
import NoMatch from './NoMatch';

test('renders NoMatch', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<NoMatch />);
});

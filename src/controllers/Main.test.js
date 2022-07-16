/* globals test */

import React from 'react';
import { createRoot } from 'react-dom/client';
import Main from './Main';

test('renders Main', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<Main />);
});

/* globals test */

import React from 'react';
import TitleBar from './TitleBar';
import { createRoot } from 'react-dom/client';

test('renders TitleBar', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<TitleBar />);
});

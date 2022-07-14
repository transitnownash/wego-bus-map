/* globals test */

import React from 'react';
import LoadingScreen from './LoadingScreen';
import { createRoot } from 'react-dom/client';

test('renders LoadingScreen', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<LoadingScreen />);
});

/* globals test */

import React from 'react';
import { createRoot } from 'react-dom/client';
import LoadingScreen from './LoadingScreen';

test('renders LoadingScreen', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<LoadingScreen />);
});

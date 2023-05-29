/* globals test */

import React from 'react';
import { createRoot } from 'react-dom/client';
import ErrorBoundary from './ErrorBoundary';

test('renders ErrorBoundary', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<ErrorBoundary><h2>Child Content</h2></ErrorBoundary>);
});

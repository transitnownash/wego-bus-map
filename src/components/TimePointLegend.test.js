/* globals test */

import React from 'react';
import TimePointLegend from './TimePointLegend';
import { createRoot } from 'react-dom/client';

test('renders TimePointLegend', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<TimePointLegend />);
});

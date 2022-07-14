/* globals test */

import React from 'react';
import DataFetchError from './DataFetchError';
import { createRoot } from 'react-dom/client';

test('renders DataFetchError', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<DataFetchError />);
});

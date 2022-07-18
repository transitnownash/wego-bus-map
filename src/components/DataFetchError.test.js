/* globals test */

import React from 'react';
import DataFetchError from './DataFetchError';
import { createRoot } from 'react-dom/client';

test('renders DataFetchError', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  const error = new Error('A runtime error has occurred.');
  root.render(<DataFetchError error={error} />);
});

/* globals test */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import DataFetchError from './DataFetchError';

test('renders DataFetchError', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <Router>
      <DataFetchError error={'An error ocurred!'} />
    </Router>,
  );
});

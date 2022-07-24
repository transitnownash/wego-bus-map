/* globals test */

import React from 'react';
import DataFetchError from './DataFetchError';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router} from 'react-router-dom';

test('renders DataFetchError', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <Router>
      <DataFetchError error={'An error ocurred!'} />
    </Router>
  );
});

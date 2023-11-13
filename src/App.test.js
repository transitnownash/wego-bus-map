/* globals test */

import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders App', () => {
  // Fix for Matomo issue in tests
  let emptyScriptTag = document.createElement('script');
  document.getElementsByTagName('body')[0].appendChild(emptyScriptTag);

  render(<App />);
});

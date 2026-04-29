import React from 'react';
import { vi } from 'vitest';
vi.mock('./controllers/Main', () => ({ default: () => null }));
import { render } from '@testing-library/react';

import App from './App';

test('renders App', () => {
  // Fix for Matomo issue in tests
  let emptyScriptTag = document.createElement('script');
  document.getElementsByTagName('body')[0].appendChild(emptyScriptTag);

  render(<App />);
});

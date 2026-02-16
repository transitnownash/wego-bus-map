import React from 'react';
jest.mock('./controllers/Main', () => () => null);
import { render } from '@testing-library/react';

const App = require('./App').default;

test('renders App', () => {
  // Fix for Matomo issue in tests
  let emptyScriptTag = document.createElement('script');
  document.getElementsByTagName('body')[0].appendChild(emptyScriptTag);

  render(<App />);
});

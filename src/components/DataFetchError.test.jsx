import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter as Router } from 'react-router-dom';
import DataFetchError from './DataFetchError';

test('renders DataFetchError', () => {
  vi.spyOn(console, 'error').mockImplementation(() => {});

  render(
    <Router>
      <DataFetchError error={{ name: 'Error', message: 'An error occurred!' }} />
    </Router>,
  );
});

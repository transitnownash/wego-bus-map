import React from 'react';
import { vi } from 'vitest';
vi.mock('./controllers/Main', () => ({ default: () => null }));
import {
  act, render, screen, waitFor,
} from '@testing-library/react';
import { REALTIME_DATA_STATUS_CHANGE_EVENT } from './util';

import App from './App';

test('renders App', () => {
  // Fix for Matomo issue in tests
  let emptyScriptTag = document.createElement('script');
  document.getElementsByTagName('body')[0].appendChild(emptyScriptTag);

  render(<App />);
});

test('shows and hides realtime outage banner based on status events', async () => {
  let emptyScriptTag = document.createElement('script');
  document.getElementsByTagName('body')[0].appendChild(emptyScriptTag);

  render(<App />);

  act(() => {
    window.dispatchEvent(new CustomEvent(REALTIME_DATA_STATUS_CHANGE_EVENT, {
      detail: {
        isRealtimeAvailable: false,
      },
    }));
  });

  await waitFor(() => {
    expect(screen.getByText(/We're unable to display real-time updates right now\./i)).toBeInTheDocument();
  });

  act(() => {
    window.dispatchEvent(new CustomEvent(REALTIME_DATA_STATUS_CHANGE_EVENT, {
      detail: {
        isRealtimeAvailable: true,
      },
    }));
  });

  await waitFor(() => {
    expect(screen.queryByText(/We're unable to display real-time updates right now\./i)).not.toBeInTheDocument();
  });
});

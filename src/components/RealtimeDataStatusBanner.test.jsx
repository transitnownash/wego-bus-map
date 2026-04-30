import React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import RealtimeDataStatusBanner from './RealtimeDataStatusBanner';
import { REALTIME_DATA_STATUS_CHANGE_EVENT } from '../util';

test('hides banner when realtime data is available by default', () => {
  render(<RealtimeDataStatusBanner />);
  expect(screen.queryByText(/We're unable to display real-time updates right now\./i)).not.toBeInTheDocument();
});

test('shows banner when realtime status change event marks data unavailable', () => {
  render(<RealtimeDataStatusBanner />);

  act(() => {
    window.dispatchEvent(new CustomEvent(REALTIME_DATA_STATUS_CHANGE_EVENT, {
      detail: {
        isRealtimeAvailable: false,
      },
    }));
  });

  return waitFor(() => {
    expect(screen.getByText(/We're unable to display real-time updates right now\./i)).toBeInTheDocument();
  });
});

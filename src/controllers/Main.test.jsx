
import { vi } from 'vitest';
import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithRouter } from '../test-utils';

vi.mock('../util', async () => {
  const actual = await vi.importActual('../util');
  return {
    ...actual,
    getJSON: vi.fn((url) => {
      if (url.includes('/routes.json') || url.includes('/agencies.json') || url.includes('services7.arcgis.com')) {
        return Promise.resolve({ data: [] });
      }
      if (url.includes('/realtime/alerts.json') || url.includes('/realtime/trip_updates.json') || url.includes('/realtime/vehicle_positions.json')) {
        return Promise.resolve([]);
      }
      if (url.includes('station_information.json') || url.includes('station_status.json')) {
        return Promise.resolve({ data: { stations: [] } });
      }
      return Promise.resolve({});
    }),
  };
});

import Main from './Main';

test('renders Main', async () => {
  renderWithRouter(<Main />, { route: '/' });

  await waitFor(() => {
    expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
  });
});

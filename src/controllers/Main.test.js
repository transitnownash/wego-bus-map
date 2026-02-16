

jest.mock('../util', () => {
  const actual = jest.requireActual('../util');
  return {
    ...actual,
    getJSON: jest.fn((url) => {
      if (url.includes('/routes.json') || url.includes('/agencies.json') || url.includes('/retail_locations.json')) {
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
});import React from 'react';
import { createRoot } from 'react-dom/client';

const Main = require('./Main').default;

test('renders Main', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(<Main />);
});

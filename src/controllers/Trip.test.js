import React from 'react';
import { createRoot } from 'react-dom/client';
import Trip from './Trip';

describe('Trip', () => {
  test('renders Trip without crashing', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    root.render(<Trip />);
  });

  test('filters alerts by route_gid and route_short_name from any informed_entity', () => {
    const alerts = [
      {
        id: '1',
        alert: {
          informed_entity: [
            { route_id: '4' },
            { route_id: '6' },
          ],
        },
      },
      {
        id: '2',
        alert: {
          informed_entity: [
            { route_id: '22' },
          ],
        },
      },
      {
        id: '3',
        alert: {
          informed_entity: [
            { route_id: 'route-4-id' }, // matches route_gid
          ],
        },
      },
    ];

    const route = { route_gid: 'route-4-id', route_short_name: '4' };

    // Simulate the filter logic from Trip.js
    const routeAlerts = alerts.filter((a) => Array.isArray(a.alert?.informed_entity)
      && a.alert.informed_entity
        .filter((ie) => typeof ie.route_id !== 'undefined')
        .some((ie) => String(ie.route_id) === String(route.route_gid) || String(ie.route_id) === String(route.route_short_name)));

    expect(routeAlerts.length).toBe(2);
    expect(routeAlerts.map(a => a.id)).toEqual(['1', '3']);
  });

  test('handles multi-route alerts properly', () => {
    const alerts = [
      {
        id: '50573',
        alert: {
          informed_entity: [
            { route_id: '3' },
            { route_id: '4' },
            { route_id: '6' },
            { route_id: '17' },
          ],
        },
      },
    ];

    const route4 = { route_gid: '4', route_short_name: '4' };
    const route17 = { route_gid: '17', route_short_name: '17' };
    const route22 = { route_gid: '22', route_short_name: '22' };

    const filterAlerts = (rt) => alerts.filter((a) => Array.isArray(a.alert?.informed_entity)
      && a.alert.informed_entity
        .filter((ie) => typeof ie.route_id !== 'undefined')
        .some((ie) => String(ie.route_id) === String(rt.route_gid) || String(ie.route_id) === String(rt.route_short_name)));

    expect(filterAlerts(route4).length).toBe(1);
    expect(filterAlerts(route17).length).toBe(1);
    expect(filterAlerts(route22).length).toBe(0);
  });
});

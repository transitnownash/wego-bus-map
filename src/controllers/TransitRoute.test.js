/* globals test, describe, expect */

import React from 'react';
import { createRoot } from 'react-dom/client';
import TransitRoute from './TransitRoute';

describe('TransitRoute', () => {
  test('renders TransitRoute without crashing', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    root.render(<TransitRoute />);
  });

  test('filters alerts by route_gid and route_short_name from any informed_entity', () => {
    const alerts = [
      {
        id: '1',
        alert: {
          informed_entity: [
            { route_id: '3' },
            { route_id: '77' },
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
    ];

    const route = { route_gid: 'route-77-id', route_short_name: '77' };

    // Simulate the filter logic from TransitRoute.js
    const routeAlerts = alerts.filter((a) => Array.isArray(a.alert?.informed_entity)
      && a.alert.informed_entity
        .filter((ie) => typeof ie.route_id !== 'undefined')
        .some((ie) => String(ie.route_id) === String(route.route_gid) || String(ie.route_id) === String(route.route_short_name)));

    expect(routeAlerts.length).toBe(1);
    expect(routeAlerts[0].id).toBe('1');
  });

  test('matches against route_gid when exact match', () => {
    const alerts = [
      {
        id: '1',
        alert: {
          informed_entity: [
            { route_id: 'route-4-id' },
          ],
        },
      },
    ];

    const route = { route_gid: 'route-4-id', route_short_name: '4' };

    const routeAlerts = alerts.filter((a) => Array.isArray(a.alert?.informed_entity)
      && a.alert.informed_entity
        .filter((ie) => typeof ie.route_id !== 'undefined')
        .some((ie) => String(ie.route_id) === String(route.route_gid) || String(ie.route_id) === String(route.route_short_name)));

    expect(routeAlerts.length).toBe(1);
  });
});

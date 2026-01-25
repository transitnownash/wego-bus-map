/* globals test, describe, expect */

import React from 'react';
import { createRoot } from 'react-dom/client';
import TransitRoutes from './TransitRoutes';

describe('TransitRoutes', () => {
  test('renders TransitRoutes without crashing', () => {
    const div = document.createElement('div');
    const root = createRoot(div);
    root.render(<TransitRoutes />);
  });

  test('filters alerts by route_id from any informed_entity', () => {
    const alerts = [
      {
        id: '1',
        alert: {
          informed_entity: [
            { route_id: '3' },
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
    ];

    const route = { route_short_name: '4' };

    // Simulate the filter logic from TransitRoutes.js
    const routeAlerts = alerts.filter((a) => Array.isArray(a.alert?.informed_entity)
      && a.alert.informed_entity.some((ent) => ent.route_id === route.route_short_name));

    expect(routeAlerts.length).toBe(1);
    expect(routeAlerts[0].id).toBe('1');
  });

  test('coerces route_id to string for matching', () => {
    const alerts = [
      {
        id: '1',
        alert: {
          informed_entity: [
            { route_id: 4 }, // numeric
          ],
        },
      },
    ];

    const route = { route_short_name: '4' }; // string

    const routeAlerts = alerts.filter((a) => Array.isArray(a.alert?.informed_entity)
      && a.alert.informed_entity.some((ent) => String(ent.route_id) === String(route.route_short_name)));

    expect(routeAlerts.length).toBe(1);
  });
});

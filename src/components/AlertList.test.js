import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import AlertList from './AlertList';

const alertsFixture = require('../fixtures/alerts.json');
const routesFixture = require('../fixtures/routes.json');

describe('AlertList', () => {
  test('renders AlertList with existing fixtures', () => {
    const { container } = render(
      <Router>
        <AlertList alerts={alertsFixture} routes={routesFixture.data} />
      </Router>,
    );
    expect(screen.getByText('22 - BORDEAUX')).toBeInTheDocument();
    expect(screen.getByText('6/1/22, 8:30 AM')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  test('matches alerts with multiple informed entities', () => {
    const multiEntityAlert = [
      {
        id: '50573',
        alert: {
          active_period: [{ start: 1769363820, end: 1769407140 }],
          informed_entity: [
            { route_id: '3' },
            { route_id: '4' },
            { route_id: '6' },
          ],
          cause: 'Weather',
          effect: 'Modified Service',
          header_text: {
            translation: [{ text: 'Service Update', language: 'en' }],
          },
          description_text: {
            translation: [{ text: 'Limited service due to weather', language: 'en' }],
          },
        },
      },
    ];

    const routes = [
      { route_gid: '4', route_short_name: '4', route_long_name: 'SHELBY', route_color: '0000FF', route_text_color: 'FFFFFF' },
    ];

    render(
      <Router>
        <AlertList alerts={multiEntityAlert} routes={routes} />
      </Router>,
    );

    expect(screen.getByText('4 - SHELBY')).toBeInTheDocument();
    expect(screen.getByText('Service Update')).toBeInTheDocument();
  });

  test('matches route by route_short_name when route_gid does not match', () => {
    const alert = [
      {
        id: '1001',
        alert: {
          active_period: [{ start: 1769363820, end: 1769407140 }],
          informed_entity: [{ route_id: '77' }],
          cause: 'Construction',
          effect: 'Detour',
          header_text: {
            translation: [{ text: 'Detour Alert', language: 'en' }],
          },
          description_text: {
            translation: [{ text: 'Route detour in effect', language: 'en' }],
          },
        },
      },
    ];

    const routes = [
      { route_gid: 'route-77-id', route_short_name: '77', route_long_name: 'NASHVILLE WEST', route_color: 'FF0000', route_text_color: 'FFFFFF' },
    ];

    render(
      <Router>
        <AlertList alerts={alert} routes={routes} />
      </Router>,
    );

    expect(screen.getByText('77 - NASHVILLE WEST')).toBeInTheDocument();
  });

  test('coerces numeric route_id to string for matching', () => {
    const alert = [
      {
        id: '1002',
        alert: {
          active_period: [{ start: 1769363820, end: 1769407140 }],
          informed_entity: [{ route_id: 22 }], // numeric
          cause: 'Maintenance',
          effect: 'Delay',
          header_text: {
            translation: [{ text: 'Delay Notice', language: 'en' }],
          },
          description_text: {
            translation: [{ text: 'Expect delays', language: 'en' }],
          },
        },
      },
    ];

    const routes = [
      { route_gid: '22', route_short_name: '22', route_long_name: 'BORDEAUX', route_color: '00FF00', route_text_color: '000000' },
    ];

    render(
      <Router>
        <AlertList alerts={alert} routes={routes} />
      </Router>,
    );

    expect(screen.getByText('22 - BORDEAUX')).toBeInTheDocument();
  });

  test('displays default route info when no route match found', () => {
    const alert = [
      {
        id: '1003',
        alert: {
          active_period: [{ start: 1769363820, end: 1769407140 }],
          informed_entity: [{ route_id: '999' }],
          cause: 'Other',
          effect: 'Unknown Effect',
          header_text: {
            translation: [{ text: 'Unknown Route Alert', language: 'en' }],
          },
          description_text: {
            translation: [{ text: 'Alert for unknown route', language: 'en' }],
          },
        },
      },
    ];

    render(
      <Router>
        <AlertList alerts={alert} routes={[]} />
      </Router>,
    );

    expect(screen.getByText('00 - Route Unavailable')).toBeInTheDocument();
  });
});

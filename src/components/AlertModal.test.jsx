import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import AlertModal from './AlertModal';

import alertsFixture from '../fixtures/alerts.json';
import routesFixture from '../fixtures/routes.json';

test('renders AlertModal', () => {
  render(
    <Router>
      <AlertModal alerts={alertsFixture} routes={routesFixture.data} show={true} onHide={() => console.log('Hidden!')} />
    </Router>,
  );
});

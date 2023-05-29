/* globals test */

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import AlertModal from './AlertModal';

const alertsFixture = require('../fixtures/alerts.json');
const routesFixture = require('../fixtures/routes.json');

test('renders AlertModal', () => {
  const div = document.createElement('div');
  const root = createRoot(div);
  root.render(
    <Router>
      <AlertModal alerts={alertsFixture} routes={routesFixture.data} show={true} onHide={() => console.log('Hidden!')} />
    </Router>,
  );
});

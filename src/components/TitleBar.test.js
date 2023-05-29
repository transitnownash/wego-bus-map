/* globals test, expect */

import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import TitleBar from './TitleBar';

test('renders TitleBar', () => {
  const { container } = render(
    <Router>
      <TitleBar />
    </Router>,
  );
  expect(container).toMatchSnapshot();
});

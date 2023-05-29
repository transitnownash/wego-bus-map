/* globals test, expect */

import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Footer from './Footer';

test('renders Footer', () => {
  const { container } = render(
    <Router>
      <Footer />
    </Router>,
  );
  expect(container).toMatchSnapshot();
});

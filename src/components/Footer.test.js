/* globals test, expect */

import React from 'react';
import Footer from './Footer';
import { render } from '@testing-library/react';
import { BrowserRouter as Router} from 'react-router-dom';

test('renders Footer', () => {
  const {container} = render(
    <Router>
      <Footer />
    </Router>
  );
  expect(container).toMatchSnapshot();
});

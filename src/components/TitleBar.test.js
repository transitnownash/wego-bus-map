/* globals test, expect */

import React from 'react';
import TitleBar from './TitleBar';
import { render } from '@testing-library/react';
import { BrowserRouter as Router} from 'react-router-dom';

test('renders TitleBar', () => {
  const {container} = render(
    <Router>
      <TitleBar />
    </Router>
  );
  expect(container).toMatchSnapshot();
});

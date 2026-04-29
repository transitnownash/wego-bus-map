import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import MapLinks from './MapLinks';

test('renders MapLinks', () => {
  const { container } = render(
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <MapLinks />
    </Router>,
  );
  expect(container).toMatchSnapshot();
});

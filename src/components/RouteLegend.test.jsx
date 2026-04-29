import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import RouteLegend from './RouteLegend';

test('renders RouteLegend', () => {
  const { container } = render(
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <RouteLegend />
    </Router>,
  );
  expect(container).toMatchSnapshot();
});

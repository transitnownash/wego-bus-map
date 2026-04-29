import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import StopCode from './StopCode';
import stopFixture from '../fixtures/stop-10AHERNN.json';

test('renders StopCode', () => {
  const { container } = render(
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <StopCode stop={stopFixture} />
    </Router>,
  );
  expect(screen.getByText('10AHERNN')).toBeInTheDocument();
  expect(container).toMatchSnapshot();
});

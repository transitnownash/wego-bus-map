import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import TitleBar from './TitleBar';

test('renders TitleBar', () => {
  const { container } = render(
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <TitleBar />
    </Router>,
  );
  expect(container).toMatchSnapshot();
});

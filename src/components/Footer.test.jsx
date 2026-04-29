import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Footer from './Footer';

test('renders Footer', () => {
  const { container } = render(
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Footer />
    </Router>,
  );
  expect(container).toMatchSnapshot();
});

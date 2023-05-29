/* globals test, expect */

import React from 'react';
import { render } from '@testing-library/react';
import TimePointLegend from './TimePointLegend';

test('renders TimePointLegend', () => {
  const { container } = render(
    <TimePointLegend />,
  );
  expect(container).toMatchSnapshot();
});

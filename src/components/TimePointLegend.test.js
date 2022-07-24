/* globals test, expect */

import React from 'react';
import TimePointLegend from './TimePointLegend';
import { render } from '@testing-library/react';

test('renders TimePointLegend', () => {
  const {container} = render(
    <TimePointLegend />
  );
  expect(container).toMatchSnapshot();
});
